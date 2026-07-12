import { del } from '@vercel/blob';

/**
 * Best-effort Blob cleanup — swallows failures so a storage hiccup never
 * blocks the product/review mutation that triggered it. Vercel Blob's free
 * tier quota fills up fast if uploads are never removed after a delete or a
 * product edit that drops/replaces an image.
 */
export async function deleteBlobs(urls: string[]) {
  // New uploads go to Cloudinary now — this only still matters for images
  // uploaded back when Blob was the storage provider. Filtering here means
  // callers can pass a mixed list without del() rejecting the whole batch
  // over a URL it doesn't own.
  const blobUrls = urls.filter((u) => u.includes('.blob.vercel-storage.com'));
  if (blobUrls.length === 0) return;
  try {
    await del(blobUrls);
  } catch {
    // ignore — orphaned blobs can be cleaned up later, not worth failing the request over
  }
}
