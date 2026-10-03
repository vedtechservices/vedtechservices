import { NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { createAdminToken, cookieName, currentAdmin, reviewDb } from '@/lib/reviewServer';

export async function GET() {
  const admin = await currentAdmin();
  return admin
    ? NextResponse.json({ authenticated: true, admin })
    : NextResponse.json({ authenticated: false }, { status: 401 });
}

function verifyPassword(stored: string, password: string) {
  const [scheme, salt, digest] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !digest) return false;
  try {
    const expected = Buffer.from(digest, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

export async function POST(request: Request) {
  try {
    const { email, password, totp } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    const { data: admin } = await reviewDb().from('admin_users').select('id,email,password_hash,full_name,role,is_active,totp_enabled,totp_secret').eq('email', email.trim()).maybeSingle();
    if (!admin?.is_active || !verifyPassword(admin.password_hash, password)) return NextResponse.json({ error: 'Invalid admin credentials or account disabled.' }, { status: 401 });
    if (admin.totp_enabled && (!totp || !verifySync({ token: String(totp), secret: admin.totp_secret }).valid)) {
      return NextResponse.json({ requiresTotp: true, error: totp ? 'The code you entered is incorrect.' : undefined }, { status: 200 });
    }
    const response = NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email, full_name: admin.full_name, role: admin.role } });
    response.cookies.set(cookieName, createAdminToken({ id: admin.id, role: admin.role }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Admin authentication is not configured.' }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
