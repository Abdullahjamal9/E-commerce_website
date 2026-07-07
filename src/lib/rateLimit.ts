interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically purge expired buckets so memory doesn't grow unbounded on a
// long-running Node process. No-op cost if traffic is low.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Array.from(buckets.entries()).forEach(([key, bucket]) => {
      if (bucket.resetAt < now) buckets.delete(key);
    });
  }, 10 * 60 * 1000);
}

/** Returns true if the call is allowed, false if the limit has been exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP from common proxy headers (falls back to 'unknown'). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
