'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import FloatingBackground from './FloatingBackground';
import PasswordInput from './PasswordInput';

export default function AdminLoginForm({ storeName }: { storeName: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Login failed');
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <FloatingBackground />

      <form
        onSubmit={onSubmit}
        className="glass relative z-10 w-full max-w-sm space-y-5 rounded-3xl p-8"
      >
        <div className="text-center">
          <Image src={logo} alt={storeName} width={40} height={40} className="mx-auto" />
          <p className="mt-2 text-xl font-black tracking-[0.3em] neon-text">{storeName}</p>
          <p className="mt-2 text-sm opacity-60">Admin sign in</p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

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
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium opacity-80">Password</label>
            <Link href="/admin/forgot-password" className="text-xs opacity-60 hover:opacity-100">
              Forgot password?
            </Link>
          </div>
          <PasswordInput value={password} onChange={setPassword} required />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
