import Link from 'next/link';
import { createFreshPrismaClient } from '@/lib/db';
import { formatPrice } from '@/lib/currency';

export default async function AdminDashboardPage() {
  // A long-warm serverless instance was found to serve a frozen row count
  // over the shared connection minutes after real writes elsewhere (Turso
  // connection-level staleness, not a caching layer we control) — a fresh
  // connection per request sidesteps it for this page's stats.
  const prisma = createFreshPrismaClient();
  const [productIds, pendingOrderIds, paidOrders, recentOrders] = await Promise.all([
    prisma.product.findMany({ select: { id: true } }),
    prisma.order.findMany({ where: { orderStatus: 'PENDING' }, select: { id: true } }),
    prisma.order.findMany({ where: { paymentStatus: 'PAID' }, select: { total: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  ]);
  await prisma.$disconnect();

  const productCount = productIds.length;
  const pendingOrders = pendingOrderIds.length;
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Products', value: productCount, href: '/admin/products' },
    { label: 'Pending Orders', value: pendingOrders, href: '/admin/orders' },
    { label: 'Revenue (paid)', value: formatPrice(revenue), href: '/admin/orders' }
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-black sm:text-3xl">
        Welcome back, <span className="neon-text">Admin</span>
      </h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="glass rounded-2xl p-6 transition hover:bg-white/5">
            <p className="text-sm opacity-60">{s.label}</p>
            <p className="mt-2 text-3xl font-black neon-text">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold">Recent Orders</p>
          <Link href="/admin/orders" className="text-sm opacity-60 hover:opacity-100">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm opacity-60">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5"
              >
                <span className="font-medium">{o.orderNumber}</span>
                <span className="opacity-60">{o.customerName}</span>
                <span className="opacity-60">{o.orderStatus}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
