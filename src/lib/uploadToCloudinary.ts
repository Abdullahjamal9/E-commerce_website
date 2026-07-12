import { compressImage } from './compressImage';

/**
 * Compresses the file client-side, then uploads it straight to Cloudinary
 * using a short-lived signature from our own API (signEndpoint) — the file
 * bytes never pass through our serverless function, avoiding its ~4.5MB
 * request body cap.
 */
export async function uploadToCloudinary(file: File, signEndpoint: string): Promise<string> {
  const compressed = await compressImage(file);

  const signRes = await fetch(signEndpoint, { method: 'POST' });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign.error ?? 'Could not start upload');

  const form = new FormData();
  form.append('file', compressed);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);
  form.append('allowed_formats', sign.allowedFormats);

  const uploadRes = await fetch(sign.uploadUrl, { method: 'POST', body: form });
  const uploaded = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok) throw new Error(uploaded.error?.message ?? 'Upload failed');

  return uploaded.secure_url as string;
}
