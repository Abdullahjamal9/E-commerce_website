import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/lib/products';
import { getCategories } from '@/lib/categories';
import { getTags } from '@/lib/tags';
import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, categories, tags] = await Promise.all([
    getAllSlugs(),
    getCategories(),
    getTags()
  ]);

  const staticPages = [
    '',
    '/shop',
    '/about',
    '/contact',
    '/faq',
    '/shipping-returns',
    '/privacy-policy',
    '/terms',
    '/track-order',
    '/guides',
    ...GUIDES.map((g) => `/guides/${g.slug}`)
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date()
  }));

  const productPages = slugs.map((slug) => ({
    url: `${SITE_URL}/product/${slug}`,
    lastModified: new Date()
  }));

  const categoryPages = categories.map((c) => ({
    url: `${SITE_URL}/shop?category=${encodeURIComponent(c)}`,
    lastModified: new Date()
  }));

  const tagPages = tags.map((t) => ({
    url: `${SITE_URL}/shop?tag=${encodeURIComponent(t)}`,
    lastModified: new Date()
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...tagPages];
}
