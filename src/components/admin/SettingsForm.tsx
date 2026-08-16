'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/useToast';
import type { PublicSettings } from '@/lib/settings';

/** Formats a Date for an <input type="datetime-local"> in the browser's local time. */
function toDatetimeLocal(date: Date | null) {
  if (!date) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function SettingsForm({ settings }: { settings: PublicSettings }) {
  const router = useRouter();
  const notify = useToast((s) => s.show);
  const [form, setForm] = useState({
    storeName: settings.storeName,
    bankName: settings.bankName,
    bankAccountName: settings.bankAccountName,
    bankAccountNumber: settings.bankAccountNumber,
    easypaisaNumber: settings.easypaisaNumber,
    codEnabled: settings.codEnabled,
    bankTransferEnabled: settings.bankTransferEnabled,
    contactPhone: settings.contactPhone,
    whatsappNumber: settings.whatsappNumber,
    contactEmail: settings.contactEmail,
    address: settings.address,
    facebookUrl: settings.facebookUrl,
    instagramUrl: settings.instagramUrl,
    saleEnabled: settings.saleEnabled,
    saleEndsAt: toDatetimeLocal(settings.saleEndsAt),
    generalSaleEnabled: settings.generalSaleEnabled,
    generalSaleEndsAt: toDatetimeLocal(settings.generalSaleEndsAt)
  });
  const [saving, setSaving] = useState(false);

  const field = (key: keyof typeof form, label: string) => (
    <div>
      <label className="mb-1 block text-sm font-medium opacity-80">{label}</label>
      <input
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-xl bg-[var(--surface-alt)] px-4 py-2.5 outline-none ring-1 ring-[var(--border)] focus:ring-[var(--fg)]"
      />
    </div>
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        saleEndsAt: form.saleEndsAt ? new Date(form.saleEndsAt).toISOString() : null,
        generalSaleEndsAt: form.generalSaleEndsAt ? new Date(form.generalSaleEndsAt).toISOString() : null
      })
    });
    setSaving(false);
    if (!res.ok) {
      notify('Could not save settings');
      return;
    }
    notify('Settings saved');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="glass max-w-2xl space-y-6 rounded-2xl p-6 sm:p-8">
      <div>
        <p className="mb-3 font-semibold">Payment Methods</p>
        <div className="space-y-2">
          <label className="glass flex items-center gap-3 rounded-xl p-3">
            <input
              type="checkbox"
              checked={form.codEnabled}
              onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })}
            />
            Cash on Delivery enabled
          </label>
          <label className="glass flex items-center gap-3 rounded-xl p-3">
            <input
              type="checkbox"
              checked={form.bankTransferEnabled}
              onChange={(e) => setForm({ ...form, bankTransferEnabled: e.target.checked })}
            />
            Bank Transfer / Easypaisa enabled
          </label>
        </div>
      </div>

      <div>
        <p className="mb-3 font-semibold">Independence Day sale</p>
        <label className="glass flex items-center gap-3 rounded-xl p-3">
          <input
            type="checkbox"
            checked={form.saleEnabled}
            onChange={(e) => setForm({ ...form, saleEnabled: e.target.checked })}
          />
          Independence Day sale running
        </label>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium opacity-80">
            Ends at (green &ldquo;Azadi Sale Ends In&rdquo; countdown on discounted products)
          </label>
          <input
            type="datetime-local"
            value={form.saleEndsAt}
            onChange={(e) => setForm({ ...form, saleEndsAt: e.target.value })}
            className="w-full rounded-xl bg-[var(--surface-alt)] px-4 py-2.5 outline-none ring-1 ring-[var(--border)] focus:ring-[var(--fg)]"
          />
        </div>
        <p className="mt-2 text-xs opacity-50">
          Leave this configured all year. Switching it back on next 14 August is all it takes.
        </p>
      </div>

      <div>
        <p className="mb-3 font-semibold">Sale (any time of year)</p>
        <label className="glass flex items-center gap-3 rounded-xl p-3">
          <input
            type="checkbox"
            checked={form.generalSaleEnabled}
            onChange={(e) => setForm({ ...form, generalSaleEnabled: e.target.checked })}
          />
          Sale running
        </label>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium opacity-80">
            Ends at (black &ldquo;Sale Ends In&rdquo; countdown on discounted products)
          </label>
          <input
            type="datetime-local"
            value={form.generalSaleEndsAt}
            onChange={(e) => setForm({ ...form, generalSaleEndsAt: e.target.value })}
            className="w-full rounded-xl bg-[var(--surface-alt)] px-4 py-2.5 outline-none ring-1 ring-[var(--border)] focus:ring-[var(--fg)]"
          />
        </div>
        <p className="mt-2 text-xs opacity-50">
          With both switched on, the Independence Day countdown is the one shown. Discounts
          themselves are set per product: open a product under Products and set its Discount %.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {field('storeName', 'Store Name')}
        {field('bankName', 'Bank Name')}
        {field('bankAccountName', 'Bank Account Name')}
        {field('bankAccountNumber', 'Bank Account Number')}
        {field('easypaisaNumber', 'Easypaisa Number')}
        {field('contactPhone', 'Contact Phone')}
        {field('whatsappNumber', 'WhatsApp Number (with country code, no +)')}
        {field('contactEmail', 'Contact Email')}
        {field('address', 'Address')}
        {field('facebookUrl', 'Facebook Page URL')}
        {field('instagramUrl', 'Instagram Profile URL')}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  );
}
