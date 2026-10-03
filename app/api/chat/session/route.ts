import { NextResponse } from 'next/server';
import { reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sessionToken(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!sessionToken(token)) return NextResponse.json({ error: 'Invalid session token.' }, { status: 400 });
  const { data, error } = await reviewDb().from('chat_sessions').select('messages').eq('session_token', token).maybeSingle();
  if (error) return NextResponse.json({ error: 'Chat history is unavailable.' }, { status: 503 });
  return NextResponse.json({ messages: data?.messages ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!sessionToken(body.token) || !Array.isArray(body.messages) || body.messages.length > 100) {
      return NextResponse.json({ error: 'Invalid chat session.' }, { status: 400 });
    }
    const messages = body.messages.filter((message: unknown) => {
      if (!message || typeof message !== 'object') return false;
      const candidate = message as Record<string, unknown>;
      return typeof candidate.id === 'string' && candidate.id.length <= 100 &&
        typeof candidate.text === 'string' && candidate.text.length <= 8000 &&
        (candidate.sender === 'user' || candidate.sender === 'bot');
    });
    if (messages.length !== body.messages.length) return NextResponse.json({ error: 'Invalid chat messages.' }, { status: 400 });
    const { error } = await reviewDb().from('chat_sessions').upsert(
      { session_token: body.token, messages, updated_at: new Date().toISOString() },
      { onConflict: 'session_token' },
    );
    if (error) return NextResponse.json({ error: 'Chat history could not be saved.' }, { status: 503 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!sessionToken(token)) return NextResponse.json({ error: 'Invalid session token.' }, { status: 400 });
  const { error } = await reviewDb().from('chat_sessions').delete().eq('session_token', token);
  if (error) return NextResponse.json({ error: 'Chat history could not be cleared.' }, { status: 503 });
  return NextResponse.json({ success: true });
}
