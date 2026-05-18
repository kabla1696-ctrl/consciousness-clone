import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legacy Tree',
  description: 'Visualize your generational legacy tree and consciousness lineage.',
  openGraph: {
    title: 'Legacy Tree | Consciousness Clone',
    description: 'Visualize your generational legacy tree and consciousness lineage.',
    type: 'website',
  },
}

export default function LegacyTreeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
