'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import FloatingBackground from './FloatingBackground';
import PasswordInput from './PasswordInput';

export default function ResetPasswordForm({
  storeName,
  token
}: {
  storeName: string;
  token: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not reset password');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/admin/login'), 2000);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <FloatingBackground />

      <div className="glass relative z-10 w-full max-w-sm space-y-5 rounded-3xl p-8">
        <div className="text-center">
          <Image src={logo} alt={storeName} width={40} height={40} className="mx-auto" />
          <p className="mt-2 text-xl font-black tracking-[0.3em] neon-text">{storeName}</p>
          <p className="mt-2 text-sm opacity-60">Set a new password</p>
        </div>

        {done ? (
          <p className="rounded-xl bg-white/5 px-4 py-3 text-sm opacity-80">
            Password updated. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium opacity-80">New password</label>
              <PasswordInput value={password} onChange={setPassword} required autoFocus />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium opacity-80">Confirm password</label>
              <PasswordInput value={confirm} onChange={setConfirm} required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Reset Password'}
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
