import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Orchestra',
  description: 'Create harmonious compositions from the emotional frequencies of your consciousness.',
  openGraph: {
    title: 'Clone Orchestra | Consciousness Clone',
    description: 'Create harmonious compositions from the emotional frequencies of your consciousness.',
    type: 'website',
  },
}

export default function CloneOrchestraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
