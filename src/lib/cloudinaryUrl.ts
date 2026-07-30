/**
 * Injects an f_auto,q_auto[,w_N] transformation into a Cloudinary delivery
 * URL so the CDN serves an appropriately-sized, format-negotiated (WebP/AVIF)
 * image instead of the full original — cuts payload significantly without
 * changing what's stored in the database. Client-safe: no secrets, just
 * string manipulation. Returns the URL unchanged if it isn't a Cloudinary
 * URL (e.g. a legacy Vercel Blob image from before the migration).
 */
export function cloudinaryResize(url: string, width?: number): string {
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;

  const transform = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return `${url.slice(0, i + marker.length)}${transform}/${url.slice(i + marker.length)}`;
}
