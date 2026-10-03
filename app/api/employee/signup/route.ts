import { randomInt, randomBytes, scryptSync } from 'node:crypto';
import { NextResponse } from 'next/server';
import { reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';
const requests = new Map<string, number[]>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const recent = (requests.get(ip) || []).filter(time => now - time < 60 * 60 * 1000);
    if (recent.length >= 5) return NextResponse.json({ error: 'Please wait before submitting another application.' }, { status: 429 });
    recent.push(now);
    requests.set(ip, recent);

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 32) : '';
    const department = typeof body.department === 'string' ? body.department.trim().slice(0, 100) : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !department || password.length < 12 || password.length > 256) {
      return NextResponse.json({ error: 'Enter valid details and a password of at least 12 characters.' }, { status: 400 });
    }

    const employeeId = `VT${randomInt(100000, 1000000)}`;
    const salt = randomBytes(16).toString('hex');
    const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
    const { error } = await reviewDb().from('engineers').insert({
      name, email, phone, department, employee_id: employeeId, password_hash: passwordHash,
      status: 'available', is_active: false, joining_date: new Date().toISOString().slice(0, 10),
    });
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Email or employee identifier is already registered.' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, employeeId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Employee registration is temporarily unavailable.' }, { status: 503 });
  }
}
