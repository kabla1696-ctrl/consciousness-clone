/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for better development experience and catching issues
  reactStrictMode: true,

  // Security: don't expose "X-Powered-By: Next.js" header
  poweredByHeader: false,

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Compression (gzip) - enabled by default in production, explicit here
  compress: true,

  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  trailingSlash: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://opengateway.gitlawb.com https://vitals.vercel-insights.com wss://*.supabase.co wss://*.supabase.in",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Redirects for SEO - canonical URLs
  async redirects() {
    return [
      // Redirect non-www to www (or vice versa) - customize as needed
      // Uncomment and adjust for your domain:
      // {
      //   source: '/:path((?!sitemap|robots).*)',
      //   has: [{ type: 'host', value: 'consciousness-clone.vercel.app' }],
      //   destination: 'https://consciousness-clone.vercel.app/:path*',
      //   permanent: true,
      // },
    ]
  },

  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

module.exports = nextConfig
