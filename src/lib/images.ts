import { deleteBlobs } from './blob';
import { deleteCloudinaryAssets } from './cloudinary';

/** Deletes uploaded images regardless of which storage provider they landed
 * on — old Vercel Blob URLs and new Cloudinary URLs can both appear on the
 * same product while the catalogue transitions between providers. */
export async function deleteImages(urls: string[]) {
  await Promise.all([deleteBlobs(urls), deleteCloudinaryAssets(urls)]);
}
