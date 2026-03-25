/**
 * Simple in-memory sliding-window rate limiter.
 * For production at scale, replace with a Redis-backed implementation
 * (e.g. @upstash/ratelimit) so limits are shared across all server instances.
 *
 * How it works:
 * - Each unique key (e.g. IP + route) has a list of request timestamps.
 * - On each check, timestamps older than `windowMs` are evicted.
 * - If the remaining count >= `limit`, the request is rejected.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Prune the entire store every 10 minutes to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // Keep only recent entries; remove stale keys entirely.
    entry.timestamps = entry.timestamps.filter((t) => now - t < 60 * 60 * 1000);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 10 * 60 * 1000);

export interface RateLimitOptions {
  /** Maximum number of requests allowed within `windowMs`. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix ms timestamp of when the oldest request expires
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Evict timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  const remaining = Math.max(0, limit - entry.timestamps.length - 1);
  const resetAt =
    entry.timestamps.length > 0
      ? entry.timestamps[0] + windowMs
      : now + windowMs;

  if (entry.timestamps.length >= limit) {
    store.set(key, entry);
    return { allowed: false, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return { allowed: true, remaining, resetAt };
}

/**
 * Extract a best-effort client IP from a Next.js request.
 * In production behind a trusted proxy/CDN, `x-forwarded-for` is reliable.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
