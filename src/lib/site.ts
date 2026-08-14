const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const normalized = (/^https?:\/\//.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, '');

/**
 * Canonical origin for sitemap/robots URLs, metadataBase, and JSON-LD @id/url
 * fields. NEXT_PUBLIC_SITE_URL is deployed as a bare domain with no scheme —
 * fine for the string-concatenation sitemap.ts and robots.ts were already
 * doing, but `new URL(...)` (root layout's metadataBase) throws on it
 * outright. Trailing slashes are trimmed too, since every caller here appends
 * its own leading `/`.
 *
 * Validated (not just normalized) because metadataBase sits in the root
 * layout — one bad character in this env var would otherwise 500 every page
 * on the site rather than just the odd malformed link.
 */
export const SITE_URL = (() => {
  try {
    return new URL(normalized).origin;
  } catch {
    return 'http://localhost:3000';
  }
})();
