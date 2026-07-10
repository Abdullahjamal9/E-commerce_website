'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, selectCount } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useTheme } from '@/store/useTheme';
import SearchBox from './SearchBox';
import logo from '@/assets/logo.png';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' }
];

// Matches the max-h-72 box below at this row size (px-3 py-2, text-sm) — used to
// work out how many 176px-wide columns the category list needs.
const CATEGORY_COLUMN_WIDTH = 176;
const CATEGORY_ROWS_PER_COLUMN = 8;

function ShopMenu({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  // CSS columns only get extra columns if the container is actually wide enough
  // to hold them — a shrink-to-fit ancestor would otherwise lock it to one
  // column and clip the rest. So the width is computed explicitly from the
  // category count instead of left to "w-max".
  const columnCount = Math.max(1, Math.ceil(categories.length / CATEGORY_ROWS_PER_COLUMN));
  const panelWidth = columnCount * CATEGORY_COLUMN_WIDTH + (columnCount - 1) * 8;

  return (
    <li className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href="/shop"
        className="group relative flex items-center gap-1 text-sm font-medium opacity-80 transition hover:opacity-100"
      >
        Shop
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* pt-3 (not mt-3) keeps this region directly adjacent to the trigger —
          a margin gap here would create a dead zone where the mouse leaves
          the hoverable area before reaching the panel, closing it early. */}
      <AnimatePresence>
        {open && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full max-w-[90vw] -translate-x-1/2 pt-3"
            style={{ width: Math.min(panelWidth, 0.9 * (typeof window !== 'undefined' ? window.innerWidth : panelWidth)) }}
          >
            <div className="glass overflow-hidden rounded-2xl p-2 shadow-glow">
              <Link
                href="/shop"
                className="block rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
              >
                All Products
              </Link>
              <div className="my-1 border-t border-white/10" />
              {/* Fixed max-height + CSS columns: once the category list is taller than
                  this box, it flows into additional side-by-side columns instead of
                  scrolling, so every category stays reachable in one glance. The
                  container width above is computed to actually fit `columnCount`
                  columns — otherwise a shrink-wrapped ancestor caps it at one. */}
              <div
                className="max-h-72 [column-fill:auto]"
                style={{ columnCount, columnGap: '8px' }}
              >
                {categories.map((c) => (
                  <Link
                    key={c}
                    href={`/shop?category=${encodeURIComponent(c)}`}
                    className="block break-inside-avoid rounded-xl px-3 py-2 text-sm opacity-80 transition hover:bg-white/10 hover:opacity-100"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function Navbar({ storeName, categories }: { storeName: string; categories: string[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const count = useCart(selectCount);
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const mode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
    <motion.header
      initial={{ opacity: 0, top: 16, left: '3%', right: '3%', borderRadius: 28 }}
      animate={{
        opacity: 1,
        top: scrolled ? 0 : 16,
        left: scrolled ? 0 : '3%',
        right: scrolled ? 0 : '3%',
        borderRadius: scrolled ? 0 : 28
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="glass fixed z-50 shadow-glow"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-black uppercase tracking-[0.3em] neon-text">
          <Image src={logo} alt={storeName} width={28} height={28} priority />
          {storeName}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.slice(0, 1).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group relative text-sm font-medium opacity-80 transition hover:opacity-100"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
          <ShopMenu categories={categories} />
          {LINKS.slice(1).map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group relative text-sm font-medium opacity-80 transition hover:opacity-100"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <SearchBox />
          </div>

          <button
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="rounded-full p-2 transition hover:bg-white/10"
          >
            {mode === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            href="/wishlist"
            aria-label="Open wishlist"
            className="relative rounded-full p-2 transition hover:bg-white/10"
          >
            🤍
            <AnimatePresence>
              {wishCount > 0 && (
                <motion.span
                  key={wishCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-[10px] font-bold text-white"
                >
                  {wishCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            data-cart-target
            aria-label="Open cart"
            onClick={openCart}
            className="relative hidden rounded-full p-2 transition hover:bg-white/10 md:block"
          >
            🛍️
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-[10px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-xl transition hover:bg-white/10 md:hidden"
          >
            ☰
          </button>
        </div>
      </nav>
    </motion.header>

    {/* Mobile nav drawer — the header only shows icons on mobile, so this is
        the one place to reach Collections/About/Contact and the full
        category list; the bottom tab bar covers quick actions separately. */}
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 md:hidden"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="panel-solid fixed inset-y-0 right-0 z-[101] flex w-72 max-w-[85vw] flex-col overflow-y-auto p-5 md:hidden"
            style={{ willChange: 'transform' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-black uppercase tracking-[0.3em] neon-text">{storeName}</span>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <SearchBox variant="inline" onNavigate={() => setMenuOpen(false)} />
            </div>

            <nav className="flex flex-1 flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
              >
                Home
              </Link>

              <div>
                <button
                  onClick={() => setShopOpen((s) => !s)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
                >
                  Shop
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {shopOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-3"
                    >
                      <Link
                        href="/shop"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
                      >
                        All Products
                      </Link>
                      {categories.map((c) => (
                        <Link
                          key={c}
                          href={`/shop?category=${encodeURIComponent(c)}`}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm opacity-60 transition hover:bg-white/10 hover:opacity-100"
                        >
                          {c}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/collections"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
              >
                Collections
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
              >
                About
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm font-medium opacity-80 transition hover:bg-white/10 hover:opacity-100"
              >
                Contact
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  openCart();
                }}
                className="relative mt-auto flex w-full items-center justify-between rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold opacity-90 transition hover:bg-white/10"
              >
                <span className="flex items-center gap-2">🛍️ Cart</span>
                {count > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
