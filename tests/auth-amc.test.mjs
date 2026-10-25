import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function compile(source, context) {
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,context);return context.exports;
}
function route(role, body = {kind:'rpc',name:'check_expiring_amcs'}) {
 const calls=[],exports={};
 const row={id:'lead',name:'Test',lead_source:'Website Form'};
 const query={select(){return this},limit(){return this},then(resolve){return Promise.resolve({data:[row],error:null,status:200}).then(resolve)}};
 const db={from:table=>{calls.push(['from',table]);return query},rpc:async (...args)=>{calls.push(args);return {data:[],error:null}}};
 compile(fs.readFileSync('app/api/private-data/route.ts','utf8'),{exports,require:name=>{
  if(name==='next/server')return {NextResponse:{json:(body,init={})=>({body,status:init.status||200})}};
  if(name==='node:crypto')return {};
  return {reviewDb:()=>db,currentAdmin:async()=>role?{id:'admin',role}:null,currentEngineer:async()=>null};
 }});
 return {calls,post:()=>exports.POST({json:async()=>body,headers:new Headers()})};
}
for(const role of ['super_admin','billing_admin','support_admin','sales','unknown',null])test(`AMC server authorization: ${role}`,async()=>{
 const {post,calls}=route(role),r=await post();
 const allowed=['super_admin','billing_admin'].includes(role);
 assert.equal(r.status,allowed?200:role?403:401);assert.equal(calls.length,allowed?1:0);
});
// Evaluate the checked-in handler with controlled dependencies, without rendering unrelated dashboard features.
function handler(path,name,context){
 const source=fs.readFileSync(path,'utf8'),tree=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let initializer;
 function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(tree)===name)initializer=n.initializer;ts.forEachChild(n,visit)}visit(tree);
 assert.ok(initializer,`missing handler ${name}`);
 return compile(`export const handler = ${initializer.getText(tree)}`,{exports:{},...context}).handler;
}
test('AMC concurrent/replayed invocation makes one RPC, and reports failure',async()=>{
 const calls=[],toasts=[];
 const run=handler('src/views/AdminDashboard.tsx','checkAndNotifyExpiringAMCs',{
  amcCheckStarted:{current:false},supabase:{rpc:async()=>{calls.push(1);return {error:{message:'Denied'}}}},
  console:{error(){}},toast:v=>toasts.push(v),
 });
 await Promise.all([run(),run()]);await run();assert.equal(calls.length,1);assert.equal(toasts.length,1);assert.equal(toasts[0].description,'Denied');
});
function login(sent, verifyError=null){
 const calls=[];const run=handler('src/views/CustomerDashboard.tsx','handleLogin',{
  email:' customer@example.com ',otp:' 123456 ',otpSent:sent,isLoading:false,
  setIsLoading(){},setOtpSent(){},setOtp(){},toast(){},console:{error(){}},
  supabase:{auth:{signInWithOtp:async args=>{calls.push(['send',args]);return {error:null}},verifyOtp:async args=>{calls.push(['verify',args]);return {error:verifyError}}},from:()=>{calls.push(['customer']);throw new Error('stop after verified lookup')}},
 });return {run,calls};
}
test('OTP send explicitly targets production',async()=>{const {run,calls}=login(false);await run();assert.equal(calls[0][1].options.emailRedirectTo,'https://vedtechservices.in/dashboard');assert.equal(calls[0][1].email,'customer@example.com');});
test('OTP verification uses email code; invalid code cannot load customer data',async()=>{const {run,calls}=login(true,{message:'Expired'});await run();assert.deepEqual(JSON.parse(JSON.stringify(calls)),[['verify',{email:'customer@example.com',token:'123456',type:'email'}]]);});

test('valid OTP loads verified customer and initializes dashboard',async()=>{
 const calls=[];
 const run=handler('src/views/CustomerDashboard.tsx','handleLogin',{
  email:'customer@example.com',otp:'123456',otpSent:true,isLoading:false,
  setIsLoading(){},setOtpSent(){},setOtp(){},toast(){},console:{error(){}},
  setCustomerName(){},setCustomerId:id=>calls.push(['id',id]),setEmail(){},setIsLoggedIn:v=>calls.push(['loggedIn',v]),
  fetchDashboardData:()=>calls.push(['dashboard']),setupRealtimeSubscriptions:()=>calls.push(['realtime']),
  supabase:{auth:{verifyOtp:async()=>({error:null})},from:()=>({select:()=>({maybeSingle:async()=>({data:{id:'verified-customer',name:'Test',email:'customer@example.com'},error:null})})})},
 });await run();assert.deepEqual(calls,[['id','verified-customer'],['loggedIn',true],['dashboard'],['realtime']]);
});
test('contact blocks concurrent clicks and retains retry ID only for unchanged data',async()=>{
 const bodies=[];let sequence=0;
 const run=handler('src/views/Contact.tsx','onSubmit',{
  submitting:{current:false},requestId:{current:null},requestPayload:{current:null},
  crypto:{randomUUID:()=>String(++sequence)},
  fetch:async(url,options)=>{bodies.push(JSON.parse(options.body));return {ok:false,json:async()=>({error:'Retry'})}},
  toast:{error(){},success(){}},form:{reset(){}},console:{error(){}},
 });
 const data={name:'Test',email:'test@example.com',message:'First'};
 await Promise.all([run(data),run(data)]);assert.equal(bodies.length,1);
 await run(data);assert.equal(bodies[0].requestId,bodies[1].requestId);
 await run({...data,message:'Changed'});assert.notEqual(bodies[1].requestId,bodies[2].requestId);
});

for(const role of ['super_admin','support_admin','billing_admin',null])test(`CRM read authorization: ${role}`,async()=>{
 const {post,calls}=route(role,{table:'leads',action:'select',columns:'id,name,lead_source'});const r=await post();
 const allowed=['super_admin','support_admin'].includes(role);assert.equal(r.status,allowed?200:role?403:401);
 assert.equal(calls.length,allowed?1:0);if(allowed)assert.equal(r.body.data[0].lead_source,'Website Form');
});
