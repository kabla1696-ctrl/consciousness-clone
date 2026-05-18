import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Evolution',
  description: 'Track how your personality traits evolve over time through consciousness data.',
  openGraph: {
    title: 'Personality Evolution | Consciousness Clone',
    description: 'Track how your personality traits evolve over time through consciousness data.',
    type: 'website',
  },
}

export default function PersonalityEvolutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
