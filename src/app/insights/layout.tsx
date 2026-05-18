import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Insights | Consciousness Clone',
  description: 'Data visualization and analytics for your consciousness journey',
  openGraph: {
    title: 'Insights | Consciousness Clone',
    description: 'Data visualization and analytics for your consciousness journey',
    url: 'https://consciousness-clone.vercel.app/insights',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insights | Consciousness Clone',
    description: 'Data visualization and analytics for your consciousness journey',
    images: ['/og-image.png'],
  },
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
