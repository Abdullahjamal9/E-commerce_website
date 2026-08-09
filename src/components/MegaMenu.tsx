'use client';

import Link from 'next/link';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NavItem } from '@/lib/nav';

/** Keep this much clear space between the panel and the window edge. */
const VIEWPORT_MARGIN = 12;

/**
 * Header nav entry. Plain items are links; items carrying columns open a
 * mega panel on hover, the pattern the reference storefront uses for its
 * category menus.
 */
export default function MegaMenu({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasPanel = Boolean(item.columns?.length);

  // The panel is anchored to its trigger, so for nav items near either end of
  // the bar it would otherwise hang off-screen. Measure once open and nudge it
  // back inside the viewport instead of letting the page scroll sideways.
  const clampToViewport = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;

    setShift((current) => {
      const rect = el.getBoundingClientRect();
      // Work from the un-shifted position so repeated runs stay stable.
      const left = rect.left - current;
      const right = rect.right - current;

      const overflowRight = right - (window.innerWidth - VIEWPORT_MARGIN);
      if (overflowRight > 0) return -Math.min(overflowRight, left - VIEWPORT_MARGIN);
      if (left < VIEWPORT_MARGIN) return VIEWPORT_MARGIN - left;
      return 0;
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setShift(0);
      return;
    }
    clampToViewport();
    window.addEventListener('resize', clampToViewport);
    return () => window.removeEventListener('resize', clampToViewport);
  }, [open, clampToViewport]);

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        className="group relative flex items-center gap-1 py-2 text-[13px] font-medium uppercase tracking-wide transition hover:opacity-70"
      >
        {item.label}
        {hasPanel && (
          <svg
            width="11"
            height="11"
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
        )}
      </Link>

      <AnimatePresence>
        {hasPanel && open && (
          // pt-3 rather than mt-3 keeps the panel adjacent to the trigger, so
          // the pointer never crosses a gap that would close it early.
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{ left: shift }}
            className="absolute top-full z-50 pt-3"
          >
            <div
              className="grid w-max max-w-[calc(100vw-24px)] gap-x-10 gap-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-7 shadow-[0_12px_32px_-12px_rgba(21,21,21,0.25)]"
              style={{
                gridTemplateColumns: `repeat(${item.columns!.length}, minmax(0, max-content))`
              }}
            >
              {item.columns!.map((col, i) => (
                <div key={i}>
                  {col.title && (
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      {col.title}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {col.items.map((sub) => (
                      <li key={sub.href + sub.label}>
                        <Link
                          href={sub.href}
                          className="block whitespace-nowrap text-sm transition hover:underline"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
