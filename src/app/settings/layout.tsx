import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Consciousness Clone',
  description: 'Customize your consciousness clone experience',
  openGraph: {
    title: 'Settings | Consciousness Clone',
    description: 'Customize your consciousness clone experience',
    url: 'https://consciousness-clone.vercel.app/settings',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings | Consciousness Clone',
    description: 'Customize your consciousness clone experience',
    images: ['/og-image.png'],
  },
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
