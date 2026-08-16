import HeroSlider, { type HeroSlide } from '@/components/HeroSlider';
import PromoBanner from '@/components/PromoBanner';
import SaleBanner from '@/components/SaleBanner';
import CategoryTiles, { type Tile } from '@/components/CategoryTiles';
import ProductRail from '@/components/ProductRail';
import SupportStrip from '@/components/SupportStrip';
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
      // An admin-picked product (tileTag) wins over whichever product happens
      // to match the tag first.
      const match = all.find((p) => p.tileTag === tag) ?? all.find((p) => p.tags.includes(tag));
      return match ? { label: tag, href: `/shop?tag=${encodeURIComponent(tag)}`, image: match.image } : null;
    })
    .filter((t): t is Tile => t !== null)
    .slice(0, 3);

  return (
    <>
      {/* The page's headline lives inside the banner artwork, where it's
          pixels — unreadable to search engines and screen readers alike, and
          leaving the homepage with no h1 at all. This states the same thing in
          text for both. It's kept off-screen rather than rendered because the
          artwork is already saying it visually; sr-only is the standard way to
          give a heading to a page whose h1 is an image. */}
      <h1 className="sr-only">
        Buy Shoes Online in Pakistan: Sneakers, Running, Formal and Casual Shoes
      </h1>
      {/* The Independence Day artwork takes the banner slot for as long as
          that sale is switched on; the rest of the year the standing campaign
          runs there. SaleBanner's own crop doesn't clear the mobile header on
          its own, so it still needs external clearance; PromoBanner now
          builds its own into each of its two crops. */}
      {settings.saleEnabled ? (
        <div className="pt-16 lg:pt-0">
          <SaleBanner />
        </div>
      ) : (
        <PromoBanner />
      )}
      <HeroSlider slides={slides} />
      <CategoryTiles tiles={tiles} />
      <ProductRail title="Trending" accent="Now" href="/shop" products={featured.slice(0, 8)} />
      <ProductRail title="Recommended" accent="For You" href="/shop" products={picks} />
      <SupportStrip contactEmail={settings.contactEmail} contactPhone={settings.contactPhone} />
    </>
  );
}
