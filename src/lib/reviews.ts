import { prisma } from './db';

export interface ProductReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
}

export async function getReviews(productId: string): Promise<ProductReview[]> {
  const rows = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' }
  });
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    images: (r.images as string[]) ?? [],
    createdAt: r.createdAt
  }));
}

export interface AdminReview extends ProductReview {
  productId: string;
  productName: string;
  productSlug: string;
}

/** All reviews across every product, newest first — for the admin moderation list. */
export async function getAllReviews(): Promise<AdminReview[]> {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, slug: true } } }
  });
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    images: (r.images as string[]) ?? [],
    createdAt: r.createdAt,
    productId: r.productId,
    productName: r.product.name,
    productSlug: r.product.slug
  }));
}
