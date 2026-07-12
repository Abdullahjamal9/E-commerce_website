'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import ScrollableChipRow from './ScrollableChipRow';
import type { Shoe, Tag } from '@/lib/types';

export default function ProductGrid({
  products,
  tags
}: {
  products: Shoe[];
  tags: Tag[];
}) {
  const [active, setActive] = useState<Tag | 'All'>('All');

  const filtered = useMemo(
    () => (active === 'All' ? products : products.filter((p) => p.tags.includes(active))),
    [active, products]
  );

  if (products.length === 0) return null;

  const filters: (Tag | 'All')[] = ['All', ...tags];

  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black sm:text-4xl">
          The <span className="neon-text">Collection</span>
        </h2>
        <p className="mt-2 opacity-60">Engineered silhouettes for every dimension.</p>
      </div>

      <div className="mb-10">
        <ScrollableChipRow className="pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                active === f
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-glow'
                  : 'glass opacity-70 hover:opacity-100'
              }`}
            >
              {f}
            </button>
          ))}
        </ScrollableChipRow>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {filtered.map((shoe) => (
          <ProductCard key={shoe.id} shoe={shoe} />
        ))}
      </motion.div>
    </section>
  );
}
