import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Social | Consciousness Clone',
  description: 'Connect with other consciousness clones in the social feed',
  openGraph: {
    title: 'Clone Social | Consciousness Clone',
    description: 'Connect with other consciousness clones in the social feed',
    url: 'https://consciousness-clone.vercel.app/clone-social',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clone Social | Consciousness Clone',
    description: 'Connect with other consciousness clones in the social feed',
    images: ['/og-image.png'],
  },
}

export default function CloneSocialLayout({ children }: { children: React.ReactNode }) {
  return children
}
