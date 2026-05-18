import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice User',
  description: 'Voice-enabled interactions and audio features for Consciousness Clone users.',
  openGraph: {
    title: 'Voice User | Consciousness Clone',
    description: 'Voice-enabled interactions and audio features for Consciousness Clone users.',
    type: 'website',
  },
}

export default function VoiceUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
