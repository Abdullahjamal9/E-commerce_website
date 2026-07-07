import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { slugify } from '@/lib/slugify';
import { getProducts } from '@/lib/products';

const productSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  colors: z.array(z.object({ name: z.string().min(1), hex: z.string().min(4) })).min(1),
  sizes: z.array(z.string().min(1)).min(1),
  images: z.array(z.string()).min(1),
  spinImages: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

async function uniqueSlug(name: string) {
  const base = slugify(name) || 'shoe';
  let slug = base;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get('ids');
  const search = searchParams.get('search') ?? undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;

  let products = await getProducts({ search, activeOnly: true });

  if (idsParam) {
    const ids = new Set(idsParam.split(',').filter(Boolean));
    products = products.filter((p) => ids.has(p.id));
  }

  if (limit) products = products.slice(0, limit);

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid product' }, { status: 400 });
  }

  const slug = await uniqueSlug(parsed.data.name);
  const product = await prisma.product.create({ data: { ...parsed.data, slug } });
  return NextResponse.json(product);
}
