import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Calendar | Consciousness Clone',
  description: 'View your memories, moods, and events on a beautiful calendar',
  openGraph: {
    title: 'Calendar | Consciousness Clone',
    description: 'View your memories, moods, and events on a beautiful calendar',
    url: 'https://consciousness-clone.vercel.app/calendar',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calendar | Consciousness Clone',
    description: 'View your memories, moods, and events on a beautiful calendar',
    images: ['/og-image.png'],
  },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
