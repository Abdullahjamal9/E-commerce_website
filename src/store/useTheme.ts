'use client';

import { create } from 'zustand';

type Mode = 'dark' | 'light';

interface ThemeState {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

/**
 * Theme is applied to <html class="dark"> by ThemeProvider.
 * Default is dark to match the futuristic design language.
 */
export const useTheme = create<ThemeState>((set) => ({
  mode: 'dark',
  setMode: (mode) => set({ mode }),
  toggle: () => set((s) => ({ mode: s.mode === 'dark' ? 'light' : 'dark' }))
}));
