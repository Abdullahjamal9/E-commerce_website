import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

const bodySchema = z.object({ ids: z.array(z.string()).min(1) });

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.ids.map((id, index) =>
      prisma.product.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');
  return NextResponse.json({ ok: true });
}
