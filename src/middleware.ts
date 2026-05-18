import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/chat',
  '/chat-user',
  '/vault',
  '/profile',
  '/settings',
  '/mood',
  '/achievements',
  '/relationships',
  '/feed',
  '/clone-social',
  '/analytics',
  '/backup',
  '/voice',
  '/dream-lab',
  '/memory-dna',
  '/life-story',
  '/legacy-letter',
  '/time-capsule',
  '/personality-quiz',
  '/mood-tracker',
  '/clone-',
]

// Routes accessible without authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/blog',
  '/about',
  '/faq',
  '/support',
  '/changelog',
  '/privacy',
  '/terms',
  '/pricing',
  '/offline',
  '/onboarding',
]

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith('-')) {
      // Wildcard prefix match for clone-* routes
      return pathname === route.slice(0, -1) || pathname.startsWith(route)
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static assets (images, fonts, etc.)
  ) {
    return NextResponse.next()
  }

  // Create a response that we can modify cookies on
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user

  // Auth pages (login/signup) - redirect to dashboard if already logged in
  if (pathname === '/login' || pathname === '/signup') {
    if (isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Public routes and everything else - allow through
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
