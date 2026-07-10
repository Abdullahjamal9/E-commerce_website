import ScrollVideo from '@/components/ScrollVideo';
import MobileHero from '@/components/MobileHero';
import ProductGrid from '@/components/ProductGrid';
import Recommendations from '@/components/Recommendations';
import { getFeaturedProducts, getRecommendedProducts } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { getTags } from '@/lib/tags';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);
  const picks = await getRecommendedProducts(featured.map((p) => p.id), 4);
  const [settings, tags] = await Promise.all([getSettings(), getTags()]);

  return (
    <>
      <MobileHero />
      <ScrollVideo />
      <ProductGrid products={featured} tags={tags} />
      <Recommendations picks={picks} storeName={settings.storeName} />
    </>
  );
}
