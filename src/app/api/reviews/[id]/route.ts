import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';
import { deleteBlobs } from '@/lib/blob';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const review = await prisma.review.delete({
    where: { id: params.id },
    include: { product: { select: { slug: true } } }
  });
  revalidatePath('/admin/reviews');
  revalidatePath(`/product/${review.product.slug}`);
  await deleteBlobs(review.images as string[]);
  return NextResponse.json({ ok: true });
}
