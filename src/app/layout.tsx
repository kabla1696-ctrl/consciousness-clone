import type { Metadata, Viewport } from 'next'

// Next.js 15 deprecated the separate viewport export.
// We merge viewport fields into metadata via generateViewport.
import './globals.css'
import CapacitorInit from '../components/CapacitorInit'
import Providers from '../components/Providers'
import AppShell from '../components/AppShell'

const APP_URL = 'https://consciousness-clone.vercel.app'
const APP_NAME = 'Consciousness Clone'
const APP_DESCRIPTION =
  'Your digital consciousness, living forever. AI-powered digital immortality platform.'

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    'digital consciousness',
    'AI immortality',
    'consciousness clone',
    'digital twin',
    'AI personality',
    'mind upload',
    'digital afterlife',
    'AI avatar',
    'consciousness transfer',
    'digital immortality platform',
  ],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: APP_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ['/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
    startupImage: '/icon-512.png',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icon-192.png',
      },
    ],
  },
}

export const generateViewport = (): Viewport => ({
  themeColor: '#050510',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Structured data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: APP_NAME,
              url: APP_URL,
              description: APP_DESCRIPTION,
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              screenshot: `${APP_URL}/og-image.png`,
            }),
          }}
        />
      </head>
      <body className="bg-[#050510] text-white antialiased">
        <Providers>
          <CapacitorInit />
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}
