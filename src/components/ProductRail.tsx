import Link from 'next/link';
import ProductCard from './ProductCard';
import type { Shoe } from '@/lib/types';

/**
 * Titled product row with a "View all" link — used for Trending / Recommended
 * blocks on the homepage. Scrolls horizontally on small screens and settles
 * into a grid once there's room, so it never squashes cards.
 */
export default function ProductRail({
  title,
  accent,
  href,
  products
}: {
  title: string;
  accent?: string;
  href: string;
  products: Shoe[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-site px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-xl font-black uppercase tracking-wide sm:text-2xl">
          {title} {accent && <span className="text-[var(--muted)]">{accent}</span>}
        </h2>
        <Link
          href={href}
          className="-my-2 whitespace-nowrap py-2 text-xs font-semibold uppercase tracking-wide underline underline-offset-4 transition hover:opacity-70"
        >
          View all
        </Link>
      </div>

      {/* Two-up on phones like the rest of the catalogue, widening with the
          viewport — rather than a sideways-scrolling rail, which hid half the
          row and read inconsistently against the shop grid. */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} shoe={p} />
        ))}
      </div>
    </section>
  );
}
