import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Relationships | Consciousness Clone',
  description: 'Map and preserve your important relationships',
  openGraph: {
    title: 'Relationships | Consciousness Clone',
    description: 'Map and preserve your important relationships',
    url: 'https://consciousness-clone.vercel.app/relationships',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relationships | Consciousness Clone',
    description: 'Map and preserve your important relationships',
    images: ['/og-image.png'],
  },
}

export default function RelationshipsLayout({ children }: { children: React.ReactNode }) {
  return children
}
