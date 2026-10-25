import { NextResponse } from 'next/server';
import { currentAdmin, reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';

const allowedFunctions = new Set([
  'ai-kb-assistant', 'preview-sla-email', 'monitor-slas', 'send-admin-reply', 'send-weekly-report',
  'generate-scheduled-reports', 'calculate-engagement-scores', 'update-exchange-rates',
]);
const superAdminFunctions = new Set(['send-weekly-report', 'generate-scheduled-reports', 'calculate-engagement-scores']);
const supportFunctions = new Set(['ai-kb-assistant', 'preview-sla-email', 'monitor-slas', 'send-admin-reply']);

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ data: null, error: { message: 'Invalid request origin.' } }, { status: 403 });
  }
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ data: null, error: { message: 'Authentication required.' } }, { status: 401 });
  try {
    const { name, body } = await request.json();
    if (typeof name !== 'string' || !allowedFunctions.has(name)) return NextResponse.json({ data: null, error: { message: 'Function is not allowed.' } }, { status: 400 });
    if (superAdminFunctions.has(name) && admin.role !== 'super_admin') return NextResponse.json({ data: null, error: { message: 'Super administrator access required.' } }, { status: 403 });
    if (supportFunctions.has(name) && !['super_admin', 'support_admin'].includes(admin.role)) return NextResponse.json({ data: null, error: { message: 'Support administrator access required.' } }, { status: 403 });
    if (name === 'update-exchange-rates' && admin.role !== 'super_admin' && admin.role !== 'billing_admin') return NextResponse.json({ data: null, error: { message: 'Billing administrator access required.' } }, { status: 403 });
    const { data, error } = await reviewDb().functions.invoke(name, { body });
    if (error) return NextResponse.json({ data: null, error: { message: error.message || 'Function execution failed.' } }, { status: 502 });
    return NextResponse.json({ data, error: null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ data: null, error: { message: 'Function request failed.' } }, { status: 400 });
  }
}
