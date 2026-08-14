import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import ProductReviews from '@/components/ProductReviews';
import Recommendations from '@/components/Recommendations';
import { getAllSlugs, getProductBySlug, getRelated } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import { getReviews } from '@/lib/reviews';
import { cloudinaryResize } from '@/lib/cloudinaryUrl';
import { SITE_URL } from '@/lib/site';
import { getSalePrice } from '@/lib/sale';

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

  // A plain string here already picks up the root layout's "%s — StoreName"
  // template — appending storeName again would double it up.
  const description = shoe.tagline || shoe.description.slice(0, 160);
  const url = `${SITE_URL}/product/${shoe.slug}`;

  return {
    title: shoe.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: shoe.name,
      description,
      images: shoe.image ? [{ url: shoe.image }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: shoe.name,
      description,
      images: shoe.image ? [shoe.image] : undefined
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
  const price = shoe.discountPercent > 0 ? getSalePrice(shoe.price, shoe.discountPercent) : shoe.price;

  // Product + Offer (+ AggregateRating, once there's at least one review) —
  // this is what lets a search result show price/stock/star rating directly,
  // rather than just a title and description.
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: shoe.name,
    description: shoe.description,
    image: shoe.images.length ? shoe.images : [shoe.image],
    sku: shoe.id,
    category: shoe.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${shoe.slug}`,
      priceCurrency: 'PKR',
      price,
      availability: shoe.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    },
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(averageRating.toFixed(1)),
            reviewCount: reviews.length
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
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
