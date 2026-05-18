import { errorMonitor } from '../lib/error-monitor'

describe('ErrorMonitor', () => {
  beforeEach(() => errorMonitor.clearErrors())

  it('captures errors', () => {
    errorMonitor.captureError(new Error('test'))
    expect(errorMonitor.getErrors()).toHaveLength(1)
    expect(errorMonitor.getErrors()[0].message).toBe('test')
  })

  it('clears errors', () => {
    errorMonitor.captureError(new Error('test'))
    errorMonitor.clearErrors()
    expect(errorMonitor.getErrors()).toHaveLength(0)
  })

  it('limits to 50 errors', () => {
    for (let i = 0; i < 60; i++) {
      errorMonitor.captureError(new Error(`error ${i}`))
    }
    expect(errorMonitor.getErrors()).toHaveLength(50)
  })

  it('stores error metadata', () => {
    errorMonitor.captureError(new Error('meta test'), 'ComponentStack', 'user-123')
    const errors = errorMonitor.getErrors()
    expect(errors[0].componentStack).toBe('ComponentStack')
    expect(errors[0].userId).toBe('user-123')
    expect(errors[0].timestamp).toBeDefined()
  })

  it('returns a copy of errors (not reference)', () => {
    errorMonitor.captureError(new Error('copy test'))
    const errors = errorMonitor.getErrors()
    errors.push({ message: 'injected', timestamp: 0 })
    expect(errorMonitor.getErrors()).toHaveLength(1)
  })
})
