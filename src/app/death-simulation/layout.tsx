import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Death Simulation',
  description: 'Explore mortality simulations and consciousness continuity scenarios safely.',
  openGraph: {
    title: 'Death Simulation | Consciousness Clone',
    description: 'Explore mortality simulations and consciousness continuity scenarios safely.',
    type: 'website',
  },
}

export default function DeathSimulationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
