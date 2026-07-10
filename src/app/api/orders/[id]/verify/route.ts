import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { sendPaymentVerifiedEmail } from '@/lib/email';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' },
    include: { items: true }
  });

  await sendPaymentVerifiedEmail(order);
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${params.id}`);

  return NextResponse.json(order);
}
