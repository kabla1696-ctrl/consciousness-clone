function getEnvVar(key: string, required = true): string {
  const value = process.env[key]
  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value || ''
}

export const env = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY', false),
  },
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
}
