/**
 * Simple in-memory rate limiter for API routes.
 *
 * NOTE: This works for single-server deployments (e.g. Vercel serverless
 * instances restart frequently, resetting the map).  For multi-instance
 * production, swap this for Redis-backed limiting (e.g. @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodically clean up expired entries to avoid memory leaks
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

export interface RateLimitOptions {
  /** Unique key, e.g. IP address or user ID */
  key: string
  /** Max requests per window */
  limit?: number
  /** Window duration in seconds */
  windowSeconds?: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check whether the request is within the rate limit.
 *
 * @example
 * ```ts
 * const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
 * const { success, remaining } = rateLimit({ key: ip, limit: 30, windowSeconds: 60 })
 * if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 * ```
 */
export function rateLimit({
  key,
  limit = 30,
  windowSeconds = 60,
}: RateLimitOptions): RateLimitResult {
  cleanup()

  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  entry.count++
  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
