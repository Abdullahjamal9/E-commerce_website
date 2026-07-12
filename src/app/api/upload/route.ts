import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/session';
import { deleteImages } from '@/lib/images';
import { signUpload } from '@/lib/cloudinary';

// Issues a short-lived signed upload instead of proxying the file through
// this function — Vercel serverless functions cap request bodies at 4.5MB,
// which multiple product photos blow past easily. The browser uploads
// straight to Cloudinary using this signature.
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(signUpload('uploads'));
}

// Lets the admin product form immediately reclaim storage when a photo is
// removed before the product is ever saved — otherwise that upload would
// never be referenced by any product and would sit as a permanent orphan.
export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const url = typeof body?.url === 'string' ? body.url : null;
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  await deleteImages([url]);
  return NextResponse.json({ ok: true });
}
