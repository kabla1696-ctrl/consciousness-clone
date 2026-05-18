import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Voice Calls',
  description: 'Make voice calls using your digital clone\'s synthesized voice.',
  openGraph: {
    title: 'Clone Voice Calls | Consciousness Clone',
    description: 'Make voice calls using your digital clone\'s synthesized voice.',
    type: 'website',
  },
}

export default function CloneVoiceCallsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
