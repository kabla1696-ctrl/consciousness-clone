import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Dashboard | Consciousness Clone',
  description: 'Your consciousness clone dashboard — overview of memories, mood, and activity',
  openGraph: {
    title: 'Dashboard | Consciousness Clone',
    description: 'Your consciousness clone dashboard — overview of memories, mood, and activity',
    url: 'https://consciousness-clone.vercel.app/dashboard',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard | Consciousness Clone',
    description: 'Your consciousness clone dashboard — overview of memories, mood, and activity',
    images: ['/og-image.png'],
  },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
