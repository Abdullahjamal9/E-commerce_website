import Link from 'next/link';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';

export interface Tile {
  label: string;
  href: string;
  image: string;
}

/** Three-up promo grid under the hero — the reference storefront's way of
 *  routing people into collections before any product list appears. */
export default function CategoryTiles({ tiles }: { tiles: Tile[] }) {
  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-site px-4 py-12 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
