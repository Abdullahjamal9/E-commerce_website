'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Shoe } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useToast } from '@/store/useToast';

export default function ProductCard({ shoe }: { shoe: Shoe }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(shoe.id));
  const notify = useToast((s) => s.show);
  const outOfStock = shoe.stock <= 0;

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 12, ry: px * 12 });
  };

  const reset = () => setTilt({ rx: 0, ry: 0 });

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    add({
      shoeId: shoe.id,
      name: shoe.name,
      price: shoe.price,
      colorHex: shoe.colors[0].hex,
      size: shoe.sizes[0],
      qty: 1,
      image: shoe.image
    });
    openCart();
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      className="group relative"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/product/${shoe.slug}`}>
        <div className="glass relative overflow-hidden rounded-3xl p-4 transition-shadow duration-300 group-hover:shadow-glow-purple">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWish(shoe.id);
              notify(wished ? `Removed ${shoe.name} from wishlist` : `Added ${shoe.name} to wishlist`);
            }}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 z-10 rounded-full bg-black/30 p-2 text-sm backdrop-blur"
          >
            {wished ? '❤️' : '🤍'}
          </button>

          {outOfStock && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur">
              Out of stock
            </span>
          )}

          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/0 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shoe.image}
              alt={shoe.name}
              className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 ${outOfStock ? 'grayscale' : ''}`}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="font-semibold">{shoe.name}</p>
              <p className="text-xs opacity-60">{shoe.tagline}</p>
            </div>
            <p className="font-bold neon-text">{formatPrice(shoe.price)}</p>
          </div>

          <div className="mt-2 flex gap-1.5">
            {shoe.colors.map((c) => (
              <span
                key={c.hex}
                className="h-3 w-3 rounded-full ring-1 ring-white/20"
                style={{ background: c.hex }}
              />
            ))}
          </div>

          <motion.button
            onClick={quickAdd}
            disabled={outOfStock}
            initial={{ opacity: 0, y: 10 }}
            whileHover={outOfStock ? {} : { scale: 1.02 }}
            className="btn-glow mt-4 w-full rounded-full bg-gradient-to-r from-neon-blue to-neon-purple py-2 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 disabled:group-hover:opacity-60"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
}
