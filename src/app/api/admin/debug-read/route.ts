import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** Temporary diagnostic: compares query shapes for one product to find why
 *  the edit page reads stale image URLs while the list page reads fresh. */
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const [unique, first, many, raw] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.product.findFirst({ where: { id } }),
    prisma.product.findMany({ where: { id } }),
    prisma.$queryRawUnsafe<{ images: string }[]>(
      'SELECT images FROM Product WHERE id = ?',
      id
    )
  ]);

  const firstUrl = (v: unknown) => {
    try {
      const arr = typeof v === 'string' ? JSON.parse(v) : v;
      return Array.isArray(arr) ? arr[0] : null;
    } catch {
      return null;
    }
  };

  return NextResponse.json({
    findUnique: firstUrl(unique?.images),
    findFirst: firstUrl(first?.images),
    findMany: firstUrl(many[0]?.images),
    rawSql: firstUrl(raw[0]?.images),
    tokenTail: process.env.DATABASE_AUTH_TOKEN?.slice(-8)
  });
}
