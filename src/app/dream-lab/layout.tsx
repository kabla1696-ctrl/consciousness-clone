import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dream Lab | Consciousness Clone',
  description: 'Explore AI-generated dreamscapes from your memories',
}

export default function DreamLabLayout({ children }: { children: React.ReactNode }) {
  return children
}
