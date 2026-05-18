import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Death Detection',
  description: 'AI-powered inactivity and absence detection for consciousness continuity planning.',
  openGraph: {
    title: 'Death Detection | Consciousness Clone',
    description: 'AI-powered inactivity and absence detection for consciousness continuity planning.',
    type: 'website',
  },
}

export default function DeathDetectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
