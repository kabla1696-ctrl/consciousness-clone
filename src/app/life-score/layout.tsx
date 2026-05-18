import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Life Score',
  description: 'Your comprehensive life score based on consciousness metrics and engagement.',
  openGraph: {
    title: 'Life Score | Consciousness Clone',
    description: 'Your comprehensive life score based on consciousness metrics and engagement.',
    type: 'website',
  },
}

export default function LifeScoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
