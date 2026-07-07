import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getTags } from '@/lib/tags';
import { getProducts } from '@/lib/products';

const BANNER_COPY: Record<string, string> = {
  Men: 'Bold silhouettes engineered for everyday movement.',
  Women: 'Featherlight builds with adaptive, all-day comfort.',
  Sports: 'Performance traction and energy-return tech for game day.',
  Luxury: 'Hand-finished materials for statement-making style.',
  'New Arrivals': 'The latest drops, fresh off the line.'
};
const DEFAULT_BANNER = 'Curated picks from this collection.';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
  const [products, tags] = await Promise.all([getProducts({ activeOnly: true }), getTags()]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-black sm:text-4xl">
          Shop by <span className="neon-text">Collection</span>
        </h1>
        <p className="mt-2 opacity-60">Curated edits across every collection.</p>
      </div>

      {tags.map((tag) => {
        const items = products.filter((p) => p.tags.includes(tag)).slice(0, 4);
        if (items.length === 0) return null;

        return (
          <section key={tag} className="mb-16">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl">{tag}</h2>
                <p className="mt-1 text-sm opacity-60">{BANNER_COPY[tag] ?? DEFAULT_BANNER}</p>
              </div>
              <Link
                href={`/shop?tag=${encodeURIComponent(tag)}`}
                className="glass hidden rounded-full px-4 py-2 text-sm font-medium transition hover:bg-white/10 sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {items.map((shoe) => (
                <ProductCard key={shoe.id} shoe={shoe} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
