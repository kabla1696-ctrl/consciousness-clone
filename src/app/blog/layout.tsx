import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Consciousness Clone',
  description: 'Articles about digital consciousness, AI immortality, and legacy',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
