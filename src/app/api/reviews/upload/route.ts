import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image

// Issues a short-lived client token instead of proxying the file through this
// function — Vercel serverless functions cap request bodies at 4.5MB, which
// several review photos together can exceed. The browser uploads straight to Blob.
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!rateLimit(`review-upload:${ip}`, 10, 60 * 60 * 1000)) {
          throw new Error('Too many uploads. Please try again later.');
        }
        return {
          allowedContentTypes: ALLOWED_TYPES,
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_SIZE_BYTES
        };
      }
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
