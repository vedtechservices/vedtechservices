// Only local unauthenticated HTTP checks; no credentials, submissions or database mutations.
import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const port=3218,base=`http://127.0.0.1:${port}`;
const env={...process.env,VEDTECH_BUILD_DIR:'.next-vedbot-ticket-build',NEXT_PUBLIC_SUPABASE_URL:'',SUPABASE_SERVICE_ROLE_KEY:'',INTEGRATIONS_API_KEY:''};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port',String(port)],{env,windowsHide:true,stdio:['ignore','ignore','ignore']});
try{let ready=false;for(let i=0;i<60;i++){try{if((await fetch(base+'/api/chat/session')).status===401){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}assert.ok(ready,'Local production artifact did not start');
for(const path of ['/api/chat/session?ticket=VTS-2026-000001','/api/chat/session?id=10000000-0000-4000-8000-000000000001','/api/admin/support?ticket=VTS-2026','/api/admin/session'])assert.equal((await fetch(base+path)).status,401,path);
const denied=await fetch(base+'/api/chat/session',{method:'POST',headers:{origin:'https://other.invalid','Content-Type':'application/json'},body:JSON.stringify({action:'ticket',confirmed:true})});assert.equal(denied.status,403);
assert.equal((await fetch(base+'/')).status,200);
console.log('PASS: local production homepage, cookie-less ticket enumeration/admin denials and cross-origin rejection with database credentials disabled.');
}finally{server.kill();}
