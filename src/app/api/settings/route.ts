import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

const settingsSchema = z.object({
  storeName: z.string().min(1),
  bankName: z.string(),
  bankAccountName: z.string(),
  bankAccountNumber: z.string(),
  easypaisaNumber: z.string(),
  codEnabled: z.boolean(),
  bankTransferEnabled: z.boolean(),
  contactPhone: z.string(),
  whatsappNumber: z.string(),
  contactEmail: z.string(),
  address: z.string()
});

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid settings' }, { status: 400 });
  }

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data }
  });
  revalidatePath('/', 'layout');
  return NextResponse.json(settings);
}
