import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { currentAdmin, reviewDb } from '@/lib/reviewServer';
import { answerSupport, companyFacts, wantsHuman } from '@/lib/supportAI';

export const supportCookie = 'vts_support_owner';
export const supportRoles = ['super_admin', 'support_admin'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUUID = (value: unknown): value is string => typeof value === 'string' && uuid.test(value);
export class SupportError extends Error { constructor(public status: number, message: string, public code = 'SUPPORT_UNAVAILABLE') { super(message); } }
export function supportDatabaseFailure(error: { code?: string } | null, operation: string): never {
  const backendCode = typeof error?.code === 'string' && /^[A-Z0-9]{5,10}$/.test(error.code) ? error.code : 'CONNECTION';
  const schemaMissing = ['PGRST202','PGRST204','PGRST205','42P01','42703','42883'].includes(backendCode);
  // Never log raw provider messages, connection strings, headers or visitor data.
  console.error('[live-support]', JSON.stringify({ operation, backendCode, category: schemaMissing ? 'schema_required' : 'database_unavailable' }));
  throw new SupportError(503, schemaMissing
    ? 'Support setup is incomplete. Please use /support or /contact while it is configured.'
    : 'Support is temporarily unavailable. Please retry.', schemaMissing ? 'SUPPORT_SCHEMA_REQUIRED' : 'SUPPORT_DATABASE_UNAVAILABLE');
}
let schemaReadyUntil = 0;
let schemaCheck: Promise<void> | null = null;
export async function ensureSupportSchema(db: any) {
  if (Date.now() < schemaReadyUntil) return;
  if (!schemaCheck) schemaCheck = (async () => {
    const { error } = await db.from('chat_sessions').select('id,owner_hash,status,customer_name,customer_email,issue,assigned_to,ai_request,ai_started_at,visitor_seen,agent_seen,notification_status,notification_claim,notification_payload,notification_started_at,notification_attempt_at').limit(0);
    if (error) supportDatabaseFailure(error, 'initialization_schema');
    schemaReadyUntil = Date.now() + 30000;
  })();
  try { await schemaCheck; } finally { schemaCheck = null; }
}
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export async function owner() {
  const token = (await cookies()).get(supportCookie)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}
export async function supportAgent() {
  const admin = await currentAdmin();
  if (!admin) throw new SupportError(401, 'Sign in required.');
  if (!supportRoles.includes(admin.role)) throw new SupportError(403, 'Support administrator access required.');
  return admin;
}
export async function input(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new SupportError(403, 'Invalid request origin.');
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new SupportError(403, 'Invalid request origin.');
  const reader = request.body?.getReader();
  if (!reader) throw new SupportError(400, 'Request body required.');
  let bytes = 0; const chunks: Uint8Array[] = [];
  for (;;) { const part = await reader.read(); if (part.done) break; bytes += part.value.length; if (bytes > 12000) { await reader.cancel(); throw new SupportError(413, 'Request too large.'); } chunks.push(part.value); }
  try { const value = JSON.parse(Buffer.concat(chunks).toString('utf8')); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; }
  catch { throw new SupportError(400, 'Invalid request.'); }
}
export async function rate(db: any, key: string, limit: number) {
  const { data, error } = await db.rpc('support_rate', { p_key: key, p_limit: limit });
  if (error) supportDatabaseFailure(error, 'rate_limit');
  if (!data) throw new SupportError(429, 'Too many requests. Please wait a minute.');
}
export async function conversation(db: any, hash: string) {
  const { data, error } = await db.from('chat_sessions').select('id,status,customer_name,customer_email,issue').eq('owner_hash', hash).maybeSingle();
  if (error) supportDatabaseFailure(error, 'ownership_lookup');
  return data;
}
export async function state(db: any, id: string, after = 0, agent = false) {
  const [{ data: c, error }, { data: messages, error: messageError }] = await Promise.all([
    db.from('chat_sessions').select('id,status,assigned_to,updated_at,notification_status,customer_name,customer_email,issue,ai_request,ai_started_at').eq('id', id).single(),
    db.from('support_messages').select('seq,id,sender,body,created_at').eq('conversation_id', id).gt('seq', after).order('seq').limit(100),
  ]);
  if (error || messageError) supportDatabaseFailure(error || messageError, 'conversation_read');
  let presenceQuery = db.from('support_presence').select('admin_id,admin_users!inner(role,is_active)').gt('seen_at', new Date(Date.now() - 45000).toISOString()).eq('admin_users.is_active',true).in('admin_users.role',supportRoles).limit(1);
  if (c.status === 'active') presenceQuery = presenceQuery.eq('admin_id',c.assigned_to);
  const { data: presence } = await presenceQuery;
  const generating = c.ai_request && Date.parse(c.ai_started_at) > Date.now() - 45000;
  return { conversation: { id: c.id, status: c.status, notification_status: c.notification_status, updated_at: c.updated_at, generating: !!generating,
    customer_name: c.customer_name, customer_email: c.customer_email,
    ...(agent ? { assigned_to: c.assigned_to, issue: c.issue } : {}) },
    messages: messages || [], agents_available: !!presence?.length };
}
export async function mutate(db: any, id: string, hash: string | null, actor: string | null, action: string, requestId: string, body = '', contact = {}) {
  const { data, error } = await db.rpc('support_mutate', { p_id: id, p_owner: hash, p_actor: actor, p_action: action, p_request: requestId, p_body: body, p_contact: contact });
  if (error) throw new SupportError(error.code === '42501' ? 403 : 409, 'Operation could not be completed. Refresh and retry.');
  return data;
}
export async function aiReply(db: any, id: string, hash: string, requestId: string) {
  const { data } = await db.from('support_messages').select('sender,body').eq('conversation_id',id).order('seq',{ascending:false}).limit(16);
  const history = (data || []).reverse();
  const facts = [...companyFacts];
  // Seed prices are not considered verified. Explicit operator approval is required.
  if (process.env.CHAT_VERIFIED_PRICING === 'true') {
    const { data: plans } = await db.from('amc_plans').select('id,name,price,duration_months').order('price').limit(10);
    for (const plan of plans || []) facts.push({ id: `plan-${plan.id}`, text: `Published AMC plan: ${plan.name}, INR ${plan.price} for ${plan.duration_months} months. Confirm scope and taxes with support before purchase.` });
  }
  const last = history.filter((m: any) => m.sender === 'user').at(-1)?.body || '';
  const keyword = last.replace(/[^a-zA-Z0-9 ]/g,'').split(/\s+/).filter((s: string) => s.length>4).slice(0,1)[0];
  if (keyword) {
    const { data: articles } = await db.from('knowledge_base_articles').select('id,title,content').eq('is_published',true).ilike('title',`%${keyword}%`).limit(3);
    for (const article of articles || []) facts.push({ id: `kb-${article.id}`, text: `${article.title}: ${String(article.content).replace(/<[^>]*>/g,' ').slice(0,1200)}` });
  }
  const reply = wantsHuman(last) ? 'Choose Connect to Human and enter your name, email and issue to request an agent. AI replies will pause when the handoff is submitted.' : await answerSupport(history, facts);
  await mutate(db,id,hash,null,'ai_finish',requestId,reply);
}

export async function notifySupport(db: any, id: string) {
  const { data: c } = await db.from('chat_sessions').select('customer_name,customer_email,issue,notification_status').eq('id',id).single();
  if (!c || !['pending','failed','sending'].includes(c.notification_status)) return;
  const { data: messages } = await db.from('support_messages').select('sender,body').eq('conversation_id',id).order('seq',{ascending:false}).limit(6);
  const site = process.env.SUPPORT_SITE_ORIGIN || 'https://vedtechservices.in';
  const payload = { from: process.env.SUPPORT_EMAIL_FROM || 'VedTech Services <support@vedtechservices.in>', to: process.env.SUPPORT_EMAIL_TO || 'info@vedtechservices.in',
    subject: `Human support requested — ${id.slice(0,8)}`,
    text: `Name: ${c.customer_name}\nEmail (visitor supplied, unverified): ${c.customer_email}\nIssue: ${c.issue}\n\nRecent conversation:\n${(messages || []).reverse().map((m: any) => `${m.sender}: ${m.body.slice(0,500)}`).join('\n')}\n\nSign in as a support agent to view: ${site}/admin/support-inbox?conversation=${id}\nThis link contains no visitor access token.` };
  const claim = randomUUID();
  const { data: claimed, error } = await db.rpc('support_notification',{p_id:id,p_claim:claim,p_payload:payload});
  if (error || !claimed) return;
  let result = 'failed';
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(12000),
        headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`support-handoff-${id}`},body:JSON.stringify(claimed)});
      const responseBody = await response.json().catch(()=>null);
      result = response.ok && responseBody?.id ? 'sent' : 'failed';
    } catch { result = 'failed'; }
  }
  const { error: saveError } = await db.rpc('support_notification',{p_id:id,p_claim:claim,p_result:result});
  if (saveError) throw new SupportError(503,'Notification status is uncertain. The conversation remains saved.');
}
export async function start(db: any, request: Request) {
  // Read-only preflight fails before any mutation against an unmigrated database.
  await ensureSupportSchema(db);
  // Only trust this header when the hosting proxy is configured to overwrite it.
  const address = process.env.SUPPORT_TRUST_PROXY === 'true' ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'shared';
  await rate(db,`start:${digest(address)}`,20);
  const hash = await owner();
  if (hash) { const c = await conversation(db,hash); if (c) return { id:c.id }; }
  const secret = randomBytes(32).toString('hex');
  const { data, error } = await db.from('chat_sessions').insert({session_token:randomUUID(),owner_hash:digest(secret)}).select('id').single();
  if (error) supportDatabaseFailure(error, 'session_create');
  return { id:data.id, secret };
}
export { reviewDb };
