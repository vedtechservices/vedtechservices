import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
function compile(path,dependencies={},globals={}){
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.React}}).outputText,
 {exports,require:name=>dependencies[name],Buffer,AbortSignal,URL,Headers,console,...globals});return exports;
}
function fixture({schemaError=null,rateError=null}={}){
 let stored=null,cookie=null;const calls=[],logs=[];let schema=schemaError,rateFailure=rateError;
 const query={select(){return this},eq(){return this},limit:async()=>({error:schema}),maybeSingle:async()=>({data:stored,error:null}),
  insert(row){calls.push('insert');stored={id:'stored-conversation',...row};return this},single:async()=>({data:stored,error:null})};
 const db={from:()=>query,rpc:async()=>{calls.push('rate');return {data:!rateFailure,error:rateFailure}}};
 const live=compile('src/lib/liveSupport.ts',{'server-only':{},'node:crypto':crypto,'next/headers':{cookies:async()=>({get:()=>cookie?{value:cookie}:null})},
  '@/lib/reviewServer':{reviewDb:()=>db},'@/lib/supportAI':{}},{process:{env:{}},console:{error:(...args)=>logs.push(args.join(' '))}});
 return {live,db,calls,logs,getStored:()=>stored,setCookie:value=>cookie=value,setSchema:value=>schema=value,setRate:value=>rateFailure=value};
}
test('missing migration produces a safe actionable 503 before any database mutation',async()=>{
 const f=fixture({schemaError:{code:'42703',message:'sensitive raw diagnostics must not escape'}});
 await assert.rejects(f.live.start(f.db,new Request('http://localhost/api/chat/session')),e=>e.status===503&&e.code==='SUPPORT_SCHEMA_REQUIRED');
 assert.equal(f.calls.length,0);assert.equal(f.getStored(),null);
 assert.match(f.logs[0],/42703/);assert.doesNotMatch(f.logs[0],/sensitive/);
});
test('schema failure does not poison retries; recovered initialization persists an owned session',async()=>{
 const f=fixture({schemaError:{code:'42703'}});const req=new Request('http://localhost/api/chat/session');
 await assert.rejects(f.live.start(f.db,req));f.setSchema(null);
 const created=await f.live.start(f.db,req);
 assert.equal(created.id,'stored-conversation');assert.match(created.secret,/^[a-f0-9]{64}$/);
 assert.equal(f.getStored().owner_hash,crypto.createHash('sha256').update(created.secret).digest('hex'));
 f.setCookie(created.secret);const resumed=await f.live.start(f.db,req);
 assert.equal(resumed.id,created.id);assert.equal(resumed.secret,undefined);assert.equal(f.calls.filter(c=>c==='insert').length,1);
});
test('missing rate RPC and transient connection errors remain failures and allow recovery',async()=>{
 for(const code of ['PGRST202',undefined]){
  const f=fixture({rateError:{code,message:'private connection information'}});const req=new Request('http://localhost');
  await assert.rejects(f.live.start(f.db,req),e=>e.status===503&&e.code===(code?'SUPPORT_SCHEMA_REQUIRED':'SUPPORT_DATABASE_UNAVAILABLE'));
  assert.equal(f.getStored(),null);assert.doesNotMatch(f.logs.join(' '),/private/);
  f.setRate(null);assert.equal((await f.live.start(f.db,req)).id,'stored-conversation');
 }
});
const ui=compile('src/components/common/SupportConversation.tsx',{'react':{} });
test('browser retry succeeds only after persisted history is verified using its ownership cookie',async()=>{
 let unavailable=true;const calls=[];
 const request=async(url,body)=>{calls.push(body?'start':'read');if(unavailable)throw Error('Support unavailable');return body?{id:'real-session'}:{conversation:{id:'real-session'},messages:[]};};
 await assert.rejects(ui.initializeSupport('/api/chat/session',request));assert.deepEqual(calls,['start']);
 unavailable=false;const snapshot=await ui.initializeSupport('/api/chat/session',request);
 assert.equal(snapshot.conversation.id,'real-session');assert.deepEqual(calls,['start','start','read']);
});
test('blocked/expired ownership cookie and mismatched history never produce a ready session',async()=>{
 await assert.rejects(ui.initializeSupport('/api/chat/session',async(url,body)=>{if(body)return {id:'created'};throw Error('Start a conversation first');}));
 await assert.rejects(ui.initializeSupport('/api/chat/session',async(url,body)=>body?{id:'created'}:{conversation:{id:'different'}}),/could not be verified/);
});
test('session API returns the actionable code without leaking database details',async()=>{
 const f=fixture({schemaError:{code:'42703',message:'secret diagnostics'}});
 const route=compile('app/api/chat/session/route.ts',{'node:crypto':crypto,'@/lib/liveSupport':{...f.live,input:async()=>({action:'start'})},
  'next/server':{NextResponse:{json:(body,init)=>({body,status:init.status})}}});
 const response=await route.POST(new Request('http://localhost/api/chat/session',{method:'POST',body:'{}'}));
 assert.equal(response.status,503);assert.equal(response.body.code,'SUPPORT_SCHEMA_REQUIRED');assert.doesNotMatch(JSON.stringify(response.body),/secret|42703/);
});
test('successful session API persists ownership and issues only an HttpOnly cookie',async()=>{
 const f=fixture();let issued;
 const route=compile('app/api/chat/session/route.ts',{'node:crypto':crypto,'@/lib/liveSupport':{...f.live,input:async()=>({action:'start'})},
  'next/server':{NextResponse:{json:(body,init)=>({body,status:init.status,cookies:{set:(name,value,options)=>{issued={name,value,options};}}})}}},{process:{env:{NODE_ENV:'production'}}});
 const response=await route.POST(new Request('http://localhost/api/chat/session',{method:'POST',body:'{}'}));
 assert.equal(response.status,200);assert.equal(response.body.id,f.getStored().id);
 assert.equal(Object.hasOwn(response.body,'secret'),false);assert.equal(f.getStored().owner_hash,f.live.digest(issued.value));
 assert.equal(issued.options.httpOnly,true);assert.equal(issued.options.secure,true);assert.equal(issued.options.sameSite,'strict');assert.equal(issued.options.path,'/api/chat');
});
