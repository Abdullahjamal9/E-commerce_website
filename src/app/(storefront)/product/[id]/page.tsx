import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import ProductReviews from '@/components/ProductReviews';
import Recommendations from '@/components/Recommendations';
import { getAllSlugs, getProductBySlug, getRelated } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { getReviews } from '@/lib/reviews';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ id: slug }));
}

export async function generateMetadata({
  params
}: {
  params: { id: string };
}): Promise<Metadata> {
  const shoe = await getProductBySlug(params.id);
  if (!shoe) return {};

  const settings = await getSettings();

  return {
    title: `${shoe.name} — ${settings.storeName}`,
    description: shoe.tagline || shoe.description.slice(0, 160),
    openGraph: {
      title: shoe.name,
      description: shoe.tagline,
      images: shoe.image ? [{ url: shoe.image }] : undefined
    }
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const shoe = await getProductBySlug(params.id);
  if (!shoe) notFound();

  const [picks, settings, reviews] = await Promise.all([
    getRelated(shoe.id, 3),
    getSettings(),
    getReviews(shoe.id)
  ]);
  const averageRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      {/* Starts the hero image download in parallel with HTML parsing,
          before React even hydrates — the eager/fetchPriority attributes on
          the <img> itself only help once the DOM has that element. */}
      <link rel="preload" as="image" href={cloudinaryResize(shoe.image, 1200)} fetchPriority="high" />
      <ProductDetail shoe={shoe} averageRating={averageRating} reviewCount={reviews.length} />
      <ProductReviews productId={shoe.id} reviews={reviews} />
      <Recommendations picks={picks} storeName={settings.storeName} />
    </>
  );
}
