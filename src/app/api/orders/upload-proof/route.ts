import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { signUpload } from '@/lib/cloudinary';

// Issues a short-lived signed upload instead of proxying the file through
// this function — Vercel serverless functions cap request bodies at 4.5MB,
// which two payment screenshots can exceed. The browser uploads straight to
// Cloudinary using this signature.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`order-proof-upload:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 });
  }

  return NextResponse.json(signUpload('payment-proof'));
}
