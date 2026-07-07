'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import logo from '@/assets/logo.png';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '👟' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/tags', label: 'Tags', icon: '🔖' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' }
];

export default function AdminSidebar({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <aside className="glass flex h-screen w-60 flex-col p-5">
      <Link href="/admin" className="mb-8 flex items-center gap-2 text-lg font-black tracking-[0.3em] neon-text">
        <Image src={logo} alt={storeName} width={24} height={24} />
        {storeName}
      </Link>

      <nav className="flex-1 space-y-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(l.href) ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'opacity-70 hover:bg-white/10 hover:opacity-100'
            }`}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>

      <Link href="/" className="mb-2 rounded-xl px-3 py-2 text-sm opacity-60 transition hover:opacity-100">
        ← Back to store
      </Link>
      <button
        onClick={logout}
        className="rounded-xl px-3 py-2 text-left text-sm opacity-60 transition hover:bg-white/10 hover:opacity-100"
      >
        🚪 Logout
      </button>
    </aside>
  );
}
