import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient(cookieStore: { get: (name: string) => { value: string } | undefined; set: (name: string, value: string, options?: Record<string, unknown>) => void; remove: (name: string, options?: Record<string, unknown>) => void }) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: Record<string, unknown>) {
        cookieStore.set(name, value, options)
      },
      remove(name: string, options?: Record<string, unknown>) {
        cookieStore.remove(name, options)
      },
    },
  })
}

// Default client (for backwards compatibility)
export const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get() { return undefined },
    set() {},
    remove() {},
  },
})
