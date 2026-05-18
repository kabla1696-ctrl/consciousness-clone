describe('env', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('has supabase.url and supabase.anonKey properties', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const { env } = require('../lib/env')
    expect(env.supabase).toBeDefined()
    expect(env.supabase.url).toBe('https://test.supabase.co')
    expect(env.supabase.anonKey).toBe('test-anon-key')
  })

  it('has openai.apiKey property', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.OPENAI_API_KEY = 'sk-test'
    const { env } = require('../lib/env')
    expect(env.openai).toBeDefined()
    expect(env.openai.apiKey).toBe('sk-test')
  })

  it('throws when required env var is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    expect(() => require('../lib/env')).toThrow('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  })

  it('returns empty string for optional missing env var', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    delete process.env.OPENAI_API_KEY
    const { env } = require('../lib/env')
    expect(env.openai.apiKey).toBe('')
  })

  it('exposes isDev and isProd flags', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.NODE_ENV = 'development'
    const { env } = require('../lib/env')
    expect(env.isDev).toBe(true)
    expect(env.isProd).toBe(false)
  })
})
