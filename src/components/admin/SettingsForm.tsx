'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/store/useToast';
import type { PublicSettings } from '@/lib/settings';

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
    address: settings.address
  });
  const [saving, setSaving] = useState(false);

  const field = (key: keyof typeof form, label: string) => (
    <div>
      <label className="mb-1 block text-sm font-medium opacity-80">{label}</label>
      <input
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
      />
    </div>
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
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

      <p className="-mb-2 rounded-xl bg-amber-500/10 px-4 py-2 text-xs text-amber-300">
        These are demo values from initial setup — enter your real bank account and Easypaisa
        number below so customer payments reach the right place.
      </p>

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
