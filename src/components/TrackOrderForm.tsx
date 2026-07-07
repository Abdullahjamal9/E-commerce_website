'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/currency';

interface OrderItem {
  id: string;
  productName: string;
  colorName: string;
  size: string;
  qty: number;
  price: number;
}

interface TrackedOrder {
  orderNumber: string;
  customerName: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  paymentStatus: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    const res = await fetch('/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not find that order');
      return;
    }
    setOrder(data);
  };

  const stepIndex = order ? ORDER_STEPS.indexOf(order.orderStatus) : -1;
  const cancelled = order?.orderStatus === 'CANCELLED';

  return (
    <div>
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-3xl p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Order Number</label>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ORD-1001"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Phone Number</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone used at checkout"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Searching…' : 'Track Order'}
        </button>
      </form>

      {order && (
        <div className="glass mt-6 rounded-3xl p-6 text-left sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{order.orderNumber}</p>
            <p className="text-xs opacity-60">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>

          {cancelled ? (
            <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">
              This order has been cancelled.
            </p>
          ) : (
            <div className="mt-6 flex items-center justify-between">
              {ORDER_STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        i <= stepIndex ? 'bg-gradient-to-r from-neon-blue to-neon-purple' : 'bg-white/15'
                      }`}
                    />
                    <p className={`mt-2 text-[10px] uppercase tracking-wide ${i <= stepIndex ? 'opacity-90' : 'opacity-40'}`}>
                      {step}
                    </p>
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div className={`mx-1 h-px flex-1 ${i < stepIndex ? 'bg-neon-blue' : 'bg-white/15'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-sm opacity-70">
            Payment:{' '}
            <span className="font-medium opacity-100">
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Bank Transfer / Easypaisa'} ·{' '}
              {order.paymentStatus.replace('_', ' ')}
            </span>
          </p>

          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} · {item.colorName} · Size {item.size} × {item.qty}
                </span>
                <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="neon-text">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
