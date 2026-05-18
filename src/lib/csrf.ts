/**
 * Lightweight CSRF protection using the Double-Submit Cookie pattern.
 *
 * How it works:
 * 1. Server sets a random token in a cookie (`csrf_token`).
 * 2. Client reads the cookie and sends the same value in the
 *    `X-CSRF-Token` header with every mutating request.
 * 3. Server compares cookie value === header value.
 *
 * An attacker on a different origin cannot read cookies, so they
 * cannot populate the header → request is rejected.
 *
 * This file provides the server-side verification helper.
 * The cookie is set by middleware or the layout.
 */

import { cookies } from 'next/headers'

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

/** Generate a random hex token (32 bytes → 64 hex chars). */
export function generateCsrfToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify that the CSRF header matches the cookie.
 * Returns true if valid, false otherwise.
 *
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 */
export async function verifyCsrf(request: Request): Promise<boolean> {
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true

  const headerToken = request.headers.get(CSRF_HEADER)
  if (!headerToken) return false

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value
  if (!cookieToken) return false

  return headerToken === cookieToken
}
