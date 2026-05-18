import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life Story | Consciousness Clone',
  description: 'Your AI-generated autobiography from memories',
}

export default function LifeStoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
