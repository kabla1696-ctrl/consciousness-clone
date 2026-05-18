/**
 * Input sanitization utilities for user-facing forms.
 *
 * These are lightweight client-side helpers.  Server-side validation
 * (Supabase RLS, API route checks) remains the source of truth.
 */

/** Strip HTML tags and dangerous characters from a plain-text input. */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove javascript: protocol
      .replace(/javascript\s*:/gi, '')
      // Remove data: protocol
      .replace(/data\s*:/gi, '')
      // Remove on* event handlers
      .replace(/\bon\w+\s*=/gi, '')
      // Trim whitespace
      .trim()
  )
}

/** Sanitize and enforce a max length. */
export function sanitizeWithLimit(input: string, maxLength = 5000): string {
  return sanitizeInput(input).slice(0, maxLength)
}

/** Validate an email address format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Escape special HTML entities for safe rendering in dangerouslySetInnerHTML. */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return str.replace(/[&<>"'/]/g, (c) => map[c] || c)
}
