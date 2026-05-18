import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Aura',
  description: 'Visualize and explore the unique aura and energy signature of your digital clone.',
  openGraph: {
    title: 'Clone Aura | Consciousness Clone',
    description: 'Visualize and explore the unique aura and energy signature of your digital clone.',
    type: 'website',
  },
}

export default function CloneAuraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
