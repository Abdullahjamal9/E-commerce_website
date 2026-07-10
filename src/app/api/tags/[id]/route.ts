import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.tag.delete({ where: { id: params.id } });
  revalidatePath('/admin/tags');
  revalidatePath('/');
  revalidatePath('/shop');
  return NextResponse.json({ ok: true });
}
