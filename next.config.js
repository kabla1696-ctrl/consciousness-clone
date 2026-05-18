/** @type {import('next').NextConfig} */
const nextConfig = {
  // React strict mode for better development experience and catching issues
  reactStrictMode: true,

  // Security: don't expose "X-Powered-By: Next.js" header
  poweredByHeader: false,

  // Compression (gzip) - enabled by default in production, explicit here
  compress: true,

  images: {
    unoptimized: true,
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
