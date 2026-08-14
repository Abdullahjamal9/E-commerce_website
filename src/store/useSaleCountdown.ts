'use client';

import { create } from 'zustand';

/** Which sale the countdown belongs to — it decides the bar's wording and colour. */
export type SaleVariant = 'azadi' | 'general';

interface SaleCountdownState {
  saleEndsAt: string | null;
  variant: SaleVariant;
  setSale: (endsAt: string | null, variant: SaleVariant) => void;
}

/** Hydrated once from server-fetched settings by SaleCountdownSync — see that component. */
export const useSaleCountdown = create<SaleCountdownState>((set) => ({
  saleEndsAt: null,
  variant: 'general',
  setSale: (saleEndsAt, variant) => set({ saleEndsAt, variant })
}));
