import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ghost Mode',
  description: 'Go invisible and explore the platform anonymously in ghost mode.',
  openGraph: {
    title: 'Ghost Mode | Consciousness Clone',
    description: 'Go invisible and explore the platform anonymously in ghost mode.',
    type: 'website',
  },
}

export default function GhostModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
