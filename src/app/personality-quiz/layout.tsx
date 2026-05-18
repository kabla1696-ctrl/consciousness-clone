import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Quiz | Consciousness Clone',
  description: 'Discover your unique personality traits and build your digital twin',
}

export default function PersonalityQuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
