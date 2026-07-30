'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/store/useTheme';

/**
 * Sun/moon slider — the thumb carries whichever icon matches the current
 * mode and slides to that side; the other side of the track stays empty.
 */
export default function ThemeToggle() {
  const mode = useTheme((s) => s.mode);
  const toggle = useTheme((s) => s.toggle);
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className="glass relative h-7 w-12 flex-shrink-0 rounded-full transition hover:opacity-90"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-md"
        style={{ left: isDark ? 'calc(100% - 1.625rem)' : '0.125rem' }}
      >
        {isDark ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
          </svg>
        ) : (
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </motion.span>
    </button>
  );
}
