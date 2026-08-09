'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, selectCount } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import SearchBox from './SearchBox';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import { BagIcon, HeartIcon, XIcon } from './icons';
import type { NavItem } from '@/lib/nav';
import logo from '@/assets/logo.png';

// Height of the announcement strip (h-9) the fixed header has to clear at
// rest; once scrolled the strip has moved away and the header sits at 0.
const ANNOUNCEMENT_H = 36;
// Matches the nav's h-16 — the menu panel starts right below it.
const HEADER_H = 64;

function SearchIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function MenuIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

export default function Navbar({
  storeName,
  navItems,
  saleEnabled
}: {
  storeName: string;
  navItems: NavItem[];
  saleEnabled: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const count = useCart(selectCount);
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close both overlays whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // The sale banner has a light background and sits directly under the nav on
  // these pages — force dark text there until scrolled onto normal content.
  const overLightBanner = saleEnabled && (pathname === '/' || pathname === '/shop') && !scrolled;
  // Menu open pins the header to the top edge, full width, so the panel
  // beneath it lines up with the header's bottom instead of a floating bar.
  const docked = scrolled || menuOpen;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, top: ANNOUNCEMENT_H + 16, left: '3%', right: '3%', borderRadius: 28 }}
        animate={{
          opacity: 1,
          top: docked ? 0 : ANNOUNCEMENT_H + 16,
          left: docked ? 0 : '3%',
          right: docked ? 0 : '3%',
          borderRadius: docked ? 0 : 28
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`glass fixed z-[60] shadow-glow transition-colors duration-300 ${overLightBanner ? 'text-[#151515]' : ''}`}
      >
        <nav className="relative mx-auto flex h-16 max-w-site items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left — hamburger on mobile, wordmark on desktop */}
          <div className="flex flex-1 items-center lg:flex-none">
            <button
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="-ml-2 rounded-full p-2 transition hover:bg-[var(--surface-alt)] lg:hidden"
            >
              {menuOpen ? <XIcon size={22} /> : <MenuIcon />}
            </button>

            <Link
              href="/"
              className="hidden flex-shrink-0 items-center gap-2 text-lg font-black uppercase tracking-[0.25em] neon-text lg:flex"
            >
              <Image src={logo} alt={storeName} width={26} height={26} priority />
              {storeName}
            </Link>
          </div>

          {/* Centre — wordmark, mobile only */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-2.5 text-[15px] font-black uppercase tracking-[0.2em] neon-text lg:hidden"
          >
            {storeName}
          </Link>

          <ul className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <MegaMenu key={item.label} item={item} />
            ))}
          </ul>

          {/* Right — search + cart on mobile; full icon set on desktop */}
          <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-2 lg:flex-none">
            <div className="hidden lg:block">
              <SearchBox />
            </div>

            <button
              aria-label="Search"
              onClick={() => {
                setMenuOpen(false);
                setMobileSearchOpen((s) => !s);
              }}
              className="rounded-full p-2 transition hover:bg-[var(--surface-alt)] lg:hidden"
            >
              <SearchIcon />
            </button>

            <Link
              href="/wishlist"
              aria-label="Open wishlist"
              className="relative hidden rounded-full p-2 transition hover:bg-[var(--surface-alt)] lg:block"
            >
              <HeartIcon filled={false} />
              {wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-[var(--accent-fg)]">
                  {wishCount}
                </span>
              )}
            </Link>

            <button
              data-cart-target
              aria-label="Open cart"
              onClick={openCart}
              className="relative -mr-2 rounded-full p-2 transition hover:bg-[var(--surface-alt)] sm:mr-0"
            >
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-[var(--accent-fg)]">
                  {count}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile search drops out of the bar rather than squeezing into it. */}
        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden border-t border-[var(--border)] lg:hidden"
            >
              <div className="px-4 py-3">
                <SearchBox variant="inline" onNavigate={() => setMobileSearchOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        wishCount={wishCount}
        topOffset={HEADER_H}
      />
    </>
  );
}
