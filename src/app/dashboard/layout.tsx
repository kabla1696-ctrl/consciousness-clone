import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Dashboard | Consciousness Clone',
  description: 'Your consciousness clone dashboard — overview of memories, mood, and activity',
}
export default function Layout({ children }: { children: React.ReactNode }) { return children }
