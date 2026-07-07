'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/currency';
import type { Shoe } from '@/lib/types';

export default function SearchBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative flex items-center">
      <AnimatePresence>
        {open && (
          <motion.input
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
            }}
            placeholder="Search products…"
            className="glass mr-1 rounded-full px-3 py-1.5 text-sm outline-none"
          />
        )}
      </AnimatePresence>

      <button
        aria-label="Search"
        onClick={() => setOpen((s) => !s)}
        className="rounded-full p-2 transition hover:bg-white/10"
      >
        🔍
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl p-2 shadow-glow"
          >
            {loading && <p className="px-3 py-3 text-sm opacity-60">Searching…</p>}

            {!loading && results.length === 0 && (
              <p className="px-3 py-3 text-sm opacity-60">No products found.</p>
            )}

            {!loading &&
              results.map((shoe) => (
                <Link
                  key={shoe.id}
                  href={`/product/${shoe.slug}`}
                  onClick={close}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shoe.image}
                    alt={shoe.name}
                    className="h-10 w-10 flex-shrink-0 rounded-lg bg-white/5 object-contain p-1"
                  />
                  <span className="flex-1 overflow-hidden">
                    <span className="block truncate text-sm font-medium">{shoe.name}</span>
                    <span className="block text-xs opacity-60">{formatPrice(shoe.price)}</span>
                  </span>
                </Link>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
