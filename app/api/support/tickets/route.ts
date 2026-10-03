import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';
const submissions = new Map<string, number[]>();
const lookups = new Map<string, number[]>();

function limited(bucket: Map<string, number[]>, ip: string, now: number, max: number) {
  const recent = (bucket.get(ip) || []).filter(time => now - time < 60 * 60 * 1000);
  if (recent.length >= max) return true;
  recent.push(now);
  bucket.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (limited(submissions, ip, Date.now(), 10)) return NextResponse.json({ error: 'Please wait before submitting another request.' }, { status: 429 });
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254).toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 32) : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 4000) : '';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !phone || !subject || !description || description.length < 10) {
      return NextResponse.json({ error: 'Please check the support request details.' }, { status: 400 });
    }
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ticketId = `VTS-${dateCode}-${randomInt(100000, 1000000)}`;
    const db = reviewDb();
    // Link an existing customer server-side without revealing whether the email is registered.
    const { data: customer } = await db.from('customers').select('id').eq('email', email).maybeSingle();
    const { error } = await db.from('support_tickets').insert({
      ticket_id: ticketId, customer_id: customer?.id ?? null, name, email, phone,
      company: typeof body.company === 'string' ? body.company.trim().slice(0, 160) || 'N/A' : 'N/A',
      location: typeof body.location === 'string' ? body.location.trim().slice(0, 160) || 'N/A' : 'N/A',
      service_type: typeof body.serviceType === 'string' ? body.serviceType.slice(0, 100) : null,
      category: typeof body.category === 'string' ? body.category.slice(0, 100) : 'General',
      priority: ['low', 'medium', 'high'].includes(String(body.priority).toLowerCase()) ? String(body.priority).toLowerCase() : 'medium',
      subject, description, status: 'open', is_amc_customer: false,
    });
    if (error) throw error;
    return NextResponse.json({ success: true, ticketId }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'The support request could not be submitted.' }, { status: 503 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (limited(lookups, ip, Date.now(), 30)) return NextResponse.json({ error: 'Please wait before checking another ticket.' }, { status: 429 });
  const ticketId = url.searchParams.get('ticketId')?.trim().slice(0, 40) || '';
  const email = url.searchParams.get('email')?.trim().toLowerCase().slice(0, 254) || '';
  if (!ticketId || !email) return NextResponse.json({ error: 'Ticket ID and email are required.' }, { status: 400 });
  const { data, error } = await reviewDb().from('support_tickets')
    .select('id,ticket_id,status,subject,category,created_at')
    .eq('ticket_id', ticketId).ilike('email', email).order('created_at', { ascending: false }).limit(1);
  if (error) return NextResponse.json({ error: 'Ticket status is temporarily unavailable.' }, { status: 503 });
  return NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } });
}
