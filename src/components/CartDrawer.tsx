'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, selectTotal, lineKey } from '@/store/useCart';
import { formatPrice } from '@/lib/currency';

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCart();
  const total = useCart(selectTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            style={{ willChange: 'transform' }}
            className="panel-solid fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-wide">Your Cart</h2>
              <button onClick={close} aria-label="Close cart" className="p-2 text-xl">
                ✕
              </button>
            </div>

            <div className="no-scrollbar mt-6 flex-1 space-y-4 overflow-y-auto">
              {items.length === 0 && (
                <p className="mt-20 text-center opacity-60">Your cart is empty.</p>
              )}
              {items.map((i) => {
                const key = lineKey(i);
                return (
                  <div key={key} className="glass flex gap-3 rounded-2xl p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-semibold">{i.name}</p>
                        <button onClick={() => remove(key)} aria-label="Remove">
                          🗑️
                        </button>
                      </div>
                      <p className="text-xs opacity-60">
                        Size {i.size} ·
                        <span
                          className="ml-1 inline-block h-3 w-3 translate-y-0.5 rounded-full"
                          style={{ background: i.colorHex }}
                        />
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setQty(key, i.qty - 1)} className="px-2">
                            −
                          </button>
                          <span>{i.qty}</span>
                          <button onClick={() => setQty(key, i.qty + 1)} className="px-2">
                            +
                          </button>
                        </div>
                        <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="mb-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="neon-text">{formatPrice(total)}</span>
              </div>
              {items.length === 0 ? (
                <button
                  disabled
                  className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 font-semibold text-white disabled:opacity-40"
                >
                  Checkout
                </button>
              ) : (
                <Link
                  href="/checkout"
                  onClick={close}
                  className="btn-glow block w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-3 text-center font-semibold text-white"
                >
                  Checkout
                </Link>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
