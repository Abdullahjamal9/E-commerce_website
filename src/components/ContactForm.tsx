'use client';

import { useState } from 'react';
import { useToast } from '@/store/useToast';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const notify = useToast((s) => s.show);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSending(true);

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, message })
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);

    if (!res.ok) {
      setError(data.error ?? 'Could not send your message. Please try again.');
      return;
    }

    setSent(true);
    notify('Message sent — we will get back to you soon');
  };

  if (sent) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-3 font-semibold">Thanks for reaching out!</p>
        <p className="mt-1 text-sm opacity-60">
          We&apos;ll get back to you shortly. For urgent queries, message us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-3xl p-8">
      {error && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Phone</label>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium opacity-80">Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
