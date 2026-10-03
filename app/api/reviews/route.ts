import { NextResponse } from 'next/server';
import { reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';
const submissions = new Map<string, number[]>();

export async function GET() {
  try {
    const { data, error } = await reviewDb().from('client_reviews')
      .select('id, name, company_name, service, rating, review, avatar, created_at')
      .eq('status', 'APPROVED').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Reviews are temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const recent = (submissions.get(ip) || []).filter(timestamp => now - timestamp < 60 * 60 * 1000);
    if (recent.length >= 5) return NextResponse.json({ error: 'Please wait before submitting another review.' }, { status: 429 });
    recent.push(now);
    submissions.set(ip, recent);
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const review = typeof body.review === 'string' ? body.review.trim().slice(0, 2000) : '';
    const rating = Number(body.rating);
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : '';
    if (!name || name.length > 100 || !review || review.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: 'Please check the required fields and try again.' }, { status: 400 });
    }
    const { error } = await reviewDb().from('client_reviews').insert({
      name, email: email || null, company_name: typeof body.companyName === 'string' ? body.companyName.trim().slice(0, 150) || null : null,
      service: typeof body.service === 'string' ? body.service.trim().slice(0, 120) || null : null,
      rating, review, avatar: name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(), status: 'PENDING',
    });
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Your review could not be submitted right now.' }, { status: 503 });
  }
}
