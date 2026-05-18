import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Astronaut',
  description: 'Explore your consciousness in zero gravity with the Astronaut experience.',
  openGraph: {
    title: 'Astronaut | Consciousness Clone',
    description: 'Explore your consciousness in zero gravity with the Astronaut experience.',
    type: 'website',
  },
}

export default function AstronautLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
