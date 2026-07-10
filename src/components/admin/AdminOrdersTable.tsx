'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/currency';
import Pagination from './Pagination';

const PAGE_SIZE = 50;

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string | Date;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-300',
  CONFIRMED: 'bg-blue-500/20 text-blue-300',
  SHIPPED: 'bg-purple-500/20 text-purple-300',
  DELIVERED: 'bg-green-500/20 text-green-300',
  CANCELLED: 'bg-red-500/20 text-red-300',
  PAID: 'bg-green-500/20 text-green-300',
  AWAITING_VERIFICATION: 'bg-yellow-500/20 text-yellow-300',
  FAILED: 'bg-red-500/20 text-red-300'
};

export default function AdminOrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [rows, setRows] = useState(orders);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === 'All' ? rows : rows.filter((o) => o.orderStatus === filter)),
    [rows, filter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const deleteOrder = async (id: string, orderNumber: string) => {
    if (!confirm(`Delete order ${orderNumber}? This cannot be undone.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) {
      alert('Failed to delete order.');
      return;
    }
    setRows((prev) => prev.filter((o) => o.id !== id));
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {['All', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === s ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'glass opacity-70'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm opacity-60">No orders here.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide opacity-50">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4" />
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 opacity-70">{o.customerName}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLORS[o.paymentStatus]}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${STATUS_COLORS[o.orderStatus]}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{formatPrice(o.total)}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => deleteOrder(o.id, o.orderNumber)}
                      disabled={deletingId === o.id}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                    >
                      {deletingId === o.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
