'use client';

import { create } from 'zustand';

interface SaleCountdownState {
  saleEndsAt: string | null;
  setSaleEndsAt: (v: string | null) => void;
}

/** Hydrated once from server-fetched settings by SaleCountdownSync — see that component. */
export const useSaleCountdown = create<SaleCountdownState>((set) => ({
  saleEndsAt: null,
  setSaleEndsAt: (saleEndsAt) => set({ saleEndsAt })
}));
