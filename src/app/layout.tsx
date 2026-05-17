import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Consciousness Clone — Live Forever Digitally',
  description: 'Preserve your personality, memories, and voice forever. Create a digital version of yourself that lives on forever. Free to start.',
  keywords: ['consciousness clone', 'digital immortality', 'AI clone', 'personality preservation', 'digital twin', 'voice clone', 'memory preservation', 'live forever', 'AI personality', 'digital consciousness'],
  authors: [{ name: 'Consciousness Clone' }],
  openGraph: {
    title: 'Consciousness Clone — Live Forever Digitally',
    description: 'Preserve your personality, memories, and voice forever. Create a digital version of yourself that lives on forever.',
    url: 'https://consciousness-clone.vercel.app',
    siteName: 'Consciousness Clone',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Consciousness Clone — Digital Immortality',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consciousness Clone — Live Forever Digitally',
    description: 'Preserve your personality, memories, and voice forever. Create a digital version of yourself.',
    images: ['/og-image.png'],
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#050510" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-[#050510] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
