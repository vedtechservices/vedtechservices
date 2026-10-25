import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync('app/api/contact/route.ts', 'utf8');
function load(error = null) {
  const calls = [], exports = {};
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, Buffer, require: name => name === 'next/server' ? {
    NextResponse: { json: (body, init = {}) => ({ body, status: init.status || 200 }) },
  } : { reviewDb: () => ({ rpc: async (...args) => { calls.push(args); return { error }; } }) } });
  return { post: body => exports.POST({ text: async () => JSON.stringify(body) }), calls };
}
const input = { requestId: 'a7f9808f-7186-4353-96a3-89ec3509c2d0', name: ' Test ', email: 'TEST@example.com', message: 'Please contact me' };
test('valid submission invokes atomic RPC with normalized email and retry ID', async () => {
 const {post,calls}=load(); assert.equal((await post(input)).body.success,true);
 assert.equal(calls.length,1); assert.equal(calls[0][0],'submit_website_inquiry');
 assert.equal(calls[0][1].p_email,'test@example.com'); assert.equal(calls[0][1].p_request_id,input.requestId);
});
test('invalid submission never writes', async () => {
 const {post,calls}=load(); assert.equal((await post({...input,email:'bad'})).status,400);
 assert.equal((await post({...input,requestId:''})).status,400); assert.equal(calls.length,0);
});
test('database failure returns error without exposing internal details', async () => {
 const {post}=load({message:'secret detail'}); const r=await post(input);
 assert.equal(r.status,503); assert.equal(r.body.success,undefined); assert.ok(!r.body.error.includes('secret detail'));
});

test('malformed shape and oversized payload never reach database', async () => {
 const {post,calls}=load(); assert.equal((await post(null)).status,400);
 assert.equal((await post([])).status,400);
 assert.equal((await post({...input,message:'x'.repeat(17000)})).status,413);
 assert.equal(calls.length,0);
});


test('field types and overlong values are rejected rather than truncated', async () => {
 const {post,calls}=load();
 for(const patch of [{phone:42},{name:'x'.repeat(101)},{message:'x'.repeat(4001)},{requestId:input.requestId+'extra'}]) {
  assert.equal((await post({...input,...patch})).status,400);
 }
 assert.equal(calls.length,0);
});
test('durable database rate limit returns 429, never success', async () => {
 const {post}=load({code:'P0429',message:'internal detail'});
 const r=await post(input);assert.equal(r.status,429);assert.equal(r.body.success,undefined);
});
