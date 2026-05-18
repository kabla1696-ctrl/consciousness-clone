import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Vault | Consciousness Clone',
  description: 'Your secure digital memory vault — preserve every moment',
  openGraph: {
    title: 'Memory Vault | Consciousness Clone',
    description: 'Your secure digital memory vault — preserve every moment',
    url: 'https://consciousness-clone.vercel.app/vault',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memory Vault | Consciousness Clone',
    description: 'Your secure digital memory vault — preserve every moment',
    images: ['/og-image.png'],
  },
}

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children
}
