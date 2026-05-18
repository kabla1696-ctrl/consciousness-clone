import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life Story | Consciousness Clone',
  description: 'Your AI-generated autobiography from memories',
  openGraph: {
    title: 'Life Story | Consciousness Clone',
    description: 'Your AI-generated autobiography from memories',
    url: 'https://consciousness-clone.vercel.app/life-story',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Story | Consciousness Clone',
    description: 'Your AI-generated autobiography from memories',
    images: ['/og-image.png'],
  },
}

export default function LifeStoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
