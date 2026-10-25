import { NextResponse } from 'next/server';
import { reviewDb } from '@/lib/reviewServer';

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > 16384) {
      return NextResponse.json({ error: 'The inquiry is too large.' }, { status: 413 });
    }
    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
    } catch {
      return NextResponse.json({ error: 'Invalid inquiry.' }, { status: 400 });
    }
    const limits: Record<string, number> = { name: 100, email: 254, phone: 32, service: 100, message: 4000, requestId: 36 };
    if (Object.entries(limits).some(([key, max]) => body[key] !== undefined &&
        (typeof body[key] !== 'string' || (body[key] as string).length > max))) {
      return NextResponse.json({ error: 'Please check your inquiry details and field lengths.' }, { status: 400 });
    }
    const text = (key: string, max: number) => typeof body[key] === 'string' ? body[key].trim().slice(0, max) : '';
    const name = text('name', 100);
    const email = text('email', 254).toLowerCase();
    const message = text('message', 4000);
    const requestId = text('requestId', 36);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
      return NextResponse.json({ error: 'Please check your name, email and message.' }, { status: 400 });
    }
    const { error } = await reviewDb().rpc('submit_website_inquiry', {
      p_request_id: requestId, p_name: name, p_email: email,
      p_phone: text('phone', 32), p_service: text('service', 100), p_message: message,
    });
    if (error?.code === 'P0429') {
      return NextResponse.json({ error: 'Please wait before submitting another inquiry.' },
        { status: 429, headers: { 'Retry-After': '3600' } });
    }
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Your inquiry could not be saved. Please retry.' }, { status: 503 });
  }
}
