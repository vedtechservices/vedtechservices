import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { currentAdmin, currentEngineer, reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: Request) {
  const admin = await currentAdmin();
  const engineer = admin ? null : await currentEngineer();
  if (!admin && !engineer) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (form.get('bucketName') !== 'uploads') return NextResponse.json({ error: 'Unsupported storage bucket.' }, { status: 400 });
    const requestedPath = typeof form.get('path') === 'string' ? String(form.get('path')) : '';
    const repairId = typeof form.get('repairId') === 'string' ? String(form.get('repairId')) : '';
    if (!(file instanceof File) || !imageTypes.has(file.type) || file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Upload an image under 8 MB.' }, { status: 400 });
    }
    const normalized = requestedPath.replace(/\\/g, '/').split('/').filter(Boolean);
    if (normalized.some(part => part === '.' || part === '..' || !/^[a-zA-Z0-9_-]{1,80}$/.test(part))) {
      return NextResponse.json({ error: 'Invalid upload path.' }, { status: 400 });
    }
    let repair: { id: string; photos: string[] | null } | null = null;
    if (engineer) {
      if (!/^[0-9a-f-]{36}$/i.test(repairId)) return NextResponse.json({ error: 'A repair assignment is required.' }, { status: 400 });
      const { data } = await reviewDb().from('hardware_repairs').select('id,photos').eq('id', repairId).eq('assigned_engineer_id', engineer.id).maybeSingle();
      if (!data) return NextResponse.json({ error: 'Repair assignment not found.' }, { status: 403 });
      repair = data;
    }
    if (admin && normalized[0] !== 'repair-photos' && normalized[0] !== 'public-assets') return NextResponse.json({ error: 'This upload location is not permitted.' }, { status: 403 });
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const db = reviewDb();
    const path = engineer
      ? `repair-photos/${repairId}/${randomUUID()}.${extension}`
      : [...normalized, `${randomUUID()}.${extension}`].join('/');
    const requestedCache = Number(form.get('cacheControl'));
    const cacheControl = Number.isInteger(requestedCache) ? String(Math.min(Math.max(requestedCache, 0), 86400)) : '3600';
    const { error } = await db.storage.from('uploads').upload(path, file, { contentType: file.type, cacheControl, upsert: false });
    if (error) return NextResponse.json({ error: 'Image upload failed.' }, { status: 503 });
    const { data: publicData } = db.storage.from('uploads').getPublicUrl(path);
    if (engineer && repair) {
      const photos = [...(repair.photos || []), publicData.publicUrl];
      const { error: updateError } = await db.from('hardware_repairs').update({ photos }).eq('id', repair.id).eq('assigned_engineer_id', engineer.id);
      if (updateError) {
        await db.storage.from('uploads').remove([path]);
        return NextResponse.json({ error: 'Photo could not be attached to the repair.' }, { status: 503 });
      }
    }
    return NextResponse.json({ path, publicUrl: publicData.publicUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 400 });
  }
}
