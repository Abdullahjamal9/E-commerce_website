'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
// Below this luminance (0–255) the artwork counts as dark, so whatever sits on
// it is painted white instead of near-black. Set well under mid-grey on
// purpose: a patch that mixes dark marks with pale paper averages out around
// the middle, and near-black is the safer read on those.
const DARK_BACKDROP_LUMA = 105;
// Horizontal resolution of the backdrop reading. Artwork is rarely uniform
// across the full width — a dark panel under the wordmark and pale paper under
// the nav links is the normal case — so each item reads its own columns.
const LUMA_COLUMNS = 64;
// Vertical resolution of the same reading. The whole image is squashed into
// this grid and the band under the header is picked out by row.
const LUMA_ROWS = 256;

/** Row index into the luminance grid, kept inside it. */
function clampRow(row: number): number {
  return Math.min(LUMA_ROWS, Math.max(0, Math.round(row)));
}

/** A backdrop reading, plus the span of viewport it was taken across. */
interface Backdrop {
  columns: number[];
  left: number;
  width: number;
}

/**
 * Per-column luminance of the band of `img` running between the viewport
 * offsets `bandTop` and `bandBottom`, left to right. Returns null when the
 * pixels can't be read — a cross-origin image taints the canvas, and a
 * still-loading one has nothing to sample yet.
 */
function sampleHeaderStrip(img: HTMLImageElement, bandTop: number, bandBottom: number): Backdrop | null {
  const rect = img.getBoundingClientRect();
  if (!img.complete || !img.naturalWidth || rect.width === 0) return null;

  // The overlap between the band and the image, in viewport pixels.
  const top = Math.max(rect.top, bandTop);
  const bottom = Math.min(rect.bottom, bandBottom);
  if (bottom <= top) return null;

  // Only the band the glyphs occupy counts. Averaging the bar's full height
  // lets a diagonal edge that clips its top corner drag an otherwise pale
  // column dark, and the link then turns white over cream.
  const inset = (bottom - top) * 0.3;

  // Work in fractions of the image rather than pixel offsets. naturalWidth is
  // reported in CSS pixels, so on a 2x srcset candidate it is half the real
  // bitmap — source-rectangle arithmetic would then read the wrong half of the
  // artwork. Only the aspect ratio survives that, and it is all this needs:
  // the whole image goes into the grid below, and rows are picked from it.
  const fullHeight = rect.width * (img.naturalHeight / img.naturalWidth);
  // Allowance for the vertical crop object-cover applies when height-capped.
  const cropTop = Math.max(0, (fullHeight - rect.height) / 2);
  const firstRow = clampRow(((cropTop + top + inset - rect.top) / fullHeight) * LUMA_ROWS);
  const lastRow = clampRow(((cropTop + bottom - inset - rect.top) / fullHeight) * LUMA_ROWS);
  const rows = Math.max(1, lastRow - firstRow);

  try {
    const canvas = document.createElement('canvas');
    canvas.width = LUMA_COLUMNS;
    canvas.height = LUMA_ROWS;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    // Five-argument form: the entire image, scaled — no source rectangle, so
    // nothing here depends on how the bitmap's pixels are counted.
    ctx.drawImage(img, 0, 0, LUMA_COLUMNS, LUMA_ROWS);
    const { data } = ctx.getImageData(0, firstRow, LUMA_COLUMNS, rows);

    const columns = Array.from({ length: LUMA_COLUMNS }, (_, col) => {
      let total = 0;
      for (let row = 0; row < rows; row++) {
        const i = (row * LUMA_COLUMNS + col) * 4;
        total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }
      return total / rows;
    });
    // Carry the image's own box: it need not span the viewport edge to edge,
    // and a scrollbar alone would skew the mapping.
    return { columns, left: rect.left, width: rect.width };
  } catch {
    return null;
  }
}

/** Mean luminance of `backdrop` across `left`–`right` viewport pixels. */
function lumaAcross(backdrop: Backdrop, left: number, right: number): number {
  const { columns, width } = backdrop;
  const first = Math.max(0, Math.floor(((left - backdrop.left) / width) * columns.length));
  const last = Math.min(columns.length - 1, Math.ceil(((right - backdrop.left) / width) * columns.length) - 1);
  let total = 0;
  let n = 0;
  for (let i = first; i <= last; i++) {
    total += columns[i];
    n++;
  }
  return n === 0 ? 255 : total / n;
}

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
  navItems
}: {
  storeName: string;
  navItems: NavItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [backdrop, setBackdrop] = useState<Backdrop | null>(null);
  const [desktop, setDesktop] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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

  // Phones and tablets get a plain fixed bar — square, opaque, no reading of
  // the artwork behind it — and the page pads itself clear of it. The floating
  // rounded pill is desktop-only, matching the lg: breakpoint the nav's own
  // layout switches at.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Close both overlays whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // While see-through, the header takes its contrast from whatever artwork it
  // is lying on. Re-read it per page and on resize, since a breakpoint swap
  // can put a completely different banner underneath.
  useEffect(() => {
    let cancelled = false;

    const read = () => {
      if (cancelled) return;
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>('[data-header-backdrop] img, img[data-header-backdrop]')
      );
      // Both breakpoint variants are in the DOM; only the rendered one counts.
      const img = images.find((el) => el.getBoundingClientRect().width > 0);
      if (!img) {
        setBackdrop(null);
        return;
      }
      if (!img.complete) {
        img.addEventListener('load', read, { once: true });
        return;
      }
      // Where the bar comes to rest, not where it happens to be: it is still
      // animating in on first paint, and on desktop it settles 16px lower
      // than the announcement strip it clears.
      const bandTop = ANNOUNCEMENT_H + (desktop ? 16 : 0);
      setBackdrop(sampleHeaderStrip(img, bandTop, bandTop + HEADER_H));
    };

    // One frame's grace so layout (and the height cap on the banner) settles.
    const raf = requestAnimationFrame(read);
    window.addEventListener('resize', read);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', read);
    };
  }, [pathname, desktop]);

  // Menu open pins the header to the top edge, full width, so the panel
  // beneath it lines up with the header's bottom instead of a floating bar.
  const docked = scrolled || menuOpen;
  // See-through over the page's own artwork at rest; opaque once it has
  // scrolled onto ordinary content, been pointed at, or has a panel hanging
  // off it — anything opaque goes back to the standard near-black type. Below
  // lg it is simply always opaque.
  const solid = docked || mobileSearchOpen || hovered || !desktop;
  // Square and edge-to-edge except while resting on desktop artwork.
  const floating = desktop && !docked;

  // Paint each link and button from the columns of artwork directly beneath
  // it: a wordmark on a dark panel goes white while nav links on pale paper
  // next to it stay black. Done against the DOM rather than through props so
  // items owned by MegaMenu and SearchBox are covered too.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const targets = Array.from(header.querySelectorAll<HTMLElement>('a, button'));
    const clear = () => targets.forEach((el) => el.style.removeProperty('color'));

    if (solid || !backdrop) {
      clear();
      return;
    }

    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) {
        el.style.removeProperty('color');
        return;
      }
      const luma = lumaAcross(backdrop, rect.left, rect.right);
      el.style.setProperty('color', luma < DARK_BACKDROP_LUMA ? '#ffffff' : '#151515');
    });

    return clear;
  }, [solid, backdrop, pathname]);

  // The overall reading decides the hairline, which spans the whole bar and so
  // can't follow any one patch of artwork.
  const averageLuma = backdrop
    ? backdrop.columns.reduce((sum, l) => sum + l, 0) / backdrop.columns.length
    : 255;
  const borderTone = averageLuma < DARK_BACKDROP_LUMA ? 'border-white/40' : 'border-black/20';

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0, top: ANNOUNCEMENT_H, left: 0, right: 0, borderRadius: 0 }}
        animate={{
          opacity: 1,
          top: docked ? 0 : ANNOUNCEMENT_H + (floating ? 16 : 0),
          left: floating ? '3%' : 0,
          right: floating ? '3%' : 0,
          borderRadius: floating ? 28 : 0
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed z-[60] shadow-glow transition-colors duration-300 ${
          solid
            ? 'glass'
            : // Utilities rather than .glass here: that class is defined after
              // Tailwind's layers, so its own background could never be beaten.
              `header-adaptive border bg-transparent ${borderTone}`
        }`}
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
