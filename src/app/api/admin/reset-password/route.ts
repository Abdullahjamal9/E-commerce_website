import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
      { status: 400 }
    );
  }

  const admin = await prisma.adminUser.findUnique({ where: { resetToken: parsed.data.token } });

  if (!admin || !admin.resetTokenExpiry || admin.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: 'This reset link is invalid or has expired' }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null }
  });

  return NextResponse.json({ ok: true });
}
