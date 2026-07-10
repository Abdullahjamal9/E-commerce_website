import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFeaturedProducts, getRecommendedProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'UNSET';
  const product = await prisma.product.findFirst({ where: { name: 'Nike' } });
  const featured = await getFeaturedProducts(8);
  const recommended = await getRecommendedProducts(featured.map((p) => p.id), 4);
  const nikeInFeatured = featured.find((p) => p.name === 'Nike');
  const nikeInRecommended = recommended.find((p) => p.name === 'Nike');
  return NextResponse.json({
    urlPrefix: url.slice(0, 15),
    urlLength: url.length,
    hasAuthToken: Boolean(process.env.DATABASE_AUTH_TOKEN),
    productImages: product?.images,
    nikeInFeaturedImages: nikeInFeatured?.images,
    nikeInRecommendedImages: nikeInRecommended?.images
  });
}
