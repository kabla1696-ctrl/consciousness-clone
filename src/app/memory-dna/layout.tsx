import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Dna',
  description: 'Explore the unique DNA structure and genetic code of your memory patterns.',
  openGraph: {
    title: 'Memory Dna | Consciousness Clone',
    description: 'Explore the unique DNA structure and genetic code of your memory patterns.',
    type: 'website',
  },
}

export default function MemoryDnaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
