'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { NavItem } from '@/lib/nav';

/** One full-screen level of the menu. */
interface Panel {
  key: string;
  /** Absent on the root level, which shows no back row. */
  title?: string;
  entries: Entry[];
}

interface Entry {
  label: string;
  /** Navigates and closes the menu. */
  href?: string;
  /** Drills into a deeper level instead of navigating. */
  next?: Panel;
}

const SLIDE = { duration: 0.3, ease: [0.32, 0.72, 0, 1] as const };

/** Drilling deeper sends the old level left and brings the new one in from
 *  the right; going back reverses it. `custom` carries the direction. */
const panelVariants = {
  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' })
};

function ChevronRight({ size = 18 }: { size?: number }) {
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
      aria-hidden
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function ChevronLeft({ size = 20 }: { size?: number }) {
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
      aria-hidden
    >
      <polyline points="15 6 9 12 15 18" />
    </svg>
  );
}

/** Turns the header nav model into the drill-down tree the menu renders. */
function buildRoot(navItems: NavItem[], wishCount: number): Panel {
  const entries: Entry[] = navItems.map((item) =>
    item.groups?.length
      ? {
          label: item.label,
          next: {
            key: item.label,
            title: item.label,
            entries: item.groups.map((group) => ({
              label: group.label,
              next: {
                key: `${item.label}/${group.label}`,
                title: group.label,
                entries: group.items.map((sub) => ({ label: sub.label, href: sub.href }))
              }
            }))
          }
        }
      : { label: item.label, href: item.href }
  );

  entries.push({
    label: wishCount > 0 ? `Wishlist (${wishCount})` : 'Wishlist',
    href: '/wishlist'
  });

  return { key: 'root', entries };
}

export default function MobileMenu({
  open,
  onClose,
  navItems,
  wishCount,
  topOffset
}: {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  wishCount: number;
  /** Height of the fixed header the menu sits beneath. */
  topOffset: number;
}) {
  const root = buildRoot(navItems, wishCount);
  const [stack, setStack] = useState<Panel[]>([root]);
  // +1 drilling deeper (new level in from the right), -1 going back.
  const [direction, setDirection] = useState(1);

  // Freeze the page behind the menu; restore whatever was there before.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Always reopen at the top level rather than wherever the user left off.
  useEffect(() => {
    if (!open) {
      setStack([root]);
      setDirection(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const push = (panel: Panel) => {
    setDirection(1);
    setStack((s) => [...s, panel]);
  };

  const pop = () => {
    setDirection(-1);
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  };

  const current = stack[stack.length - 1];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ top: topOffset }}
          className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-[var(--bg)] lg:hidden"
        >
          {/* Levels are stacked absolutely so the outgoing and incoming panels
              slide past each other instead of reflowing the list. */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={current.key}
              custom={direction}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE}
              className="absolute inset-0 overflow-y-auto overscroll-contain"
            >
              {current.title && (
                <button
                  onClick={pop}
                  className="flex w-full items-center gap-3 border-b border-[var(--border)] px-6 py-5 text-left transition active:opacity-60"
                >
                  <ChevronLeft />
                  <span className="text-lg font-semibold uppercase tracking-wide">
                    {current.title}
                  </span>
                </button>
              )}

              <ul className="px-6 pb-16">
                {current.entries.map((entry) =>
                  entry.next ? (
                    <li key={entry.label}>
                      <button
                        onClick={() => push(entry.next!)}
                        className="flex w-full items-center justify-between border-b border-[var(--border)] py-5 text-left transition active:opacity-60"
                      >
                        <span className="text-lg font-semibold uppercase tracking-wide">
                          {entry.label}
                        </span>
                        <ChevronRight />
                      </button>
                    </li>
                  ) : (
                    <li key={entry.label}>
                      <Link
                        href={entry.href!}
                        onClick={onClose}
                        className="flex items-center justify-between border-b border-[var(--border)] py-5 text-lg font-semibold uppercase tracking-wide transition active:opacity-60"
                      >
                        {entry.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
