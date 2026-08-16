import type { Metadata } from 'next';
import ShopGrid from '@/components/ShopGrid';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';
import { getProducts } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import type { Category, Tag } from '@/lib/types';
import { SITE_URL } from '@/lib/site';
import { collectionLabel } from '@/lib/collectionCopy';

export async function generateMetadata({
  searchParams
}: {
  searchParams: { category?: string; tag?: string; audience?: string };
}): Promise<Metadata> {
  const settings = await getSettings();
  const scope = [searchParams.audience, searchParams.tag ?? searchParams.category]
    .filter(Boolean)
    .join(' ');

  // Same helper the grid's own heading uses, so the title and the h1 on the
  // page can't drift apart. "Running" is a filter label; "Running Shoes in
  // Pakistan" is what someone types into Google. A plain string picks up the
  // root layout's "%s — StoreName" template.
  const label = collectionLabel(scope || null);
  const title = `${label} in Pakistan`;
  const description = scope
    ? `Shop ${label.toLowerCase()} online in Pakistan at ${settings.storeName}. Cash on Delivery nationwide, 7-day returns and exchanges.`
    : `Browse the full ${settings.storeName} shoe catalogue: sneakers, running, formal, casual and boots. Cash on Delivery nationwide, 7-day returns.`;

  // A single category or tag filter is a real landing page (the sitemap
  // lists these individually), so it gets a self-referencing canonical. Any
  // other combination — audience filters, category+tag together, no filter
  // at all — canonicalizes back to the bare listing rather than asking
  // Google to index every possible filter combination separately.
  const singleFilter =
    (searchParams.category && !searchParams.tag && !searchParams.audience && `?category=${searchParams.category}`) ||
    (searchParams.tag && !searchParams.category && !searchParams.audience && `?tag=${searchParams.tag}`) ||
    '';
  const canonical = `${SITE_URL}/shop${singleFilter}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', url: canonical, title, description }
  };
}

export default async function ShopPage({
  searchParams
}: {
  searchParams: { category?: string; tag?: string; audience?: string };
}) {
  const [products, settings, categories, tags] = await Promise.all([
    getProducts({ activeOnly: true }),
    getSettings(),
    getCategories(),
    getTags()
  ]);
  const category = categories.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : undefined;
  const initialTag = tags.includes(searchParams.tag as Tag) ? (searchParams.tag as Tag) : undefined;
  // Audience (Men/Women) stays applied while the style tabs change, so
  // "Men > Sneakers" really means men's sneakers rather than all sneakers.
  const audience = tags.includes(searchParams.audience as Tag)
    ? (searchParams.audience as Tag)
    : undefined;

  return (
    <ShopGrid
      products={products}
      tags={tags}
      categories={categories}
      category={category}
      initialTag={initialTag}
      audience={audience}
      storeName={settings.storeName}
    />
  );
}
