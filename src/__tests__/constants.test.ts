import { APP_NAME, APP_URL, MAX_UPLOAD_SIZE, ITEMS_PER_PAGE } from '../lib/constants'

describe('constants', () => {
  it('has APP_NAME', () => expect(APP_NAME).toBe('Consciousness Clone'))
  it('has valid APP_URL', () => expect(APP_URL).toMatch(/^https?:\/\//))
  it('has MAX_UPLOAD_SIZE', () => expect(MAX_UPLOAD_SIZE).toBeGreaterThan(0))
  it('has ITEMS_PER_PAGE', () => expect(ITEMS_PER_PAGE).toBeGreaterThan(0))
})
