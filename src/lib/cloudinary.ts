import { createHash } from 'crypto';

const ALLOWED_FORMATS = 'png,jpg,jpeg,webp,gif';

/**
 * Signs a Cloudinary upload request server-side (API secret never reaches
 * the browser) so the client can POST the file straight to Cloudinary,
 * mirroring the old direct-to-Blob upload pattern — no proxying the file
 * bytes through our own serverless function.
 */
export function signUpload(folder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `allowed_formats=${ALLOWED_FORMATS}&folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    allowedFormats: ALLOWED_FORMATS,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  };
}

/** Recovers the public_id Cloudinary assigned from a delivery URL it returned earlier. */
function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

/**
 * Best-effort cleanup via the Admin API (HTTP Basic Auth with the API
 * secret — server-side only) — swallows failures so a Cloudinary hiccup
 * never blocks the product/review mutation that triggered it.
 */
export async function deleteCloudinaryAssets(urls: string[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const publicIds = urls
    .filter((u) => u.includes('res.cloudinary.com'))
    .map(publicIdFromUrl)
    .filter((id): id is string => Boolean(id));
  if (publicIds.length === 0) return;

  try {
    const query = publicIds.map((id) => `public_ids[]=${encodeURIComponent(id)}`).join('&');
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${query}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
      }
    });
  } catch {
    // ignore — orphaned assets can be cleaned up later, not worth failing the request over
  }
}
