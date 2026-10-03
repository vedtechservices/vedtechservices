import { NextResponse } from 'next/server';
import { scryptSync, timingSafeEqual } from 'node:crypto';
import { createEngineerToken, currentEngineer, engineerCookieName, reviewDb } from '@/lib/reviewServer';

function verifyPassword(stored: string, password: string) {
  const [scheme, salt, digest] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !digest) return false;
  try {
    const expected = Buffer.from(digest, 'hex');
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch { return false; }
}

export async function GET() {
  const engineer = await currentEngineer();
  return engineer
    ? NextResponse.json({ authenticated: true, engineer })
    : NextResponse.json({ authenticated: false }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.email !== 'string' || typeof body.password !== 'string') return NextResponse.json({ error: 'Invalid credentials.' }, { status: 400 });
    const { data: engineer } = await reviewDb().from('engineers').select('id,name,email,password_hash,is_active').eq('email', body.email.trim()).maybeSingle();
    if (!engineer?.is_active || !verifyPassword(engineer.password_hash || '', body.password)) return NextResponse.json({ error: 'Invalid credentials or inactive account.' }, { status: 401 });
    const response = NextResponse.json({ success: true, engineer: { id: engineer.id, name: engineer.name, email: engineer.email } });
    response.cookies.set(engineerCookieName, createEngineerToken({ id: engineer.id }), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 12 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ error: 'Employee authentication is not configured.' }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(engineerCookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
