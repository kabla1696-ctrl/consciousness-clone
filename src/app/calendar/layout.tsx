import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Calendar | Consciousness Clone',
  description: 'View your memories, moods, and events on a beautiful calendar',
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
