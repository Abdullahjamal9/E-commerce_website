import { prisma } from './db';
import type { Category, Shoe, ShoeColor, Tag } from './types';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tags: unknown;
  colors: unknown;
  sizes: unknown;
  images: unknown;
  spinImages?: unknown;
  featuredAt?: Date | null;
  isActive: boolean;
  sortOrder: number;
};

function mapProduct(p: ProductRow): Shoe {
  const images = (p.images as string[]) ?? [];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    tags: (p.tags as Tag[]) ?? [],
    colors: (p.colors as ShoeColor[]) ?? [],
    sizes: (p.sizes as string[]) ?? [],
    images,
    image: images[0] ?? '',
    spinImages: (p.spinImages as string[]) ?? [],
    featuredAt: p.featuredAt ?? null,
    isActive: p.isActive
  };
}

export interface ProductFilters {
  category?: Category;
  tag?: Tag;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'newest';
  /** Restrict to products an admin has marked active — use for all storefront-facing queries. */
  activeOnly?: boolean;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Shoe[]> {
  const rows = await prisma.product.findMany({
    where: filters.activeOnly ? { isActive: true } : undefined,
    orderBy:
      filters.sort === 'price-asc'
        ? { price: 'asc' }
        : filters.sort === 'price-desc'
          ? { price: 'desc' }
          : { sortOrder: 'asc' }
  });

  let shoes = rows.map(mapProduct);

  if (filters.category) {
    shoes = shoes.filter((s) => s.category === filters.category);
  }

  if (filters.tag) {
    shoes = shoes.filter((s) => s.tags.includes(filters.tag!));
  }

  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      shoes = shoes.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
  }

  return shoes;
}

/** Storefront-facing lookup — returns undefined for inactive products so they 404 publicly. */
export async function getProductBySlug(slug: string): Promise<Shoe | undefined> {
  const row = await prisma.product.findFirst({ where: { slug, isActive: true } });
  return row ? mapProduct(row) : undefined;
}

/** Admin-facing lookup — returns the product regardless of active status so it can be reactivated. */
export async function getProductById(id: string): Promise<Shoe | undefined> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? mapProduct(row) : undefined;
}

export async function getAllSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function getRelated(id: string, count = 4): Promise<Shoe[]> {
  const base = await getProductById(id);
  const all = await getProducts({ activeOnly: true });
  if (!base) return all.slice(0, count);
  return all
    .filter(
      (p) =>
        p.id !== id &&
        (p.category === base.category || p.tags.some((t) => base.tags.includes(t)))
    )
    .slice(0, count);
}

/** Products an admin has curated onto the homepage, most recently featured first. */
export async function getFeaturedProducts(maxCount = 8): Promise<Shoe[]> {
  const featuredRows = await prisma.product.findMany({
    where: { featuredAt: { not: null }, isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: maxCount
  });
  return featuredRows.map(mapProduct);
}

/**
 * Picks products outside `excludeIds`, spreading across tags so the
 * homepage "Recommended" rail doesn't just repeat the curated collection.
 */
export async function getRecommendedProducts(excludeIds: string[], limit = 8): Promise<Shoe[]> {
  const pool = (await getProducts({ activeOnly: true })).filter((p) => !excludeIds.includes(p.id));

  const byTag = new Map<string, Shoe[]>();
  for (const p of pool) {
    for (const t of p.tags) {
      if (!byTag.has(t)) byTag.set(t, []);
      byTag.get(t)!.push(p);
    }
  }

  const picked: Shoe[] = [];
  const seen = new Set<string>();
  const tags = Array.from(byTag.keys());

  let i = 0;
  while (picked.length < limit && tags.length > 0) {
    const tag = tags[i % tags.length];
    const list = byTag.get(tag)!;
    const next = list.find((p) => !seen.has(p.id));
    if (next) {
      seen.add(next.id);
      picked.push(next);
      i++;
    } else {
      tags.splice(i % tags.length, 1);
    }
  }

  return picked;
}
