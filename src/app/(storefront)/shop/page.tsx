import type { Metadata } from 'next';
import ShopGrid from '@/components/ShopGrid';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';
import { getProducts } from '@/lib/products';
import { getSettings } from '@/lib/settings';
import type { Category, Tag } from '@/lib/types';

export async function generateMetadata({
  searchParams
}: {
  searchParams: { category?: string; tag?: string };
}): Promise<Metadata> {
  const settings = await getSettings();
  const scope = searchParams.category ?? searchParams.tag;
  return {
    title: scope ? `Shop ${scope} — ${settings.storeName}` : `Shop — ${settings.storeName}`,
    description: `Browse the full ${settings.storeName} catalogue.`
  };
}

export default async function ShopPage({
  searchParams
}: {
  searchParams: { category?: string; tag?: string };
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

  return (
    <ShopGrid
      products={products}
      tags={tags}
      categories={categories}
      category={category}
      initialTag={initialTag}
      storeName={settings.storeName}
    />
  );
}
