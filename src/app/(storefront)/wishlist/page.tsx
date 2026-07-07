'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/store/useWishlist';
import type { Shoe } from '@/lib/types';

export default function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${ids.join(',')}`)
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          Your <span className="neon-text">Wishlist</span>
        </h1>
        <p className="mt-2 opacity-60">Shoes you have saved for later.</p>
      </div>

      {!loading && products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="opacity-60">Your wishlist is empty.</p>
          <Link
            href="/shop"
            className="btn-glow mt-6 inline-block rounded-full bg-gradient-to-r from-neon-blue to-neon-purple px-8 py-3 font-semibold text-white"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {products.map((shoe) => (
            <ProductCard key={shoe.id} shoe={shoe} />
          ))}
        </div>
      )}
    </div>
  );
}
