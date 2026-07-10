'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/useToast';

const PAYMENT_STATUSES = ['PENDING', 'AWAITING_VERIFICATION', 'PAID', 'FAILED'];
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderStatusEditor({
  orderId,
  paymentStatus,
  orderStatus
}: {
  orderId: string;
  paymentStatus: string;
  orderStatus: string;
}) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = async (field: 'paymentStatus' | 'orderStatus', value: string) => {
    setSaving(true);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
    setSaving(false);
    if (!res.ok) {
      notify('Could not update order');
      return;
    }
    notify('Order updated');
    router.refresh();
  };

  const verifyPayment = async () => {
    setVerifying(true);
    const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'POST' });
    setVerifying(false);
    if (!res.ok) {
      notify('Could not verify payment');
      return;
    }
    notify('Payment verified — confirmation email sent to customer');
    router.refresh();
  };

  const deleteOrder = async () => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    setDeleting(true);
    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (!res.ok) {
      setDeleting(false);
      notify('Could not delete order');
      return;
    }
    notify('Order deleted');
    router.push('/admin/orders');
    router.refresh();
  };

  return (
    <div>
      {paymentStatus === 'AWAITING_VERIFICATION' && (
        <button
          onClick={verifyPayment}
          disabled={verifying}
          className="btn-glow mb-4 w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
        >
          {verifying ? 'Verifying…' : 'Verify Payment & Notify Customer'}
        </button>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Payment Status</label>
        <select
          defaultValue={paymentStatus}
          disabled={saving}
          onChange={(e) => update('paymentStatus', e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Order Status</label>
        <select
          defaultValue={orderStatus}
          disabled={saving}
          onChange={(e) => update('orderStatus', e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      </div>
      <button
        onClick={deleteOrder}
        disabled={deleting}
        className="mt-4 w-full rounded-full py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
      >
        {deleting ? 'Deleting…' : 'Delete Order'}
      </button>
    </div>
  );
}
