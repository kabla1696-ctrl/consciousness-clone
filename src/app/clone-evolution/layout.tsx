import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Evolution',
  description: 'Track and visualize your digital clone\'s evolution and growth over time.',
  openGraph: {
    title: 'Clone Evolution | Consciousness Clone',
    description: 'Track and visualize your digital clone\'s evolution and growth over time.',
    type: 'website',
  },
}

export default function CloneEvolutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
