import { NextResponse } from 'next/server';
import { currentAdmin, reviewDb } from '@/lib/reviewServer';

export async function GET(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const status = new URL(request.url).searchParams.get('status');
  const db = reviewDb();
  let query = db.from('client_reviews').select('*').order('created_at', { ascending: false });
  if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Could not load reviews.' }, { status: 503 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const body = await request.json();
  if (typeof body.id !== 'string') return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (['APPROVED', 'REJECTED', 'PENDING'].includes(body.status)) {
    update.status = body.status;
    update.approved_at = body.status === 'APPROVED' ? new Date().toISOString() : null;
    update.approved_by = body.status === 'APPROVED' ? admin.id : null;
  }
  for (const [key, limit] of [['name', 100], ['company_name', 150], ['service', 120], ['review', 2000], ['avatar', 8]] as const) {
    if (typeof body[key] === 'string') update[key] = body[key].trim().slice(0, limit);
  }
  if (body.rating !== undefined && Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5) update.rating = body.rating;
  if (!Object.keys(update).length) return NextResponse.json({ error: 'No valid changes supplied.' }, { status: 400 });
  update.updated_at = new Date().toISOString();
  const { error } = await reviewDb().from('client_reviews').update(update).eq('id', body.id);
  if (error) return NextResponse.json({ error: 'Could not update review.' }, { status: 503 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const { id } = await request.json();
  if (typeof id !== 'string') return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
  const { error } = await reviewDb().from('client_reviews').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Could not delete review.' }, { status: 503 });
  return NextResponse.json({ success: true });
}
