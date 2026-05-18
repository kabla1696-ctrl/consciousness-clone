import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mood | Consciousness Clone',
  description: 'Log and visualize your emotional patterns',
}

export default function MoodLayout({ children }: { children: React.ReactNode }) {
  return children
}
