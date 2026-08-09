import Link from 'next/link';
import type { Shoe } from '@/lib/types';
import ProductCard from './ProductCard';

export default function Recommendations({ picks }: { picks: Shoe[]; storeName?: string }) {
  if (picks.length === 0) return null;

  return (
    <section className="mx-auto max-w-site px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4 border-t border-[var(--border)] pt-10">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wide sm:text-2xl">
            You May Also <span className="text-[var(--muted)]">Like</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Picked from the same styles and categories.</p>
        </div>
        <Link
          href="/shop"
          className="-my-2 whitespace-nowrap py-2 text-xs font-semibold uppercase tracking-wide underline underline-offset-4 transition hover:opacity-70"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {picks.map((shoe) => (
          <ProductCard key={shoe.id} shoe={shoe} />
        ))}
      </div>
    </section>
  );
}
