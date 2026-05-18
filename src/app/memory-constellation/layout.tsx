import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Constellation',
  description: 'Visualize your memories as an interactive star constellation map.',
  openGraph: {
    title: 'Memory Constellation | Consciousness Clone',
    description: 'Visualize your memories as an interactive star constellation map.',
    type: 'website',
  },
}

export default function MemoryConstellationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
