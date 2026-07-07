'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import FloatingBackground from './FloatingBackground';

export default function ForgotPasswordForm({ storeName }: { storeName: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <FloatingBackground />

      <div className="glass relative z-10 w-full max-w-sm space-y-5 rounded-3xl p-8">
        <div className="text-center">
          <Image src={logo} alt={storeName} width={40} height={40} className="mx-auto" />
          <p className="mt-2 text-xl font-black tracking-[0.3em] neon-text">{storeName}</p>
          <p className="mt-2 text-sm opacity-60">Reset admin password</p>
        </div>

        {sent ? (
          <p className="rounded-xl bg-white/5 px-4 py-3 text-sm opacity-80">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium opacity-80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/5 px-4 py-2.5 outline-none ring-1 ring-white/10 focus:ring-white/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <Link href="/admin/login" className="block text-center text-xs opacity-60 hover:opacity-100">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
