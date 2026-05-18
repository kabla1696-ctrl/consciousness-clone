import { rateLimit } from '../lib/rate-limit'

describe('rateLimit', () => {
  // Use unique keys per test to avoid cross-test pollution
  let counter = 0
  const uniqueKey = () => `test-${++counter}-${Date.now()}`

  it('allows requests within limit', () => {
    const key = uniqueKey()
    const result = rateLimit({ key, limit: 5, windowSeconds: 60 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks requests over limit', () => {
    const key = uniqueKey()
    for (let i = 0; i < 3; i++) {
      rateLimit({ key, limit: 3, windowSeconds: 60 })
    }
    const result = rateLimit({ key, limit: 3, windowSeconds: 60 })
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('tracks remaining count correctly', () => {
    const key = uniqueKey()
    const r1 = rateLimit({ key, limit: 5, windowSeconds: 60 })
    expect(r1.remaining).toBe(4)
    const r2 = rateLimit({ key, limit: 5, windowSeconds: 60 })
    expect(r2.remaining).toBe(3)
  })

  it('uses default limit of 30', () => {
    const key = uniqueKey()
    const result = rateLimit({ key })
    expect(result.remaining).toBe(29)
  })

  it('returns resetAt timestamp', () => {
    const key = uniqueKey()
    const result = rateLimit({ key, limit: 5, windowSeconds: 60 })
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })
})
