import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'UNSET';
  const product = await prisma.product.findFirst({ where: { name: 'Nike' } });
  return NextResponse.json({
    urlPrefix: url.slice(0, 15),
    urlLength: url.length,
    hasAuthToken: Boolean(process.env.DATABASE_AUTH_TOKEN),
    productImages: product?.images
  });
}
