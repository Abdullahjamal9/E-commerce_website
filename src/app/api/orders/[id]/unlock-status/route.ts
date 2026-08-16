import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

/**
 * Manual override for the 7-day post-delivery lock on Order Status — see
 * isOrderStatusLocked. Exceptional-case escape hatch; there's no PATCH
 * equivalent because unlocking is a deliberate, auditable action rather than
 * a field an admin would set alongside other edits.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { orderStatusUnlocked: true }
  });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${params.id}`);
  return NextResponse.json(order);
}
