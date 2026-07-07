import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ ok: true }); // generic response, don't reveal rate limiting either
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });

  if (admin) {
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiry }
    });

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/admin/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(admin.email, resetUrl);
  }

  // Always return a generic response so we don't reveal whether an email is registered.
  return NextResponse.json({ ok: true });
}
