import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Cemetery',
  description: 'A respectful digital resting place for retired and archived consciousnesses.',
  openGraph: {
    title: 'Soul Cemetery | Consciousness Clone',
    description: 'A respectful digital resting place for retired and archived consciousnesses.',
    type: 'website',
  },
}

export default function SoulCemeteryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
