import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'vts_admin_session';
const engineerCookieName = 'vts_engineer_session';

export function reviewDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server credentials are not configured');
  return createClient(url, key, { auth: { persistSession: false } });
}

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('ADMIN_SESSION_SECRET must be configured (at least 32 characters)');
  return secret;
}

function tokenFor(payloadData: Record<string, unknown>, durationMs: number) {
  const payload = Buffer.from(JSON.stringify({ ...payloadData, exp: Date.now() + durationMs })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function createAdminToken(admin: { id: string; role: string }) {
  return tokenFor(admin, 8 * 60 * 60 * 1000);
}

export function createEngineerToken(engineer: { id: string }) {
  return tokenFor(engineer, 12 * 60 * 60 * 1000);
}

async function readSignedSession(name: string) {
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { id: string; exp: number };
    return session.id && session.exp >= Date.now() ? session : null;
  } catch { return null; }
}

export async function currentAdmin() {
  try {
    const session = await readSignedSession(cookieName);
    if (!session) return null;
    const { data } = await reviewDb().from('admin_users').select('id,email,full_name,role,is_active').eq('id', session.id).maybeSingle();
    return data?.is_active ? { id: data.id, email: data.email, full_name: data.full_name, role: data.role } : null;
  } catch { return null; }
}

export async function currentEngineer() {
  try {
    const session = await readSignedSession(engineerCookieName);
    if (!session) return null;
    const { data } = await reviewDb().from('engineers').select('id,name,email,role,is_active').eq('id', session.id).maybeSingle();
    return data?.is_active ? data : null;
  } catch { return null; }
}

export { cookieName, engineerCookieName };
