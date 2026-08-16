import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { sendOrderStatusEmail } from '@/lib/email';
import { isOrderStatusLocked } from '@/lib/orderLock';

const NOTIFIED_STATUSES = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

const updateSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'AWAITING_VERIFICATION', 'PAID', 'FAILED']).optional(),
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 });

  // Read the prior status first so a re-save of the same value (or a change
  // to paymentStatus alone) doesn't re-fire a "your order was cancelled"
  // email the customer already got.
  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const newStatus = parsed.data.orderStatus;
  const changingStatus = newStatus !== undefined && newStatus !== existing.orderStatus;

  // Order Status locks 7 days after DELIVERED — that's the store's
  // return/exchange window closing — unless an admin has explicitly
  // unlocked it (see /unlock-status). paymentStatus stays editable either
  // way; only an orderStatus *change* is blocked here.
  if (changingStatus && isOrderStatusLocked(existing)) {
    return NextResponse.json(
      { error: 'Order Status is locked — the 7-day return window has closed.' },
      { status: 409 }
    );
  }

  const data: Parameters<typeof prisma.order.update>[0]['data'] = { ...parsed.data };
  if (changingStatus) {
    if (newStatus === 'DELIVERED') {
      // A fresh delivery starts a fresh 7-day window, even if this order was
      // delivered, moved off it, and is being marked delivered again.
      data.deliveredAt = new Date();
      data.orderStatusUnlocked = false;
    } else if (existing.orderStatus === 'DELIVERED') {
      data.deliveredAt = null;
      data.orderStatusUnlocked = false;
    }
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data,
    include: { items: true }
  });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${params.id}`);

  if (changingStatus && (NOTIFIED_STATUSES as readonly string[]).includes(newStatus)) {
    await sendOrderStatusEmail(order, newStatus as (typeof NOTIFIED_STATUSES)[number]);
  }

  return NextResponse.json(order);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.order.delete({ where: { id: params.id } });
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${params.id}`);
  return NextResponse.json({ ok: true });
}
