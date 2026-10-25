import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supportAgent, reviewDb, input, rate, state, mutate, notifySupport, isUUID, SupportError } from '@/lib/liveSupport';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status=200) => NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const fail = (error: unknown) => error instanceof SupportError ? json({error:error.message},error.status) : json({error:'Support is temporarily unavailable.'},503);
export async function GET(request: Request) {
 try {
  const actor=await supportAgent(); const db=reviewDb(); await rate(db,'agent-read:'+actor.id,120);
  const params=new URL(request.url).searchParams; const id=params.get('id');
  if(id) {
   const after=Number(params.get('after')||0);
   if(!isUUID(id)||!Number.isSafeInteger(after)||after<0) return json({error:'Invalid conversation cursor.'},400);
   return json(await state(db,id,after,true));
  }
  const before=params.get('before');
  let cursor: {id:string; time:string} | null=null;
  if(before) {
   try { cursor=JSON.parse(Buffer.from(before,'base64url').toString()); }
   catch { return json({error:'Invalid page cursor.'},400); }
   if(!cursor||!isUUID(cursor.id)||typeof cursor.time!=='string'||!/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|\+00:00)$/.test(cursor.time)||!Number.isFinite(Date.parse(cursor.time))) return json({error:'Invalid page cursor.'},400);
  }
  let query=db.from('support_inbox').select('*').order('updated_at',{ascending:false}).order('id',{ascending:false}).limit(51);
  if(cursor) query=query.or(`updated_at.lt.${cursor.time},and(updated_at.eq.${cursor.time},id.lt.${cursor.id})`);
  const {data,error}=await query;
  if(error) throw new SupportError(503,'Inbox unavailable.');
  const rows=data||[]; const page=rows.slice(0,50);
  const last=page.at(-1);
  return json({conversations:page,next:rows.length>50&&last?Buffer.from(JSON.stringify({id:last.id,time:last.updated_at})).toString('base64url'):null});
 }catch(error){return fail(error);}
}
export async function POST(request: Request) {
 try {
  const actor=await supportAgent(); const body=await input(request); const db=reviewDb(); await rate(db,'agent-write:'+actor.id,60);
  if(body.action==='presence') {
   const {error}=body.available===false ? await db.from('support_presence').delete().eq('admin_id',actor.id) : await db.from('support_presence').upsert({admin_id:actor.id,seen_at:new Date().toISOString()});
   if(error) throw new SupportError(503,'Availability could not be saved.');
   return json({ok:true});
  }
  if(!isUUID(body.id)||!['message','accept','resolve','reopen','release','seen','retry_notification'].includes(body.action)) return json({error:'Invalid operation.'},400);
  if(body.action==='message' && (!isUUID(body.request_id)||typeof body.text!=='string'||!body.text.trim()||body.text.length>4000)) return json({error:'Invalid message.'},400);
  if(body.action==='seen'&&(!Number.isSafeInteger(body.seen)||body.seen<0)) return json({error:'Invalid seen cursor.'},400);
  if(body.action==='retry_notification') await notifySupport(db,body.id);
  else await mutate(db,body.id,null,actor.id,body.action,body.request_id||randomUUID(),body.action==='seen'?String(body.seen):body.text||'');
  return json({ok:true});
 }catch(error){return fail(error);}
}
