const CACHE_VERSION = 'v2'
const STATIC_CACHE = `cc-static-${CACHE_VERSION}`
const PAGES_CACHE = `cc-pages-${CACHE_VERSION}`
const API_CACHE = `cc-api-${CACHE_VERSION}`
const OFFLINE_URL = '/offline'

/* ------------------------------------------------------------------ */
/*  Static assets to pre-cache on install                              */
/* ------------------------------------------------------------------ */

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
]

/* ------------------------------------------------------------------ */
/*  Install — pre-cache critical assets                                */
/* ------------------------------------------------------------------ */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

/* ------------------------------------------------------------------ */
/*  Activate — clean up old caches                                     */
/* ------------------------------------------------------------------ */

self.addEventListener('activate', (event) => {
  const keep = [STATIC_CACHE, PAGES_CACHE, API_CACHE]
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => !keep.includes(n))
          .map((n) => caches.delete(n))
      )
    )
  )
  self.clients.claim()
})

/* ------------------------------------------------------------------ */
/*  Fetch strategies                                                   */
/* ------------------------------------------------------------------ */

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // ---- API calls: network-first with short timeout cache -----------
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 5_000))
    return
  }

  // ---- Navigation (HTML pages): network-first, offline fallback ----
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(PAGES_CACHE).then((c) => c.put(request, clone))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached ?? caches.match(OFFLINE_URL)
        })
    )
    return
  }

  // ---- Static assets (JS, CSS, images, fonts): cache-first ---------
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // ---- Everything else: stale-while-revalidate ---------------------
  event.respondWith(staleWhileRevalidate(request, PAGES_CACHE))
})

/* ------------------------------------------------------------------ */
/*  Strategies                                                         */
/* ------------------------------------------------------------------ */

/** Cache-first: serve from cache, update in background */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const clone = response.clone()
    caches.open(cacheName).then((c) => c.put(request, clone))
  }
  return response
}

/** Network-first: try network, fall back to cache */
async function networkFirst(request, cacheName, timeoutMs = 0) {
  try {
    const fetchPromise = fetch(request)
    const response = timeoutMs
      ? await Promise.race([
          fetchPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), timeoutMs)
          ),
        ])
      : await fetchPromise

    if (response.ok) {
      const clone = response.clone()
      caches.open(cacheName).then((c) => c.put(request, clone))
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response('Offline', { status: 503 })
  }
}

/** Stale-while-revalidate: serve cached, fetch fresh in background */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached ?? new Response('Offline', { status: 503 }))

  return cached ?? fetchPromise
}
