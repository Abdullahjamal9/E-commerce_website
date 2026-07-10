import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { sendOrderEmails } from '@/lib/email';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const orderSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(5),
  city: z.string().min(2),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  transactionRef: z.string().optional(),
  paymentProof: z.array(z.string()).max(2).default([]),
  items: z
    .array(
      z.object({
        shoeId: z.string(),
        // Accept numbers too — browsers with an old cart cached from before
        // sizes became text labels (S/M/L) may still send a numeric size.
        size: z.union([z.string(), z.number()]).transform(String),
        colorHex: z.string(),
        qty: z.number().int().positive()
      })
    )
    .min(1)
}).refine((data) => data.paymentMethod !== 'BANK_TRANSFER' || !!data.transactionRef?.trim(), {
  message: 'Transaction ID is required for bank transfer',
  path: ['transactionRef']
}).refine((data) => data.paymentMethod !== 'BANK_TRANSFER' || data.paymentProof.length > 0, {
  message: 'A payment screenshot is required for bank transfer',
  path: ['paymentProof']
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`order:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many orders placed recently. Please try again later or contact us directly.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    console.error('Order validation failed:', JSON.stringify(parsed.error.issues));
    return NextResponse.json(
      { error: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid order data' },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const itemsToCreate = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.shoeId } });
        if (!product) throw new Error(`Product ${item.shoeId} not found`);
        if (product.stock < item.qty) {
          throw new Error(`${product.name} is out of stock`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.qty }
        });

        const colors = (product.colors as { name: string; hex: string }[]) ?? [];
        const color = colors.find((c) => c.hex === item.colorHex);
        const images = (product.images as string[]) ?? [];

        total += product.price * item.qty;
        itemsToCreate.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          colorName: color?.name ?? item.colorHex,
          colorHex: item.colorHex,
          size: item.size,
          qty: item.qty,
          image: images[0] ?? ''
        });
      }

      const orderNumber = `ORD-${1000 + (await tx.order.count()) + 1}`;

      return tx.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'BANK_TRANSFER' ? 'AWAITING_VERIFICATION' : 'PENDING',
          transactionRef: data.transactionRef,
          paymentProof: data.paymentProof,
          total,
          items: { create: itemsToCreate }
        },
        include: { items: true }
      });
    });

    await sendOrderEmails(order);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not place order';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });
  return NextResponse.json(orders);
}
