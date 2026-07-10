import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'UNSET';
  return NextResponse.json({
    urlPrefix: url.slice(0, 15),
    urlLength: url.length,
    hasAuthToken: Boolean(process.env.DATABASE_AUTH_TOKEN)
  });
}
