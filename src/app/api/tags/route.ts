import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export async function GET() {
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(tags);
}

const schema = z.object({ name: z.string().trim().min(1).max(40) });

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid tag' }, { status: 400 });
  }

  const existing = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: 'That tag already exists' }, { status: 400 });
  }

  const tag = await prisma.tag.create({ data: { name: parsed.data.name } });
  revalidatePath('/admin/tags');
  revalidatePath('/');
  revalidatePath('/shop');
  return NextResponse.json(tag);
}
