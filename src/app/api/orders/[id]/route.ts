import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

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

  const order = await prisma.order.update({
    where: { id: params.id },
    data: parsed.data
  });
  return NextResponse.json(order);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.order.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
