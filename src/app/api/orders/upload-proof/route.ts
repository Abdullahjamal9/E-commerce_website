import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_FILES = 2;
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`order-proof-upload:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  const formData = await request.formData();
  const files = formData.getAll('files').filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `You can attach up to ${MAX_FILES} images` }, { status: 400 });
  }

  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Each image must be under 5MB' }, { status: 400 });
    }

    const ext = file.type.split('/')[1];
    const filename = `${randomUUID()}.${ext}`;
    const blob = await put(`uploads/${filename}`, file, { access: 'public' });
    urls.push(blob.url);
  }

  return NextResponse.json({ urls });
}
