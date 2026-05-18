import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Achievements | Consciousness Clone',
  description: 'Unlock badges and rewards on your consciousness journey',
  openGraph: {
    title: 'Achievements | Consciousness Clone',
    description: 'Unlock badges and rewards on your consciousness journey',
    url: 'https://consciousness-clone.vercel.app/achievements',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Achievements | Consciousness Clone',
    description: 'Unlock badges and rewards on your consciousness journey',
    images: ['/og-image.png'],
  },
}

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children
}
