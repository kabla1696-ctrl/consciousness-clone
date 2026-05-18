import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Quiz | Consciousness Clone',
  description: 'Discover your unique personality traits and build your digital twin',
  openGraph: {
    title: 'Personality Quiz | Consciousness Clone',
    description: 'Discover your unique personality traits and build your digital twin',
    url: 'https://consciousness-clone.vercel.app/personality-quiz',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personality Quiz | Consciousness Clone',
    description: 'Discover your unique personality traits and build your digital twin',
    images: ['/og-image.png'],
  },
}

export default function PersonalityQuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
