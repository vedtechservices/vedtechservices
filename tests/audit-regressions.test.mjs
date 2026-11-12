import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
function compile(path, deps, globals={}) {
 const exports={};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {exports,require:name=>{if(!(name in deps))throw Error(`Unexpected import ${name}`);return deps[name]},Buffer,Request,Response,Headers,URL,console,...globals});
 return exports;
}
const next={NextResponse:{json:(body,init={})=>({body,status:init.status||200})}};
function dataFixture({role=null,employee=false,customer=false,assigned=true}={}) {
 const calls=[];
 function from(table) {
  calls.push(['from',table]);
  const query={};
  for(const op of ['select','insert','upsert','update','delete','eq','neq','ilike','in','order','limit'])query[op]=(...args)=>{calls.push([op,...args]);return query};
  query.maybeSingle=async()=>({data:table==='customers'?{id:'customer-id',email:'user_%@example.invalid'}:assigned?{id:'repair-id'}:null,error:null});
  query.then=resolve=>Promise.resolve({data:[],error:null}).then(resolve);
  return query;
 }
 const route=compile('app/api/private-data/route.ts',{'node:crypto':crypto,'next/server':next,
  '@/lib/reviewServer':{currentAdmin:async()=>role?{id:'admin-id',role}:null,currentEngineer:async()=>employee?{id:'employee-id'}:null,
   reviewDb:()=>({from,auth:{getUser:async()=>({data:{user:{email:'user_%@example.invalid',email_confirmed_at:'2026-01-01'}}})}})}});
 return {calls,post:body=>route.POST({json:async()=>body,headers:new Headers(customer?{authorization:'Bearer test-token'}:{})})};
}
for(const table of ['service_invoices','amc_subscriptions'])test(`customer reads only own ${table}, cannot mutate`,async()=>{
 const f=dataFixture({customer:true});
 assert.equal((await f.post({table,action:'select'})).status,200);
 assert.ok(f.calls.some(([op,key,value])=>op==='eq'&&key==='customer_id'&&value==='customer-id'));
 for(const action of ['insert','update','delete','upsert'])assert.equal((await f.post({table,action,payload:{status:'paid'},filters:[{op:'eq',column:'id',value:'other'}]})).status,403);
});
test('ownership email treats underscore and percent literally',async()=>{
 const f=dataFixture({customer:true});assert.equal((await f.post({table:'support_tickets',action:'select'})).status,200);
 const emailFilters=f.calls.filter(([op])=>op==='ilike');assert.equal(emailFilters.length,2);
 for(const [,column,value] of emailFilters){assert.equal(column,'email');assert.equal(value,'user\\_\\%@example.invalid');}
});
for(const table of ['support_tickets','hardware_repairs','engineer_notifications','part_requests'])for(const action of ['delete','upsert'])test(`employee cannot ${action} ${table}`,async()=>{
 const f=dataFixture({employee:true});assert.equal((await f.post({table,action,payload:{},filters:[{op:'eq',column:'id',value:'record'}]})).status,403);assert.equal(f.calls.length,0);
});
test('employee part requests require own repair and server-authored pending status',async()=>{
 const body={table:'part_requests',action:'insert',payload:{repair_id:'repair-id',item_id:'item-id',quantity:2,engineer_id:'other',status:'approved',admin_notes:'forged'}};
 const denied=dataFixture({employee:true,assigned:false});assert.equal((await denied.post(body)).status,403);assert.ok(!denied.calls.some(([op])=>op==='insert'));
 const f=dataFixture({employee:true});assert.equal((await f.post(body)).status,200);
 const row=f.calls.find(([op])=>op==='insert')[1];assert.equal(row.engineer_id,'employee-id');assert.equal(row.status,'pending');assert.equal(row.admin_notes,undefined);
 assert.ok(f.calls.some(([op,key,value])=>op==='eq'&&key==='assigned_engineer_id'&&value==='employee-id'));
 for(const quantity of [0,-1,1.5,1001])assert.equal((await f.post({...body,payload:{...body.payload,quantity}})).status,400);
});
test('embedded relations cannot bypass CRM/customer/employee role boundaries',async()=>{
 for(const [identity,table,columns] of [[{role:'full_access_admin'},'customers','*,service_invoices(*)'],[{employee:true},'engineers','*,admin_users(*)'],[{customer:true},'customers','*,support_tickets(*)'],[{role:'admin'},'inventory_items','*,customers(*)']]) {
  const f=dataFixture(identity);assert.equal((await f.post({table,action:'select',columns})).status,403);
 }
 const f=dataFixture({customer:true});assert.equal((await f.post({table:'amc_subscriptions',action:'select',columns:'id,amc_plans(name)'})).status,200);
});
test('admin login never returns or logs raw backend errors',async()=>{
 const logs=[];const route=compile('app/api/admin/session/route.ts',{'node:crypto':crypto,'otplib':{},'next/server':next,
 '@/lib/reviewServer':{reviewDb:()=>{throw Error('private diagnostic must not escape')}}},{console:{error:(...args)=>logs.push(args)}});
 const r=await route.POST({json:async()=>({email:'admin@example.invalid',password:'password'})});
 assert.equal(r.status,503);assert.ok(!JSON.stringify(r).includes('private diagnostic'));assert.equal(logs.length,0);
 assert.equal((await route.POST({json:async()=>({email:'a',password:'x'.repeat(257)})})).status,400);
});
test('support functions enforce role boundary before invoking providers',async()=>{
 for(const role of ['admin','billing_admin','full_access_admin','unknown','support_admin','super_admin']) {
  const calls=[];const route=compile('app/api/private-functions/route.ts',{'next/server':next,'@/lib/reviewServer':{currentAdmin:async()=>({role}),reviewDb:()=>({functions:{invoke:async(name)=>{calls.push(name);return {data:{ok:true}}}}})}});
  for(const name of ['send-admin-reply','monitor-slas','preview-sla-email','ai-kb-assistant'])assert.equal((await route.POST({json:async()=>({name}),headers:new Headers()})).status,['support_admin','super_admin'].includes(role)?200:403);
  assert.equal(calls.length,['support_admin','super_admin'].includes(role)?4:0);
 }
});
test('cross-origin private mutations fail before authentication/database/provider dispatch',async()=>{
 for(const path of ['app/api/private-data/route.ts','app/api/private-functions/route.ts']){
  const route=compile(path,{'node:crypto':crypto,'next/server':next,'@/lib/reviewServer':{currentAdmin:()=>{throw Error('must reject before auth')}}});
  const response=await route.POST(new Request('https://vedtechservices.in/api/private-data',{method:'POST',headers:{origin:'https://untrusted.invalid'},body:'{}'}));
  assert.equal(response.status,403);
 }
});
test('misplaced nested legacy webhook is retired without database or email work',async()=>{
 const handler=edge('supabase/functions/supabase/functions/ai-kb-assistant/index.ts');
 assert.equal((await handler(new Request('https://example.invalid',{method:'POST',body:'[]'}))).status,410);
 assert.equal((await handler(new Request('https://example.invalid',{method:'OPTIONS'}))).status,204);
});
function edge(path, env={}, dbFactory=()=>{throw Error('Unexpected database access')}) {
 let handler;compile(path,{'https://deno.land/std@0.168.0/http/server.ts':{serve:fn=>handler=fn},'https://esm.sh/@supabase/supabase-js@2':{createClient:dbFactory},'jsr:@supabase/supabase-js@2':{createClient:dbFactory},'node:crypto':crypto,'node:buffer':{Buffer}},
 {Deno:{serve:fn=>handler=fn,env:{get:name=>env[name]}},fetch:()=>{throw Error('Unexpected provider request')}});
 return handler;
}
for(const name of ['monitor-slas','preview-sla-email'])test(`${name} denies unauthorized request before helper/DB/provider work`,async()=>{
 const handler=edge(`supabase/functions/${name}/index.ts`,{SUPABASE_SERVICE_ROLE_KEY:'local-test-key'});
 for(const headers of [{},{authorization:'Bearer wrong'}])assert.equal((await handler(new Request('https://example.invalid',{method:'POST',headers,body:'{}'}))).status,401);
 assert.equal((await handler(new Request('https://example.invalid',{method:'OPTIONS'}))).status,200);
});
test('SendGrid webhook verifies original bytes and rejects unsigned/tampered input before DB',async()=>{
 const {privateKey,publicKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 const key=publicKey.export({type:'spki',format:'der'}).toString('base64');
 const raw='[\n]';const timestamp='1792520000';const signature=crypto.sign('sha256',Buffer.from(timestamp+raw),privateKey).toString('base64');
 let dbCalls=0;const handler=edge('supabase/functions/sendgrid-webhook/index.ts',{SENDGRID_WEBHOOK_PUBLIC_KEY:key},()=>{dbCalls++;return {}});
 const req=(body,headers={})=>new Request('https://example.invalid',{method:'POST',headers,body});
 assert.equal((await handler(req(raw))).status,401);
 const headers={'x-twilio-email-event-webhook-signature':signature,'x-twilio-email-event-webhook-timestamp':timestamp};
 assert.equal((await handler(req('[]',headers))).status,401);assert.equal(dbCalls,0);
 assert.equal((await handler(req(raw,headers))).status,200);assert.equal(dbCalls,1);
 assert.equal((await edge('supabase/functions/sendgrid-webhook/index.ts')(req(raw))).status,503);
});
test('AMC renewal keeps billing navigation without simulated payment UI or writes',()=>{
 const source=fs.readFileSync('src/views/CustomerDashboard.tsx','utf8');
 assert.ok(source.includes('Online renewal is not configured'));
 assert.ok(source.includes("navigate('/contact')"));
 assert.doesNotMatch(source,/clientSecret|setPaymentSuccess|Card Number|CVV|Secured by Stripe|create-stripe-payment-intent/);
 assert.ok(fs.readFileSync('src/routes.tsx','utf8').includes("path: '/admin/billing'"));
});

test('quoted relation selectors cannot bypass data guards',async()=>{
 const f=dataFixture({role:'full_access_admin'});
 assert.equal((await f.post({table:'customers',action:'select',columns:'*,"service_invoices"(*)'})).status,403);
 assert.equal(f.calls.length,0);
});
test('customer upserts are denied for all owned tables',async()=>{
 for(const table of ['customers','support_tickets','customer_notifications','hardware_repairs','customer_feedback']) {
  const f=dataFixture({customer:true});
  assert.equal((await f.post({table,action:'upsert',payload:{id:'other-id'}})).status,403);
  assert.ok(!f.calls.some(([op])=>op==='upsert'));
 }
});
test('ticket feedback uses the UUID foreign key, strips forged fields and checks ownership',async()=>{
 const body={table:'customer_feedback',action:'insert',payload:{ticket_id:'ticket-uuid',rating:5,review_text:'Helpful service',customer_id:'other',employee_id:'forged',sentiment_score:1}};
 const denied=dataFixture({customer:true,assigned:false});assert.equal((await denied.post(body)).status,403);
 const f=dataFixture({customer:true});assert.equal((await f.post(body)).status,200);
 assert.ok(f.calls.some(([op,column,value])=>op==='eq'&&column==='id'&&value==='ticket-uuid'));
 const row=f.calls.find(([op])=>op==='insert')[1];assert.equal(row.customer_id,'customer-id');assert.equal(row.employee_id,null);assert.equal(row.sentiment_score,undefined);
 assert.equal((await f.post({...body,payload:{...body.payload,review_text:'x'.repeat(4001)}})).status,400);
});

test('signed SendGrid batches report database failures instead of acknowledging success',async()=>{
 const {privateKey,publicKey}=crypto.generateKeyPairSync('ec',{namedCurve:'prime256v1'});
 const env={SENDGRID_WEBHOOK_PUBLIC_KEY:publicKey.export({type:'spki',format:'der'}).toString('base64')};
 const raw=JSON.stringify([{email:'test@example.invalid',event:'delivered',timestamp:1792520000,sg_event_id:'event-test',sg_message_id:'message-test'}]);
 const timestamp='1792520000';const signature=crypto.sign('sha256',Buffer.from(timestamp+raw),privateKey).toString('base64');
 const handler=edge('supabase/functions/sendgrid-webhook/index.ts',env,()=>({from:()=>({insert:async()=>({error:{code:'database-unavailable'}})})}));
 const response=await handler(new Request('https://example.invalid',{method:'POST',headers:{'x-twilio-email-event-webhook-signature':signature,'x-twilio-email-event-webhook-timestamp':timestamp},body:raw}));
 assert.equal(response.status,503);const body=await response.json();assert.equal(body.success,false);assert.equal(body.processed,0);assert.equal(body.failed,1);
});

test('credential fields cannot be exposed through selector aliases, including super-admin requests',async()=>{
 for(const role of ['support_admin','super_admin'])for(const field of ['password_hash','totp_secret','reset_code','reset_code_expires','auth_version']) {
  const f=dataFixture({role});const r=await f.post({table:'engineers',action:'select',columns:'id,public_value:'+field});
  assert.equal(r.status,403);assert.equal(f.calls.length,0);
 }
});
