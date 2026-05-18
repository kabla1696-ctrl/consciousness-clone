import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mood Tracker | Consciousness Clone',
  description: 'Track your emotional journey with AI-powered mood insights',
}

export default function MoodTrackerLayout({ children }: { children: React.ReactNode }) {
  return children
}
