import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { slugify } from '@/lib/slugify';
import { deleteImages } from '@/lib/images';

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

async function uniqueSlug(name: string, excludeId: string) {
  const base = slugify(name) || 'shoe';
  let slug = base;
  let i = 1;
  while (await prisma.product.findFirst({ where: { slug, id: { not: excludeId } } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid product' }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  const data =
    existing && existing.name !== parsed.data.name
      ? { ...parsed.data, slug: await uniqueSlug(parsed.data.name, params.id) }
      : parsed.data;

  const product = await prisma.product.update({ where: { id: params.id }, data });
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');
  if (existing && existing.slug !== product.slug) revalidatePath(`/product/${existing.slug}`);
  revalidatePath(`/product/${product.slug}`);

  if (existing) {
    const oldUrls = [...(existing.images as string[]), ...(existing.spinImages as string[])];
    const newUrls = new Set([...parsed.data.images, ...parsed.data.spinImages]);
    await deleteImages(oldUrls.filter((u) => !newUrls.has(u)));
  }

  return NextResponse.json(product);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.product.findUnique({ where: { id: params.id } });
  await prisma.product.delete({ where: { id: params.id } });
  revalidatePath('/admin/products');
  revalidatePath('/');
  revalidatePath('/shop');

  if (existing) {
    await deleteImages([...(existing.images as string[]), ...(existing.spinImages as string[])]);
  }

  return NextResponse.json({ ok: true });
}
