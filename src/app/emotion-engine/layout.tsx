import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emotion Engine',
  description: 'The core emotion processing engine powering your digital consciousness feelings.',
  openGraph: {
    title: 'Emotion Engine | Consciousness Clone',
    description: 'The core emotion processing engine powering your digital consciousness feelings.',
    type: 'website',
  },
}

export default function EmotionEngineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
