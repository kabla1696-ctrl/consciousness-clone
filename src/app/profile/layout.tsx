import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Consciousness Clone',
  description: 'Manage your consciousness clone profile',
  openGraph: {
    title: 'Profile | Consciousness Clone',
    description: 'Manage your consciousness clone profile',
    url: 'https://consciousness-clone.vercel.app/profile',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile | Consciousness Clone',
    description: 'Manage your consciousness clone profile',
    images: ['/og-image.png'],
  },
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
