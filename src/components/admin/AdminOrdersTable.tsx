'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/currency';

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
  const [filter, setFilter] = useState('All');

  const visible = useMemo(
    () => (filter === 'All' ? orders : orders.filter((o) => o.orderStatus === filter)),
    [orders, filter]
  );

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

      {visible.length === 0 ? (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
