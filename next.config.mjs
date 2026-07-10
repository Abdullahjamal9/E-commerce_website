/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Without this, revisiting a dynamic route (e.g. an admin edit page) within
    // 30s of navigating away reuses the stale client-cached RSC payload instead
    // of refetching, so just-saved edits can appear reverted on reopen.
    staleTimes: {
      dynamic: 0
    }
  }
};

export default nextConfig;
