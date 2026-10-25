import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';
const secret='local-test-secret-'.repeat(4);
function compile(path, dependencies, globals={}) {
 const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
 {exports,require:name=>dependencies[name],Buffer,...globals});return exports;
}
function sessionFixture(row={id:'admin-id',role:'full_access_admin',is_active:true}) {
 let token;let stored=row;const calls=[];
 const query={select(){return this},eq(){return this},maybeSingle:async()=>({data:stored})};
 const session=compile('src/lib/reviewServer.ts',{
  'server-only':{},'node:crypto':crypto,'@supabase/supabase-js':{createClient:()=>({from:table=>{calls.push(table);return query}})},
  'next/headers':{cookies:async()=>({get:()=>token?{value:token}:undefined})},
 },{process:{env:{ADMIN_SESSION_SECRET:secret,NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'fake-test-key'}}});
 const signed = payload => {const encoded=Buffer.from(typeof payload==='string'?payload:JSON.stringify(payload)).toString('base64url');return encoded+'.'+crypto.createHmac('sha256',secret).update(encoded).digest('base64url')};
 return {session,calls,signed,setToken:value=>token=value,setRow:value=>stored=value};
}
function api(admin, rpcResult={data:[],error:null}) {
 const calls=[];
 const query={select(){return this},insert(){return this},update(){return this},delete(){return this},eq(){return this},limit(){return this},
 then:resolve=>Promise.resolve({data:[{id:'lead-id'}],error:null,status:200}).then(resolve)};
 const route=compile('app/api/private-data/route.ts',{'node:crypto':crypto,'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}},
  '@/lib/reviewServer':{currentAdmin:admin,currentEngineer:async()=>null,reviewDb:()=>({from:table=>{calls.push(table);return query},rpc:async (name,args)=>{calls.push(name);calls.push(args);return rpcResult}})}});
 return {calls,post:body=>route.POST({json:async()=>body,headers:new Headers()})};
}
for(const role of ['super_admin','support_admin','full_access_admin','billing_admin','admin','unknown']) {
 for(const table of ['customers','customer_segments','leads'])for(const action of ['select','insert','update','delete'])test(`${role}: CRM ${table} ${action}`,async()=>{
  const {post,calls}=api(async()=>({id:'admin-id',role}));const r=await post({table,action,payload:{name:'Test'},filters:[{op:'eq',column:'id',value:'lead-id'}]});
  const allowed=['super_admin','support_admin','full_access_admin'].includes(role);
  assert.equal(r.status,allowed?200:403);assert.equal(calls.includes(table),allowed);
 });
}
test('CRM role does not inherit support, billing or super-admin permissions',async()=>{
 const {post,calls}=api(async()=>({id:'admin-id',role:'full_access_admin'}));
 for(const body of [{table:'support_tickets',action:'select'},{table:'service_invoices',action:'select'},{table:'admin_settings',action:'select'},
   {kind:'rpc',name:'check_expiring_amcs'},{kind:'rpc',name:'update_ticket_admin'}])assert.equal((await post(body)).status,403);
 assert.equal(calls.length,0);
});
test('signed session uses current stored role, never cookie role or stale role',async()=>{
 const f=sessionFixture();f.setToken(f.session.createAdminToken({id:'admin-id',role:'super_admin'}));
 assert.equal((await f.session.currentAdmin()).role,'full_access_admin');
 f.setRow({id:'admin-id',role:'billing_admin',is_active:true});assert.equal((await f.session.currentAdmin()).role,'billing_admin');
 f.setRow({id:'admin-id',role:'super_admin',is_active:false});assert.equal(await f.session.currentAdmin(),null);
 f.setRow(null);assert.equal(await f.session.currentAdmin(),null);
});
test('invalid sessions return 401 without protected data/RPC dispatch',async()=>{
 const f=sessionFixture();const valid=f.session.createAdminToken({id:'admin-id',role:'super_admin'});
 const tokens=[undefined,'malformed',valid+'.extra',valid.split('.')[0]+'.wrong',
  f.signed({id:'admin-id',exp:Date.now()-1000}),f.signed({id:42,exp:Date.now()+60000}),
  f.signed({id:'admin-id',exp:String(Date.now()+60000)}),f.signed({exp:Date.now()+60000}),f.signed('not JSON')];
 for(const token of tokens)for(const action of ['select','update']){f.setToken(token);const a=api(f.session.currentAdmin);
  assert.equal((await a.post({table:'leads',action,payload:{name:'Test'},filters:[{op:'eq',column:'id',value:'lead-id'}]})).status,401);assert.equal(a.calls.length,0);
 }
});

for(const storedRole of ['full_access_admin','admin'])test(`signed session to session API and CRM reads/writes: ${storedRole}`,async()=>{
 const f=sessionFixture({id:'admin-id',role:storedRole,is_active:true});
 // A cookie role claim must never override the current database assignment.
 f.setToken(f.session.createAdminToken({id:'admin-id',role:storedRole==='admin'?'full_access_admin':'admin'}));
 const sessionApi=compile('app/api/admin/session/route.ts',{
  'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}},
  'node:crypto':crypto,'otplib':{},'@/lib/reviewServer':f.session,
 });
 const status=await sessionApi.GET();assert.equal(status.status,200);assert.equal(status.body.admin.role,storedRole);
 for(const action of ['select','update'])for(const table of ['customers','customer_segments','leads']){
  const a=api(f.session.currentAdmin);const r=await a.post({table,action,payload:{name:'Test'},filters:[{op:'eq',column:'id',value:'lead-id'}],role:'super_admin'});
  assert.equal(r.status,storedRole==='full_access_admin'?200:403);
  if(storedRole==='admin'){
   assert.equal(r.body.error.code,'CRM_ROLE_REQUIRED');assert.equal(r.body.error.details,table+'.'+action);
   assert.ok(r.body.error.message.includes('Current role: admin'));assert.equal(a.calls.length,0);
  }
 }
});
test('only super-admin may assign a CRM role through the API',async()=>{
 for(const role of ['admin','full_access_admin','support_admin','billing_admin','super_admin']){
  const a=api(async()=>({id:'admin-id',role}));
  const r=await a.post({table:'admin_users',action:'update',payload:{role:'full_access_admin'},filters:[{op:'eq',column:'id',value:'other-admin'}]});
  assert.equal(r.status,role==='super_admin'?200:403);assert.equal(a.calls.includes('assign_admin_role'),role==='super_admin');
 }
});
test('role updates reject self, bulk, ambiguous filters and upsert before dispatch',async()=>{
 for(const body of [
  {action:'update',filters:[{op:'eq',column:'id',value:'admin-id'}]},
  {action:'update',filters:[]},
  {action:'update',filters:[{op:'neq',column:'id',value:'other-admin'}]},
  {action:'upsert',payload:{id:'admin-id',role:'super_admin'}},
 ]){
  const a=api(async()=>({id:'admin-id',role:'super_admin'}));
  const r=await a.post({table:'admin_users',payload:{role:'full_access_admin'},...body});
  assert.equal(r.status,403);assert.equal(a.calls.length,0);
 }
});
test('role assignment database function restricts callers and audits transactionally',()=>{
 const sql=fs.readFileSync('supabase/migrations/00043_audited_admin_role_assignment.sql','utf8');
 assert.match(sql,/REVOKE ALL[\s\S]*FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/GRANT EXECUTE[\s\S]*TO service_role/);
 assert.match(sql,/actor\.role IS DISTINCT FROM 'super_admin'/);
 assert.match(sql,/p_actor_id = p_target_id/);
 assert.match(sql,/INSERT INTO public\.activity_logs/);
 assert.doesNotMatch(sql,/EXCEPTION WHEN/);
});
test('role assignment binds the verified actor and fails closed on database failure',async()=>{
 for(const error of [null,{message:'Audit insert failed'}]){
  const a=api(async()=>({id:'verified-super',role:'super_admin'}),{data:null,error});
  const r=await a.post({table:'admin_users',action:'update',payload:{role:'full_access_admin'},
   p_actor_id:'forged-actor',filters:[{op:'eq',column:'id',value:'other-admin'}]});
  assert.equal(r.status,error?400:200);
  assert.equal(a.calls[0],'assign_admin_role');
  assert.equal(a.calls[1].p_actor_id,'verified-super');
  assert.equal(a.calls[1].p_target_id,'other-admin');
  assert.equal(a.calls.includes('admin_users'),false);
 }
});
