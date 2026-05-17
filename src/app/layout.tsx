import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Consciousness Clone — Live Forever Digitally',
  description: 'Preserve your personality, memories, and voice forever. Create a digital version of yourself that lives on forever. Free to start.',
  keywords: ['consciousness clone', 'digital immortality', 'AI clone', 'personality preservation', 'digital twin', 'voice clone', 'memory preservation', 'live forever'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Consciousness Clone',
  },
  openGraph: {
    title: 'Consciousness Clone — Live Forever Digitally',
    description: 'Preserve your personality, memories, and voice forever.',
    url: 'https://consciousness-clone.vercel.app',
    siteName: 'Consciousness Clone',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consciousness Clone — Live Forever Digitally',
    description: 'Preserve your personality, memories, and voice forever.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#050510',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#050510] text-white antialiased">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
