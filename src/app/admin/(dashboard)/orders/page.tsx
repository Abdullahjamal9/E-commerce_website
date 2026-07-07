import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import { prisma } from '@/lib/db';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black sm:text-3xl">Orders</h1>
      <div className="glass rounded-2xl p-6">
        <AdminOrdersTable orders={orders} />
      </div>
    </div>
  );
}
