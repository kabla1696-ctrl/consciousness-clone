import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voice Call',
  description: 'Make voice calls using your consciousness-powered communication system.',
  openGraph: {
    title: 'Voice Call | Consciousness Clone',
    description: 'Make voice calls using your consciousness-powered communication system.',
    type: 'website',
  },
}

export default function VoiceCallLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
