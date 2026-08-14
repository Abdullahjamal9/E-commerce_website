import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /wishlist is per-visitor (read from localStorage) and has no unique
      // public content of its own — nothing there is worth a crawl budget.
      disallow: ['/admin', '/api', '/wishlist']
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
