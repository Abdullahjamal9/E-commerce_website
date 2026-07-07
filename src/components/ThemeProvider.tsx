'use client';

import { useEffect } from 'react';
import { useTheme } from '@/store/useTheme';

/**
 * Syncs the theme store to the <html> element class so Tailwind's
 * `dark:` variants and CSS variables react to the toggle.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useTheme((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.classList.toggle('light', mode === 'light');
  }, [mode]);

  return <>{children}</>;
}
