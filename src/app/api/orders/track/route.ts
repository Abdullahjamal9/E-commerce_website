import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const schema = z.object({
  orderNumber: z.string().trim().min(1),
  phone: z.string().trim().min(4)
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`track-order:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter your order number and phone number' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber.trim() },
    include: { items: true }
  });

  if (!order || order.phone.replace(/\D/g, '') !== parsed.data.phone.replace(/\D/g, '')) {
    return NextResponse.json({ error: 'No matching order found. Check your order number and phone number.' }, { status: 404 });
  }

  return NextResponse.json(order);
}
