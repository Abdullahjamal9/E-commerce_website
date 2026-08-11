import Link from 'next/link';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';

export interface Tile {
  label: string;
  href: string;
  image: string;
}

/** Three-up promo grid under the hero — the reference storefront's way of
 *  routing people into collections before any product list appears. */
const BASE_COLS: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-2' };
const LG_COLS: Record<number, string> = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' };

export default function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  if (tiles.length === 0) return null;

  // A hardcoded 3-column grid left an empty cell whenever there were fewer
  // than 3 tiles (the common case) — size the grid to whatever's actually here.
  const baseCols = BASE_COLS[tiles.length] ?? 'grid-cols-2';
  const lgCols = LG_COLS[tiles.length] ?? 'lg:grid-cols-3';

  return (
    <section className="mx-auto max-w-site px-4 py-12 sm:px-6">
      <div className={`grid ${baseCols} gap-3 sm:gap-4 ${lgCols}`}>
        {tiles.map((tile) => (
          <Link
            key={tile.href + tile.label}
            href={tile.href}
            className="group relative block overflow-hidden border border-[var(--border)] bg-[var(--surface-alt)]"
          >
            {/* Square frame with tight padding — a 4:3 box with p-8 left the
                photo tiny once these went two-up on phones. */}
            <div className="aspect-square p-3 sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cloudinaryResize(tile.image, 600)}
                alt={tile.label}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4">
              <span className="text-sm font-semibold uppercase tracking-wide">{tile.label}</span>
              <span className="text-sm transition group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
