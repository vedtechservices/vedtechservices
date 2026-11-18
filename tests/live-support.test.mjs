import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
function compile(path,dependencies={},globals={}) {
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
 {exports,require:name=>dependencies[name],Buffer,AbortSignal,URL,Headers,setTimeout,...globals});return exports;
}
const intent=compile('src/lib/supportIntent.ts');
const ai=(key='test-key')=>compile('src/lib/supportAI.ts',{'server-only':{},'./supportIntent':intent},{process:{env:{INTEGRATIONS_API_KEY:key}},fetch:async()=>{throw Error('not configured')}});
for(const text of ['connect to human','talk to an agent','human support','speak with a person','live agent'])test(`handoff intent: ${text}`,()=>assert.equal(intent.wantsHuman(text),true));
test('AI provider disabled fails safely without making network request',async()=>{
 const m=ai('');assert.equal(await m.answerSupport([],m.companyFacts,()=>{throw Error('must not fetch')}),m.aiFallback);
});
test('unconfigured AI still answers known services from approved local facts',async()=>{
 const m=ai('');assert.equal(await m.answerSupport([{sender:'user',body:'What hardware repair do you offer?'}],m.companyFacts),m.companyFacts.find(f=>f.id==='hardware').text);
});
test('AI uses persisted history, validates sources, never renders generated claims',async()=>{
 const m=ai();let sent;
 const output=await m.answerSupport([{sender:'user',body:'Hardware?'},{sender:'user',body:'What about upgrades?'}],m.companyFacts,async(url,options)=>{
  sent=JSON.parse(options.body);assert.ok(!url.includes('test-key'));return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({sources:['hardware'],answer:'Invented price 99'})}]}}]})};
 });
 assert.equal(output,m.companyFacts.find(f=>f.id==='hardware').text);
 assert.match(sent.contents[0].parts[0].text,/What about upgrades/);
 assert.doesNotMatch(output,/Invented/);
});
for(const result of [{ok:false}, {ok:true,json:async()=>({})}, {ok:true,json:async()=>({candidates:[{content:{parts:[{text:'{"sources":["invented-price"]}'}]}}]})}])test('AI invalid/provider failure returns safe fallback',async()=>{
 const m=ai();assert.equal(await m.answerSupport([],m.companyFacts,async()=>result),m.aiFallback);
});
test('AI network failure returns safe fallback',async()=>{const m=ai();assert.equal(await m.answerSupport([],[],async()=>{throw Error('secret provider failure')}),m.aiFallback);});

function liveFixture({role='support_admin',notification='pending',mailOk=true,mailKey='test-key'}={}) {
 const calls=[];let cookie='a'.repeat(64);let mailCalls=0;
 const row={id:'session',status:'pending',notification_status:notification,customer_name:'Customer',customer_email:'x@example.invalid',issue:'Need help'};
 const query={select(){return this},eq(){return this},order(){return this},limit(){return this},
  single:async()=>({data:row,error:null}),then:resolve=>Promise.resolve({data:[{sender:'user',body:'Help <script>bad</script>'}],error:null}).then(resolve)};
 const db={from:()=>query,rpc:async(name,args)=>{calls.push({name,args});return {data:args.p_result?{}:{text:'Frozen safe text'},error:null}}};
 const exports=compile('src/lib/liveSupport.ts',{
  'server-only':{},'node:crypto':crypto,'next/headers':{cookies:async()=>({get:()=>cookie?{value:cookie}:undefined})},
  '@/lib/reviewServer':{currentAdmin:async()=>role?{id:'actor',role}:null,reviewDb:()=>db},
  '@/lib/supportAI':{answerSupport:async()=>'',companyFacts:[],...intent},
 },{process:{env:{RESEND_API_KEY:mailKey}},fetch:async(url,options)=>{mailCalls++;calls.push({url,options});return {ok:mailOk,json:async()=>mailOk?{id:'accepted'}:{error:'failure'}}}});
 return {exports,db,calls,setCookie:value=>cookie=value,mailCalls:()=>mailCalls};
}
for(const role of ['admin','full_access_admin','billing_admin','unknown',null])test(`Support Inbox rejects role ${role}`,async()=>{
 const f=liveFixture({role});await assert.rejects(f.exports.supportAgent(),e=>e.status===(role?403:401));
});
for(const role of ['support_admin','super_admin'])test(`Support Inbox accepts ${role}`,async()=>assert.equal((await liveFixture({role}).exports.supportAgent()).role,role));
test('visitor ownership uses a hash, malformed and missing cookies rejected',async()=>{
 const f=liveFixture();assert.equal(await f.exports.owner(),crypto.createHash('sha256').update('a'.repeat(64)).digest('hex'));
 f.setCookie('fake');assert.equal(await f.exports.owner(),null);f.setCookie(null);assert.equal(await f.exports.owner(),null);
});
for(const ok of [true,false])test(`handoff email ${ok?'acceptance':'failure'} recorded truthfully`,async()=>{
 const f=liveFixture({mailOk:ok});await f.exports.notifySupport(f.db,'conversation-id');
 assert.equal(f.mailCalls(),1);assert.equal(f.calls.at(-1).args.p_result,ok?'sent':'failed');
 const sent=f.calls.find(c=>c.url);assert.equal(sent.options.headers['Idempotency-Key'],'support-handoff-conversation-id');
 assert.equal(sent.options.body,JSON.stringify({text:'Frozen safe text'}));
 assert.doesNotMatch(f.calls[0].args.p_payload.text,/vts_support_owner/);
 assert.match(f.calls[0].args.p_payload.text,/admin\/support-inbox/);
});
test('missing email configuration persists failure without claiming delivery',async()=>{
 const f=liveFixture({mailKey:''});await f.exports.notifySupport(f.db,'conversation-id');assert.equal(f.mailCalls(),0);assert.equal(f.calls.at(-1).args.p_result,'failed');
});
test('already-notified handoff does not send again',async()=>{
 const f=liveFixture({notification:'sent'});await f.exports.notifySupport(f.db,'conversation-id');assert.equal(f.calls.length,0);assert.equal(f.mailCalls(),0);
});
test('notification claim held by another worker prevents concurrent email send',async()=>{
 const f=liveFixture();f.db.rpc=async()=>({data:null,error:null});await f.exports.notifySupport(f.db,'conversation-id');assert.equal(f.mailCalls(),0);
});
test('notification status save failure is reported as uncertain',async()=>{
 const f=liveFixture();const original=f.db.rpc;
 f.db.rpc=async(name,args)=>args.p_result?{error:{message:'database unavailable'}}:original(name,args);
 await assert.rejects(f.exports.notifySupport(f.db,'conversation-id'),e=>e.status===503);
});
test('cross-origin and oversized writes are rejected before parsing',async()=>{
 const m=liveFixture().exports;
 await assert.rejects(m.input(new Request('https://site.invalid/api/chat/session',{method:'POST',headers:{origin:'https://evil.invalid'},body:'{}'})),e=>e.status===403);
 await assert.rejects(m.input(new Request('https://site.invalid/api/chat/session',{method:'POST',body:'x'.repeat(12001)})),e=>e.status===413);
});

function routeFixture({hash='owner',role='support_admin'}={}){
 const calls=[];const dependency={SupportError:class extends Error{},isUUID:value=>typeof value==='string'&&/^[a-f0-9-]{36}$/i.test(value),
  owner:async()=>hash,reviewDb:()=>({}),rate:async()=>{},conversation:async()=>({id:'owned-id',status:'pending'}),
  supportAgent:async()=>{if(!['support_admin','super_admin'].includes(role))throw Error('denied');return {id:'verified-agent'};},
  input:async request=>JSON.parse(await request.text()),mutate:async(...args)=>{calls.push(args);return {};},
  state:async(...args)=>{calls.push(args);return {messages:[],conversation:{id:args[1]}};},notifySupport:async()=>{},supportCookie:'test-cookie'};
 const dependencies={'node:crypto':crypto,'@/lib/liveSupport':dependency,'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}}};
 return {calls,visitor:compile('app/api/chat/session/route.ts',dependencies),agent:compile('app/api/admin/support/route.ts',dependencies)};
}
test('visitor API ignores supplied conversation ID and binds mutation to cookie owner',async()=>{
 const f=routeFixture();const response=await f.visitor.POST(new Request('https://site.invalid/api/chat/session',{method:'POST',body:JSON.stringify({action:'message',id:'someone-else',text:'hello',request_id:crypto.randomUUID()})}));
 assert.equal(response.status,200);assert.equal(f.calls[0][1],'owned-id');assert.equal(f.calls[0][2],'owner');assert.equal(f.calls[0][3],null);
});
test('visitor cannot invoke agent or internal AI actions',async()=>{
 for(const action of ['accept','resolve','reopen','ai_finish','presence']){const f=routeFixture();const response=await f.visitor.POST(new Request('https://site.invalid',{method:'POST',body:JSON.stringify({action})}));assert.equal(response.status,400);assert.equal(f.calls.length,0);}
});
test('missing visitor session never reads protected history',async()=>{
 const f=routeFixture({hash:null});const response=await f.visitor.GET(new Request('https://site.invalid?token=forged'));assert.equal(response.status,401);assert.equal(f.calls.length,0);
});
