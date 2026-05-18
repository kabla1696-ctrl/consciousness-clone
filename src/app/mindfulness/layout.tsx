import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mindfulness',
  description: 'Guided mindfulness and meditation sessions powered by your consciousness data.',
  openGraph: {
    title: 'Mindfulness | Consciousness Clone',
    description: 'Guided mindfulness and meditation sessions powered by your consciousness data.',
    type: 'website',
  },
}

export default function MindfulnessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
