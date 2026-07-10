'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  // Collapsed icons are centered by anchoring to the link's own midpoint
  // (left-1/2 -translate-x-1/2) rather than flex justify-center — that way
  // the icon's position never depends on the (invisible) label's width, so
  // it lines up exactly with the logo above, which uses the same technique.
  const NavLinks = ({ collapsible, onNavigate }: { collapsible?: boolean; onNavigate?: () => void }) => (
    <nav className="flex-1 space-y-1">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={`relative block h-11 rounded-xl text-sm font-medium transition ${
            isActive(l.href) ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'opacity-70 hover:bg-white/10 hover:opacity-100'
          }`}
        >
          <span
            className={
              collapsible
                ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-200 group-hover:left-3 group-hover:translate-x-0'
                : 'absolute left-3 top-1/2 -translate-y-1/2 text-base'
            }
          >
            {l.icon}
          </span>
          <span
            className={
              collapsible
                ? 'absolute left-11 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                : 'absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap'
            }
          >
            {l.label}
          </span>
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-base font-black uppercase tracking-widest neon-text">
          <Image src={logo} alt={storeName} width={22} height={22} />
          {storeName}
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-xl hover:bg-white/10"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="panel-solid fixed inset-y-0 left-0 z-50 flex w-64 flex-col p-5 md:hidden"
              style={{ willChange: 'transform' }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-lg font-black uppercase tracking-[0.3em] neon-text"
                >
                  <Image src={logo} alt={storeName} width={24} height={24} />
                  {storeName}
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-1.5 hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <NavLinks onNavigate={() => setMobileOpen(false)} />

              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="mb-2 rounded-xl px-3 py-2 text-sm opacity-60 transition hover:opacity-100"
              >
                ← Back to store
              </Link>
              <button
                onClick={logout}
                className="rounded-xl px-3 py-2 text-left text-sm opacity-60 transition hover:bg-white/10 hover:opacity-100"
              >
                🚪 Logout
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar — collapsed to icons, expands on hover. `peer` lets the
          <main> sibling react to this hover too, so it can make room instead
          of being covered when the sidebar expands. */}
      <aside className="group peer glass fixed inset-y-0 left-0 z-30 hidden h-screen w-16 flex-col overflow-hidden p-3 transition-all duration-300 ease-out hover:w-60 hover:p-5 md:flex">
        <Link href="/admin" className="relative mb-8 block h-8 font-black tracking-[0.15em]">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group-hover:left-3 group-hover:translate-x-0">
            <Image src={logo} alt={storeName} width={32} height={32} className="flex-shrink-0" />
          </span>
          <span className="neon-text absolute left-14 top-[58%] -translate-y-1/2 overflow-hidden whitespace-nowrap text-sm uppercase leading-[16px] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {storeName.split(' ').map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </span>
        </Link>

        <NavLinks collapsible />

        <Link href="/" className="relative mb-2 block h-9 rounded-xl text-sm opacity-60 transition hover:opacity-100">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-200 group-hover:left-3 group-hover:translate-x-0">
            ←
          </span>
          <span className="absolute left-11 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Back to store
          </span>
        </Link>
        <button
          onClick={logout}
          className="relative block h-9 w-full rounded-xl text-left text-sm opacity-60 transition hover:bg-white/10 hover:opacity-100"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-200 group-hover:left-3 group-hover:translate-x-0">
            🚪
          </span>
          <span className="absolute left-11 top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Logout
          </span>
        </button>
      </aside>
    </>
  );
}
