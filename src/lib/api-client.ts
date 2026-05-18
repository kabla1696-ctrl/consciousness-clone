/**
 * Shared fetch wrapper for the chat API that automatically includes
 * the CSRF token from cookies (Double-Submit Cookie pattern).
 */

export async function fetchChatApi(body: unknown): Promise<{ reply?: string; error?: string }> {
  const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || ''

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(body),
  })

  if (res.status === 429) {
    throw new Error('Rate limited. Please wait a moment and try again.')
  }

  if (res.status === 403) {
    throw new Error('Session expired. Please refresh the page.')
  }

  return res.json()
}
