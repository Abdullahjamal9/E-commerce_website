import { del } from '@vercel/blob';

/**
 * Best-effort Blob cleanup — swallows failures so a storage hiccup never
 * blocks the product/review mutation that triggered it. Vercel Blob's free
 * tier quota fills up fast if uploads are never removed after a delete or a
 * product edit that drops/replaces an image.
 */
export async function deleteBlobs(urls: string[]) {
  if (urls.length === 0) return;
  try {
    await del(urls);
  } catch {
    // ignore — orphaned blobs can be cleaned up later, not worth failing the request over
  }
}
