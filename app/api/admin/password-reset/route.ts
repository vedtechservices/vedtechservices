import { NextResponse } from 'next/server';
import { createHmac, randomBytes, randomInt, scryptSync } from 'node:crypto';
import { reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const requestMessage = 'If an active admin account matches, a verification code will be sent to its email.';

function resetSecret() {
  const secret = process.env.ADMIN_PASSWORD_RESET_SECRET;
  if (!secret || secret.length < 32)
    throw new Error('ADMIN_PASSWORD_RESET_SECRET must be configured (at least 32 characters)');
  return secret;
}

function digest(value: string) {
  return createHmac('sha256', resetSecret()).update(value).digest('hex');
}

async function readBody(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return null;
  if (request.headers.get('sec-fetch-site') === 'cross-site') return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.length;
    if (length > 4096) {
      await reader.cancel();
      return null;
    }
    chunks.push(part.value);
  }
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

function emailPattern(email: string) {
  return email.replace(/[\\%_]/g, '\\$&');
}

function clientIpHash(request: Request) {
  if (process.env.SUPPORT_TRUST_PROXY !== 'true') return null;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return ip && ip.length <= 100 ? digest(`ip:${ip}`) : null;
}

async function invalidateReset(db: ReturnType<typeof reviewDb>, emailHash: string) {
  const { error } = await db.rpc('invalidate_admin_password_reset', {
    p_email_hash: emailHash,
  });
  if (error) throw new Error('Could not invalidate the pending password reset.');
}

async function requestReset(request: Request, body: Record<string, unknown>) {
  if (typeof body.email !== 'string' || body.email.length > 254)
    return json({ error: 'Enter a valid admin email address.' }, 400);
  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ error: 'Enter a valid admin email address.' }, 400);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ error: 'Password recovery email is not configured.' }, 503);

  const db = reviewDb();
  const { data: admin, error: lookupError } = await db
    .from('admin_users')
    .select('id,email,is_active')
    .ilike('email', emailPattern(email))
    .maybeSingle();
  if (lookupError) throw new Error('Could not look up the administrator account.');

  const eligible = admin?.is_active === true;
  const code = eligible ? String(randomInt(100000, 1000000)) : null;
  const emailHash = digest(`email:${email}`);
  const { data: allowed, error: issueError } = await db.rpc('issue_admin_password_reset', {
    p_email_hash: emailHash,
    p_ip_hash: clientIpHash(request),
    p_admin_id: eligible ? admin.id : null,
    p_code_hash: code ? digest(`code:${emailHash}:${code}`) : null,
  });
  if (issueError) throw new Error('Could not issue a password reset code.');
  if (!allowed || !eligible || !code) return json({ message: requestMessage });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: process.env.SUPPORT_EMAIL_FROM || 'VedTech Services <support@vedtechservices.in>',
        to: [admin.email],
        subject: 'Your VedTech Services admin password reset code',
        text: `Your admin password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `<p>Your admin password reset code is <strong>${code}</strong>.</p><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
      }),
    });
    if (!response.ok) throw new Error('Email provider rejected the reset email.');
  } catch {
    await invalidateReset(db, emailHash);
    console.error('[admin-password-reset] email_delivery_failed');
    return json({ error: 'The reset email could not be sent. Please try again later.' }, 503);
  }

  return json({ message: requestMessage });
}

async function resetPassword(body: Record<string, unknown>) {
  if (
    typeof body.email !== 'string' ||
    body.email.length > 254 ||
    typeof body.code !== 'string' ||
    !/^\d{6}$/.test(body.code) ||
    typeof body.newPassword !== 'string' ||
    body.newPassword.length < 12 ||
    body.newPassword.length > 128
  )
    return json({ error: 'Enter a valid email, 6-digit code, and password of at least 12 characters.' }, 400);

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return json({ error: 'Invalid or expired verification code.' }, 400);
  const emailHash = digest(`email:${email}`);
  const codeHash = digest(`code:${emailHash}:${body.code}`);
  const db = reviewDb();
  const { data: verified, error: verifyError } = await db.rpc('verify_admin_password_reset', {
    p_email_hash: emailHash,
    p_code_hash: codeHash,
  });
  if (verifyError) throw new Error('Could not verify the password reset code.');
  if (!verified) return json({ error: 'Invalid or expired verification code.' }, 400);

  const salt = randomBytes(16).toString('hex');
  const passwordHash = `scrypt$${salt}$${scryptSync(body.newPassword, salt, 64).toString('hex')}`;
  const { data: changed, error: updateError } = await db.rpc('complete_admin_password_reset', {
    p_email_hash: emailHash,
    p_code_hash: codeHash,
    p_password_hash: passwordHash,
  });
  if (updateError) throw new Error('Could not update the administrator password.');
  if (!changed) return json({ error: 'Invalid or expired verification code.' }, 400);
  return json({ message: 'Password updated. You can now sign in with your new password.' });
}

export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    if (!body) return json({ error: 'Invalid request.' }, 400);
    if (body.action === 'request') return await requestReset(request, body);
    if (body.action === 'reset') return await resetPassword(body);
    return json({ error: 'Invalid password reset action.' }, 400);
  } catch (error) {
  console.error('[admin-password-reset] error:', error);
  return json(
    { error: 'Password recovery is temporarily unavailable.' },
    503
  );
}
}
