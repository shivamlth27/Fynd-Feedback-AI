/**
 * Rate Limiting Module
 * 
 * Implements token bucket rate limiting with sliding window.
 * Prevents API abuse by limiting requests per IP per route.
 * 
 * Configuration:
 * - Window: 60 seconds (rolling)
 * - Limit: 20 requests per window per IP
 * 
 * Note: In-memory storage resets on server restart.
 * For production at scale, consider Redis.
 */

type Key = string;  // Format: "IP::route"

// Rate limit configuration
const WINDOW_MS = 60_000; // 1 minute sliding window
const MAX_REQUESTS = 20; // max requests per key per window

// In-memory store: maps key to array of timestamps
// Acceptable for this assessment; per-instance in serverless deployment
const buckets: Map<Key, number[]> = new Map();

/**
 * Generate unique key for rate limiting
 * Combines IP address and route to create bucket key
 */
function getKey(ip: string | null, route: string): Key {
  return `${ip || "unknown"}::${route}`;
}

/**
 * Check if request is within rate limits
 * 
 * Uses sliding window algorithm:
 * 1. Get existing timestamps for this key
 * 2. Filter out timestamps outside current window
 * 3. Add current timestamp
 * 4. Check if count exceeds limit
 * 
 * @param ip - Client IP address (null for unknown)
 * @param route - API route being accessed
 * @returns Object with allowed status, remaining count, retry time
 */
export function rateLimit(ip: string | null, route: string) {
  const key = getKey(ip, route);
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = buckets.get(key) || [];
  const fresh = existing.filter((ts) => ts > windowStart);
  fresh.push(now);

  buckets.set(key, fresh);

  const remaining = Math.max(0, MAX_REQUESTS - fresh.length);
  return {
    allowed: fresh.length <= MAX_REQUESTS,
    remaining,
    retryAfterSec:
      fresh.length <= 1 ? 0 : Math.ceil((fresh[0] + WINDOW_MS - now) / 1000)
  };
}

