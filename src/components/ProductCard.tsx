'use client';

import Link from 'next/link';
import type { Shoe } from '@/lib/types';
import { formatPrice } from '@/lib/currency';
import { getSalePrice } from '@/lib/sale';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';
import { useCart } from '@/store/useCart';
import { useWishlist } from '@/store/useWishlist';
import { useToast } from '@/store/useToast';
import { HeartIcon } from './icons';

export default function ProductCard({ shoe }: { shoe: Shoe }) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const toggleWish = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(shoe.id));
  const notify = useToast((s) => s.show);
  const outOfStock = shoe.stock <= 0;
  const onSale = shoe.discountPercent > 0;
  const salePrice = onSale ? getSalePrice(shoe.price, shoe.discountPercent) : shoe.price;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    add({
      shoeId: shoe.id,
      name: shoe.name,
      price: salePrice,
      colorHex: shoe.colors[0].hex,
      size: shoe.sizes[0],
      qty: 1,
      image: shoe.image
    });
    openCart();
  };

  return (
    <div className="group relative h-full">
      <Link href={`/product/${shoe.slug}`} className="flex h-full flex-col">
        <div className="relative overflow-hidden border border-[var(--border)] bg-[var(--surface-alt)]">
          {outOfStock ? (
            <span className="absolute left-0 top-3 z-10 bg-[#939393] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Sold out
            </span>
          ) : (
            onSale && (
              <span className="absolute left-0 top-3 z-10 bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent-fg)]">
                Save {shoe.discountPercent}%
              </span>
            )
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWish(shoe.id);
              notify(wished ? `Removed ${shoe.name} from wishlist` : `Added ${shoe.name} to wishlist`);
            }}
            aria-label="Toggle wishlist"
            className="absolute right-2 top-2 z-10 p-1.5 text-[var(--fg)] transition hover:opacity-70"
          >
            <HeartIcon filled={wished} size={18} />
          </button>

          <div className="aspect-square">
            {/* object-cover, not object-contain — product photos come in a mix
                of aspect ratios, and contain left each one at its own natural
                scale inside the box (some filling it, some tiny and padded),
                which read as inconsistent card sizes. Cover fills the same
                fixed box edge-to-edge for every card, cropping as needed. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryResize(shoe.image, 600)}
              alt={shoe.name}
              loading="lazy"
              decoding="async"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <p className="line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug">{shoe.name}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{shoe.category}</p>

          <div className="mt-2 flex items-baseline gap-2">
            {onSale && (
              <span className="text-xs text-[var(--muted)] line-through">{formatPrice(shoe.price)}</span>
            )}
            <span className="text-sm font-bold">{formatPrice(salePrice)}</span>
          </div>

          {shoe.sizes.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {shoe.sizes.slice(0, 6).map((s) => (
                <span
                  key={s}
                  className="min-w-[26px] border border-[var(--border)] px-1.5 py-0.5 text-center text-[10px] text-[var(--muted)]"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={quickAdd}
            disabled={outOfStock}
            className="btn-glow mt-3 w-full bg-[var(--accent)] py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-fg)] disabled:cursor-not-allowed disabled:bg-[#939393]"
          >
            {outOfStock ? 'Sold out' : 'Add to cart'}
          </button>
        </div>
      </Link>
    </div>
  );
}
