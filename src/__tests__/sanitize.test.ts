import { sanitizeInput, sanitizeWithLimit, isValidEmail, escapeHtml } from '../lib/sanitize'

describe('sanitizeInput', () => {
  it('removes script tags (strips tags, leaves inner text)', () => {
    const result = sanitizeInput('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('</script>')
  })

  it('removes event handlers', () => {
    expect(sanitizeInput('<img onerror="alert(1)">')).not.toContain('onerror')
  })

  it('preserves normal text', () => {
    expect(sanitizeInput('Hello world')).toBe('Hello world')
  })

  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:')
  })

  it('removes data: protocol', () => {
    expect(sanitizeInput('data:text/html,<h1>hi</h1>')).not.toContain('data:')
  })

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(null as any)).toBe('')
    expect(sanitizeInput(undefined as any)).toBe('')
    expect(sanitizeInput(123 as any)).toBe('')
  })
})

describe('sanitizeWithLimit', () => {
  it('truncates to maxLength', () => {
    const long = 'a'.repeat(100)
    expect(sanitizeWithLimit(long, 10)).toHaveLength(10)
  })

  it('uses default maxLength of 5000', () => {
    const long = 'a'.repeat(6000)
    expect(sanitizeWithLimit(long)).toHaveLength(5000)
  })

  it('does not truncate short input', () => {
    expect(sanitizeWithLimit('hi')).toBe('hi')
  })
})

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('rejects missing @', () => {
    expect(isValidEmail('testexample.com')).toBe(false)
  })

  it('rejects missing domain', () => {
    expect(isValidEmail('test@')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

describe('escapeHtml', () => {
  it('escapes < and >', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;')
  })

  it('escapes ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b')
  })

  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;')
  })

  it('leaves safe text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })
})
