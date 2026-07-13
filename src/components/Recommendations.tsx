'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Shoe } from '@/lib/types';
import ProductCard from './ProductCard';

export default function Recommendations({
  picks,
  storeName
}: {
  picks: Shoe[];
  storeName: string;
}) {
  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="text-2xl">🧠</span>
        <div>
          <h2 className="text-2xl font-black sm:text-3xl">
            AI <span className="neon-text">Recommended</span> for You
          </h2>
          <p className="text-sm opacity-60">
            Curated by {storeName} Intelligence · based on your style signals
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 gap-6 lg:grid-cols-4"
      >
        {picks.map((shoe) => (
          <ProductCard key={shoe.id} shoe={shoe} />
        ))}
      </motion.div>

      <div className="mt-16">
        <h3 className="text-2xl font-black uppercase sm:text-3xl">
          Shop Your <span className="neon-text">Style</span>
        </h3>
        <p className="mt-1 text-sm opacity-70">
          Handpicked essentials, curated to match how you move.
        </p>
        <Link
          href="/shop"
          className="btn-glow mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-5 py-2.5 text-sm font-semibold text-white"
        >
          See all
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
