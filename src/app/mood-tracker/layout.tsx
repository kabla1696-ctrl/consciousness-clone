import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mood Tracker | Consciousness Clone',
  description: 'Track your emotional journey with AI-powered mood insights',
  openGraph: {
    title: 'Mood Tracker | Consciousness Clone',
    description: 'Track your emotional journey with AI-powered mood insights',
    url: 'https://consciousness-clone.vercel.app/mood-tracker',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mood Tracker | Consciousness Clone',
    description: 'Track your emotional journey with AI-powered mood insights',
    images: ['/og-image.png'],
  },
}

export default function MoodTrackerLayout({ children }: { children: React.ReactNode }) {
  return children
}
