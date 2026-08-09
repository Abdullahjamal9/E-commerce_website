import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import CategoryTiles, { type Tile } from '@/components/CategoryTiles';
import ProductRail from '@/components/ProductRail';
import SupportStrip from '@/components/SupportStrip';
import SaleBanner from '@/components/SaleBanner';
import { getFeaturedProducts, getProducts, getRecommendedProducts } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { getTags } from '@/lib/tags';

export const dynamic = 'force-dynamic';

/** Tags worth surfacing as homepage tiles, most interesting first — only
 *  those that actually have stock end up rendered. */
const TILE_TAG_PRIORITY = ['New Arrivals', 'Sneakers', 'Running', 'Formal', 'Boots', 'Casual', 'Luxury'];

export default async function HomePage() {
  const [featured, settings, tags, all] = await Promise.all([
    getFeaturedProducts(8),
    getSettings(),
    getTags(),
    getProducts({ activeOnly: true })
  ]);
  const picks = await getRecommendedProducts(featured.map((p) => p.id), 4);

  const heroSource = (featured.length > 0 ? featured : all).slice(0, 4);
  const slides: HeroSlide[] = heroSource.map((p) => ({
    image: p.image,
    eyebrow: p.category,
    title: p.name,
    href: `/product/${p.slug}`
  }));

  const tiles: Tile[] = TILE_TAG_PRIORITY.filter((t) => tags.includes(t))
    .map((tag) => {
      const match = all.find((p) => p.tags.includes(tag));
      return match ? { label: tag, href: `/shop?tag=${encodeURIComponent(tag)}`, image: match.image } : null;
    })
    .filter((t): t is Tile => t !== null)
    .slice(0, 3);

  return (
    <>
      {settings.saleEnabled && <SaleBanner />}
      <HeroSlider slides={slides} />
      <CategoryTiles tiles={tiles} />
      <ProductRail title="Trending" accent="Now" href="/shop" products={featured.slice(0, 8)} />
      <ProductRail title="Recommended" accent="For You" href="/shop" products={picks} />
      <SupportStrip contactEmail={settings.contactEmail} contactPhone={settings.contactPhone} />
    </>
  );
}
