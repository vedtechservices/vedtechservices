// Starts only the isolated local production artifact. No authenticated DB calls.
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const port=3217;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port',String(port)],{
  env:{...process.env,VEDTECH_BUILD_DIR:'.next-support-build'},windowsHide:true,stdio:['ignore','ignore','ignore'],
});
let failed;
server.on('error',error=>{failed=error;});
try {
 let ready=false;
 for(let attempt=0;attempt<40;attempt++){
  if(failed)throw failed;
  try{const response=await fetch(`http://localhost:${port}/api/chat/session`);if(response.status===401){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,500));
 }
 assert.equal(ready,true,'Isolated production server did not start');
 for(const path of ['/api/chat/session?token=forged','/api/admin/support','/api/admin/session']){
  const response=await fetch(`http://localhost:${port}${path}`);assert.equal(response.status,401,path);
 }
 const denied=await fetch(`http://localhost:${port}/api/chat/session`,{method:'POST',headers:{origin:'https://evil.invalid'},body:'{}'});
 assert.equal(denied.status,403);
 const home=await fetch(`http://localhost:${port}/`);assert.equal(home.status,200);
 console.log('PASS: isolated production HTTP smoke test: homepage, unauthenticated/legacy-token denials and cross-origin protection.');
}finally{server.kill();}
