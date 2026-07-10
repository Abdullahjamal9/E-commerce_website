import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const reviews = await prisma.review.findMany({
    where: { productId: params.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(reviews);
}

const schema = z.object({
  customerName: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(5).max(1000),
  images: z.array(z.string()).max(4).default([])
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  if (!rateLimit(`review:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'You are submitting reviews too quickly. Please try again later.' },
      { status: 429 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid review' },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: { ...parsed.data, productId: params.id }
  });
  revalidatePath(`/product/${product.slug}`);
  revalidatePath('/admin/reviews');
  return NextResponse.json(review);
}
