import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Ghost',
  description: 'Encounter ghost memories — forgotten moments resurfaced by your consciousness.',
  openGraph: {
    title: 'Memory Ghost | Consciousness Clone',
    description: 'Encounter ghost memories — forgotten moments resurfaced by your consciousness.',
    type: 'website',
  },
}

export default function MemoryGhostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
