// In-memory rate limiter: per-IP, sliding window
// For production, replace with Redis-backed store

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(ip, entry);
  }

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: MAX_REQUESTS - entry.timestamps.length };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(MAX_REQUESTS),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Window': '3600',
  };
  if (result.retryAfterMs) {
    headers['Retry-After'] = String(Math.ceil(result.retryAfterMs / 1000));
  }
  return headers;
}
