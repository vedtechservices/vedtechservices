import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { owner, conversation, state, mutate, aiReply, notifySupport, start, input, rate, reviewDb, supportCookie, SupportError, isUUID } from '@/lib/liveSupport';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
const fail = (error: unknown) => error instanceof SupportError ? json({error:error.message,code:error.code},error.status) : json({error:'Support is temporarily unavailable.',code:'SUPPORT_UNAVAILABLE'},503);
export async function GET(request: Request) {
 try {
  const hash=await owner(); if(!hash) return json({error:'Start a conversation first.'},401);
  const db=reviewDb(); await rate(db,'read:'+hash,90);
  const c=await conversation(db,hash); if(!c) return json({error:'Conversation not found.'},404);
  const after=Number(new URL(request.url).searchParams.get('after')||0);
  if(!Number.isSafeInteger(after)||after<0) return json({error:'Invalid cursor.'},400);
  return json(await state(db,c.id,after));
 } catch(error) { return fail(error); }
}
export async function POST(request: Request) {
 try {
  const body=await input(request); const db=reviewDb();
  if(body.action==='start') {
   const created=await start(db,request); const response=json({id:created.id});
   if(created.secret) response.cookies.set(supportCookie,created.secret,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/api/chat',maxAge:60*60*24*30});
   return response;
  }
  const hash=await owner(); if(!hash) return json({error:'Start a conversation first.'},401);
  await rate(db,'write:'+hash,20);
  const c=await conversation(db,hash); if(!c) return json({error:'Conversation not found.'},404);
  if(!['message','handoff','seen','retry_notification'].includes(body.action)) return json({error:'Unsupported operation.'},400);
  if(body.action==='seen'&&(!Number.isSafeInteger(body.seen)||body.seen<0)) return json({error:'Invalid seen cursor.'},400);
  if(body.action==='message' && (!isUUID(body.request_id)||typeof body.text!=='string'||!body.text.trim()||body.text.length>4000)) return json({error:'Invalid message.'},400);
  if(body.action==='handoff' && (typeof body.name!=='string'||!body.name.trim()||body.name.length>100||typeof body.email!=='string'||body.email.length>254||!/^\S+@\S+\.\S+$/.test(body.email)||typeof body.issue!=='string'||!body.issue.trim()||body.issue.length>2000)) return json({error:'Enter a name, valid email and issue.'},400);
  if(body.action==='retry_notification') {
   if(!['pending','active'].includes(c.status)) return json({error:'No pending handoff.'},409);
   await notifySupport(db,c.id);
  } else {
   const result=await mutate(db,c.id,hash,null,body.action,body.request_id||randomUUID(),body.action==='handoff'?body.issue:body.action==='seen'?String(body.seen):body.text||'',{name:body.name,email:body.email});
   if(result?.generate) await aiReply(db,c.id,hash,body.request_id);
   if(body.action==='handoff') await notifySupport(db,c.id);
  }
  return json({ok:true});
 } catch(error) { return fail(error); }
}
