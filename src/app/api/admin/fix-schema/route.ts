import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAdminSession } from '@/lib/session';

/**
 * One-off, idempotent repair for production databases that predate the
 * discountPercent / saleEnabled columns — `prisma migrate deploy` can't run
 * against a libsql:// URL directly, so this applies the same ALTER TABLEs
 * through the app's own working connection instead. Safe to call repeatedly;
 * remove once production is confirmed up to date.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const productCols = (await prisma.$queryRawUnsafe(
    'PRAGMA table_info(Product);'
  )) as { name: string }[];
  const settingsCols = (await prisma.$queryRawUnsafe(
    'PRAGMA table_info(Settings);'
  )) as { name: string }[];
  const orderCols = (await prisma.$queryRawUnsafe(
    'PRAGMA table_info("Order");'
  )) as { name: string }[];

  const applied: string[] = [];

  if (!productCols.some((c) => c.name === 'discountPercent')) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Product" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;'
    );
    applied.push('Product.discountPercent');
  }

  if (!settingsCols.some((c) => c.name === 'saleEnabled')) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Settings" ADD COLUMN "saleEnabled" BOOLEAN NOT NULL DEFAULT false;'
    );
    applied.push('Settings.saleEnabled');
  }
  if (!settingsCols.some((c) => c.name === 'generalSaleEnabled')) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Settings" ADD COLUMN "generalSaleEnabled" BOOLEAN NOT NULL DEFAULT false;'
    );
    applied.push('Settings.generalSaleEnabled');
  }
  if (!settingsCols.some((c) => c.name === 'generalSaleEndsAt')) {
    await prisma.$executeRawUnsafe('ALTER TABLE "Settings" ADD COLUMN "generalSaleEndsAt" DATETIME;');
    applied.push('Settings.generalSaleEndsAt');
  }
  if (!orderCols.some((c) => c.name === 'deliveredAt')) {
    await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN "deliveredAt" DATETIME;');
    applied.push('Order.deliveredAt');
  }
  if (!orderCols.some((c) => c.name === 'orderStatusUnlocked')) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "Order" ADD COLUMN "orderStatusUnlocked" BOOLEAN NOT NULL DEFAULT false;'
    );
    applied.push('Order.orderStatusUnlocked');
  }
  if (settingsCols.some((c) => c.name === 'salePercent')) {
    await prisma.$executeRawUnsafe('ALTER TABLE "Settings" DROP COLUMN "salePercent";');
    applied.push('dropped Settings.salePercent');
  }
  if (settingsCols.some((c) => c.name === 'saleLabel')) {
    await prisma.$executeRawUnsafe('ALTER TABLE "Settings" DROP COLUMN "saleLabel";');
    applied.push('dropped Settings.saleLabel');
  }

  return NextResponse.json({ ok: true, applied });
}
