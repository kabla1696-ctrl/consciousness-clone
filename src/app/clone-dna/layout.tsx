import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Dna',
  description: 'Explore the unique digital DNA and personality blueprint of your consciousness.',
  openGraph: {
    title: 'Clone Dna | Consciousness Clone',
    description: 'Explore the unique digital DNA and personality blueprint of your consciousness.',
    type: 'website',
  },
}

export default function CloneDnaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
