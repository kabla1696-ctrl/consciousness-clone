import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Chat | Consciousness Clone',
  description: 'Have deep conversations with your AI consciousness clone',
  openGraph: {
    title: 'AI Chat | Consciousness Clone',
    description: 'Have deep conversations with your AI consciousness clone',
    url: 'https://consciousness-clone.vercel.app/chat',
    siteName: 'Consciousness Clone',
    locale: 'en_US',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat | Consciousness Clone',
    description: 'Have deep conversations with your AI consciousness clone',
    images: ['/og-image.png'],
  },
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children
}
