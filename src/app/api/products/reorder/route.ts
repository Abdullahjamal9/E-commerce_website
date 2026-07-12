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

  // `ids` is only the reordered subset currently visible in the admin table
  // (e.g. one category, one page) — not the whole catalogue. Splice that new
  // sequence back into the subset's original slots within the full order, so
  // reordering a filtered view never disturbs products outside it.
  const all = await prisma.product.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true } });
  const subsetIds = new Set(parsed.data.ids);
  const reordered = [...parsed.data.ids];
  const finalOrder = all.map((p) => (subsetIds.has(p.id) ? reordered.shift()! : p.id));

  await prisma.$transaction(
    finalOrder.map((id, index) => prisma.product.update({ where: { id }, data: { sortOrder: index } }))
  );

  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');
  return NextResponse.json({ ok: true });
}
