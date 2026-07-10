'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useCart, selectTotal, lineKey } from '@/store/useCart';
import { useToast } from '@/store/useToast';
import { formatPrice } from '@/lib/currency';
import type { PublicSettings } from '@/lib/settings';

type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export default function CheckoutForm({ settings }: { settings: PublicSettings }) {
  const router = useRouter();
  const { items, clear } = useCart();
  const total = useCart(selectTotal);
  const notify = useToast((s) => s.show);

  const defaultMethod: PaymentMethod = settings.codEnabled ? 'COD' : 'BANK_TRANSFER';
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '', city: '' });
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentProof, setPaymentProof] = useState<string[]>([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(
    () =>
      items.length > 0 &&
      form.customerName &&
      form.email &&
      form.phone &&
      form.address &&
      form.city &&
      (method !== 'BANK_TRANSFER' || (transactionRef.trim().length > 0 && paymentProof.length > 0)),
    [items, form, method, transactionRef, paymentProof]
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 pb-20 pt-32 text-center">
        <p className="text-xl font-semibold">Your cart is empty</p>
        <p className="mt-2 opacity-60">Add a few pairs before checking out.</p>
        <Link
          href="/shop"
          className="btn-glow mt-6 inline-block rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  const onProofSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (paymentProof.length + files.length > 2) {
      notify('You can attach up to 2 screenshots');
      e.target.value = '';
      return;
    }

    setUploadingProof(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map((f) =>
          upload(`uploads/${f.name}`, f, { access: 'public', handleUploadUrl: '/api/orders/upload-proof' })
        )
      );
      setPaymentProof((prev) => [...prev, ...uploaded.map((b) => b.url)]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed');
    }
    setUploadingProof(false);
    e.target.value = '';
  };

  const removeProof = (url: string) => setPaymentProof((prev) => prev.filter((u) => u !== url));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        paymentMethod: method,
        transactionRef: transactionRef || undefined,
        paymentProof,
        items: items.map((i) => ({
          shoeId: i.shoeId,
          size: i.size,
          colorHex: i.colorHex,
          qty: i.qty
        }))
      })
    });

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not place order');
      return;
    }

    clear();
    notify('Order placed successfully!');
    router.push(`/order-confirmation/${data.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
      <h1 className="mb-8 text-center text-3xl font-black sm:text-4xl">
        <span className="neon-text">Checkout</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Full Name</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="03XXXXXXXXX"
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">Address</label>
            <input
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium opacity-80">City</label>
            <input
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium opacity-80">Payment Method</p>
            <div className="space-y-2">
              {settings.codEnabled && (
                <label
                  className={`glass flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 transition ${method === 'COD' ? 'ring-white/40' : 'ring-transparent'}`}
                >
                  <input
                    type="radio"
                    checked={method === 'COD'}
                    onChange={() => setMethod('COD')}
                  />
                  <span>
                    <span className="font-medium">Cash on Delivery</span>
                    <span className="block text-xs opacity-60">Pay when your order arrives</span>
                  </span>
                </label>
              )}
              {settings.bankTransferEnabled && (
                <label
                  className={`glass flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 transition ${method === 'BANK_TRANSFER' ? 'ring-white/40' : 'ring-transparent'}`}
                >
                  <input
                    type="radio"
                    checked={method === 'BANK_TRANSFER'}
                    onChange={() => setMethod('BANK_TRANSFER')}
                  />
                  <span>
                    <span className="font-medium">Bank Transfer / Easypaisa</span>
                    <span className="block text-xs opacity-60">
                      Pay manually using the details below, then submit your transaction ID
                    </span>
                  </span>
                </label>
              )}
            </div>
          </div>

          {method === 'BANK_TRANSFER' && (
            <div className="glass space-y-1.5 rounded-xl p-4 text-sm">
              <p className="font-semibold opacity-80">Send payment to:</p>
              {settings.bankName && (
                <p>
                  Bank: {settings.bankName} · {settings.bankAccountName} ·{' '}
                  {settings.bankAccountNumber}
                </p>
              )}
              {settings.easypaisaNumber && <p>Easypaisa: {settings.easypaisaNumber}</p>}
              <p className="pt-1 text-xs opacity-60">
                This payment must be completed manually using your own bank or Easypaisa app. Once
                you submit your transaction ID, our team will verify the payment and send you a
                confirmation email.
              </p>
              <input
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Transaction ID / reference (required)"
                className="mt-2 w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
              />

              <div className="pt-2">
                <p className="text-xs opacity-60">Payment screenshot (required)</p>
                {paymentProof.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {paymentProof.map((url) => (
                      <div key={url} className="group relative h-16 w-16 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeProof(url)}
                          className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={onProofSelected}
                  disabled={uploadingProof || paymentProof.length >= 2}
                  className="mt-2 text-xs"
                />
                {uploadingProof && <p className="mt-1 text-xs opacity-60">Uploading…</p>}
              </div>
            </div>
          )}

          {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3.5 font-semibold text-white disabled:opacity-40"
          >
            {submitting ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
          </button>
        </form>

        <div className="glass space-y-4 rounded-3xl p-6 sm:p-8">
          <p className="font-semibold">Order Summary</p>
          <div className="space-y-3">
            {items.map((i) => (
              <div key={lineKey(i)} className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image} alt={i.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  <p className="text-xs opacity-60">
                    Size {i.size} · Qty {i.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="neon-text">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
