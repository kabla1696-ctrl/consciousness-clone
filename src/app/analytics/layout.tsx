import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics | Consciousness Clone',
  description: 'Insights and statistics about your consciousness data',
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
