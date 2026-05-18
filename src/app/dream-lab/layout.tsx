import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dream Lab | Consciousness Clone',
  description: 'Explore AI-generated dreamscapes from your memories',
  openGraph: {
    title: 'Dream Lab | Consciousness Clone',
    description: 'Explore AI-generated dreamscapes from your memories',
    url: 'https://consciousness-clone.vercel.app/dream-lab',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dream Lab | Consciousness Clone',
    description: 'Explore AI-generated dreamscapes from your memories',
    images: ['/og-image.png'],
  },
}

export default function DreamLabLayout({ children }: { children: React.ReactNode }) {
  return children
}
