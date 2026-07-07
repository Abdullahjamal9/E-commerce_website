import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactMessage } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(7).max(20),
  message: z.string().trim().min(5).max(2000)
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`contact:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many messages sent. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid message' },
      { status: 400 }
    );
  }

  await sendContactMessage(parsed.data);

  return NextResponse.json({ ok: true });
}
