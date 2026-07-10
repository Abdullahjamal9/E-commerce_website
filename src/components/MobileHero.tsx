'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import banner from '@/assets/mobile-banner.png';

export default function MobileHero() {
  return (
    <section className="relative flex h-[100svh] w-full flex-col items-center justify-end overflow-hidden bg-black pb-16 pt-24 text-center md:hidden">
      <Image
        src={banner}
        alt="Footwear, apparel and accessories"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />

      <div className="relative z-10 flex flex-col items-center px-4">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-widest text-white"
        >
          ✨ NEW ARRIVALS
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-6 text-4xl font-black leading-tight text-white"
        >
          Step Into the <br />
          <span className="neon-text animate-shimmer">Future of Style</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="mx-auto mt-6 max-w-md text-base text-white/80"
        >
          Quality footwear, apparel, and accessories with fast delivery, easy returns, and
          trusted payment options.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex w-full flex-col items-center gap-4"
        >
          <a
            href="/shop"
            className="btn-glow w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 text-center font-semibold text-white"
          >
            Shop Now
          </a>
          <a
            href="/collections"
            className="glass w-full rounded-full px-8 py-3 text-center font-semibold text-white transition hover:bg-white/10"
          >
            Explore Collection
          </a>
        </motion.div>
      </div>
    </section>
  );
}
