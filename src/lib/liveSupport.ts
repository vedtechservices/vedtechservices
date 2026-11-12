import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { currentAdmin, reviewDb } from '@/lib/reviewServer';
import { answerSupport, companyFacts } from '@/lib/supportAI';

export const supportCookie = 'vts_support_owner';
export const supportRoles = ['super_admin', 'support_admin'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUUID = (value: unknown): value is string => typeof value === 'string' && uuid.test(value);
export class SupportError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'SUPPORT_UNAVAILABLE',
  ) {
    super(message);
  }
}
export function supportDatabaseFailure(error: { code?: string } | null, operation: string): never {
  const backendCode =
    typeof error?.code === 'string' && /^[A-Z0-9]{5,10}$/.test(error.code) ? error.code : 'CONNECTION';
  const schemaMissing = ['PGRST202', 'PGRST204', 'PGRST205', '42P01', '42703', '42883'].includes(backendCode);
  // Never log raw provider messages, connection strings, headers or visitor data.
  console.error(
    '[live-support]',
    JSON.stringify({
      operation,
      backendCode,
      category: schemaMissing ? 'schema_required' : 'database_unavailable',
    }),
  );
  throw new SupportError(
    503,
    schemaMissing
      ? 'Support setup is incomplete. Please use /support or /contact while it is configured.'
      : 'Support is temporarily unavailable. Please retry.',
    schemaMissing ? 'SUPPORT_SCHEMA_REQUIRED' : 'SUPPORT_DATABASE_UNAVAILABLE',
  );
}
let schemaReadyUntil = 0;
let schemaCheck: Promise<void> | null = null;
export async function ensureSupportSchema(db: any) {
  if (Date.now() < schemaReadyUntil) return;
  if (!schemaCheck)
    schemaCheck = (async () => {
      const { error } = await db
        .from('chat_sessions')
        .select(
          'id,owner_hash,status,customer_name,customer_email,issue,assigned_to,ai_request,ai_started_at,visitor_seen,agent_seen,notification_status,notification_claim,notification_payload,notification_started_at,notification_attempt_at,ticket_number,ticket_category,ticket_priority,ticket_created_at',
        )
        .limit(0);
      if (error) supportDatabaseFailure(error, 'initialization_schema');
      schemaReadyUntil = Date.now() + 30000;
    })();
  try {
    await schemaCheck;
  } finally {
    schemaCheck = null;
  }
}
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export async function owner() {
  const token = (await cookies()).get(supportCookie)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}
export async function supportAgent() {
  const admin = await currentAdmin();
  if (!admin) throw new SupportError(401, 'Sign in required.');
  if (!supportRoles.includes(admin.role))
    throw new SupportError(403, 'Support administrator access required.');
  return admin;
}
export async function input(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    throw new SupportError(403, 'Invalid request origin.');
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new SupportError(403, 'Invalid request origin.');
  const reader = request.body?.getReader();
  if (!reader) throw new SupportError(400, 'Request body required.');
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.length;
    if (bytes > 12000) {
      await reader.cancel();
      throw new SupportError(413, 'Request too large.');
    }
    chunks.push(part.value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error();
    return value;
  } catch {
    throw new SupportError(400, 'Invalid request.');
  }
}
export async function rate(db: any, key: string, limit: number) {
  const { data, error } = await db.rpc('support_rate', { p_key: key, p_limit: limit });
  if (error) supportDatabaseFailure(error, 'rate_limit');
  if (!data) throw new SupportError(429, 'Too many requests. Please wait a minute.');
}
export async function conversation(
  db: any,
  hash: string,
  id?: string,
  requestId?: string,
  ticketNumber?: string,
) {
  let query = db
    .from('chat_sessions')
    .select('id,status,customer_name,customer_email,issue,ticket_number')
    .eq('owner_hash', hash);
  if (id) query = query.eq('id', id);
  if (requestId) query = query.eq('ticket_request', requestId);
  if (ticketNumber) query = query.eq('ticket_number', ticketNumber);
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) supportDatabaseFailure(error, 'ownership_lookup');
  return data;
}
export async function state(db: any, id: string, after = 0, agent = false) {
  const [{ data: c, error }, { data: messages, error: messageError }] = await Promise.all([
    db
      .from('chat_sessions')
      .select(
        'id,status,assigned_to,updated_at,notification_status,customer_name,customer_email,issue,ai_request,ai_started_at,ticket_number,ticket_category,ticket_priority,ticket_created_at,created_at',
      )
      .eq('id', id)
      .single(),
    db
      .from('support_messages')
      .select('seq,id,sender,body,created_at')
      .eq('conversation_id', id)
      .gt('seq', after)
      .order('seq')
      .limit(100),
  ]);
  if (error || messageError) supportDatabaseFailure(error || messageError, 'conversation_read');
  let presenceQuery = db
    .from('support_presence')
    .select('admin_id,admin_users!inner(role,is_active)')
    .gt('seen_at', new Date(Date.now() - 45000).toISOString())
    .eq('admin_users.is_active', true)
    .in('admin_users.role', supportRoles)
    .limit(1);
  if (c.status === 'active') presenceQuery = presenceQuery.eq('admin_id', c.assigned_to);
  const { data: presence } = await presenceQuery;
  const generating = c.ai_request && Date.parse(c.ai_started_at) > Date.now() - 45000;
  return {
    conversation: {
      id: c.id,
      status: c.status,
      notification_status: c.notification_status,
      updated_at: c.updated_at,
      generating: !!generating,
      customer_name: c.customer_name,
      customer_email: c.customer_email,
      ticket_number: c.ticket_number,
      ticket_category: c.ticket_category,
      ticket_priority: c.ticket_priority,
      ticket_created_at: c.ticket_created_at,
      created_at: c.created_at,
      ...(agent ? { assigned_to: c.assigned_to, issue: c.issue } : {}),
    },
    messages: messages || [],
    agents_available: !!presence?.length,
  };
}
export async function mutate(
  db: any,
  id: string,
  hash: string | null,
  actor: string | null,
  action: string,
  requestId: string,
  body = '',
  contact = {},
) {
  const { data, error } = await db.rpc('support_mutate', {
    p_id: id,
    p_owner: hash,
    p_actor: actor,
    p_action: action,
    p_request: requestId,
    p_body: body,
    p_contact: contact,
  });
  if (error)
    throw new SupportError(
      error.code === '42501' ? 403 : 409,
      'Operation could not be completed. Refresh and retry.',
    );
  return data;
}
export async function aiReply(db: any, id: string, hash: string, requestId: string) {
  const { data } = await db
    .from('support_messages')
    .select('sender,body')
    .eq('conversation_id', id)
    .order('seq', { ascending: false })
    .limit(16);
  const history = (data || []).reverse();
  const reply = await answerSupport(history, companyFacts);
  await mutate(db, id, hash, null, 'ai_finish', requestId, reply);
}

// Human requests are visible in the authenticated inbox. No email integration.
export async function notifySupport(_db: any, _id: string) {
  return;
}
export async function start(db: any, request: Request) {
  // Read-only preflight fails before any mutation against an unmigrated database.
  await ensureSupportSchema(db);
  // Only trust this header when the hosting proxy is configured to overwrite it.
  const address =
    process.env.SUPPORT_TRUST_PROXY === 'true'
      ? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
      : 'shared';
  await rate(db, `start:${digest(address)}`, 20);
  const hash = await owner();
  if (hash) {
    const c = await conversation(db, hash);
    if (c) return { id: c.id };
  }
  const secret = randomBytes(32).toString('hex');
  const { data, error } = await db
    .from('chat_sessions')
    .insert({ session_token: randomUUID(), owner_hash: digest(secret) })
    .select('id')
    .single();
  if (error) supportDatabaseFailure(error, 'session_create');
  return { id: data.id, secret };
}
export { reviewDb };

export async function submitTicket(
  db: any,
  id: string,
  hash: string,
  requestId: string,
  details: { category: string; description: string; name: string; email: string },
) {
  const { data, error } = await db.rpc('support_submit_ticket', {
    p_id: id,
    p_owner: hash,
    p_request: requestId,
    p_category: details.category,
    p_description: details.description,
    p_name: details.name,
    p_email: details.email,
  });
  if (error) {
    if (error.code === '42501') throw new SupportError(403, 'Support session could not be verified.');
    if (error.code === '23505')
      throw new SupportError(
        409,
        'This submission key was already used with different details. Restore the original details and retry, or explicitly start a new request.',
      );
    if (error.code === '22023') throw new SupportError(400, 'Please check the support request details.');
    supportDatabaseFailure(error, 'ticket_submission');
  }
  if (!data?.ticket_number)
    throw new SupportError(503, 'Ticket confirmation is unavailable. Retry with the same details.');
  return data;
}
