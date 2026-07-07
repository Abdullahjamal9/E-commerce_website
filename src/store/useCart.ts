'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

/** Stable key for a cart line (same shoe + color + size stacks). */
export const lineKey = (i: Pick<CartItem, 'shoeId' | 'colorHex' | 'size'>) =>
  `${i.shoeId}::${i.colorHex}::${i.size}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item) =>
        set((s) => {
          const key = lineKey(item);
          const existing = s.items.find((i) => lineKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                lineKey(i) === key ? { ...i, qty: i.qty + item.qty } : i
              )
            };
          }
          return { items: [...s.items, item] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => lineKey(i) !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (lineKey(i) === key ? { ...i, qty: Math.max(1, qty) } : i))
        })),
      clear: () => set({ items: [] })
    }),
    { name: 'pss-cart' }
  )
);

export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0);
export const selectTotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.qty * i.price, 0);
