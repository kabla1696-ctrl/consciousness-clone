import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Tournament',
  description: 'Compete in consciousness tournaments and challenges with other users.',
  openGraph: {
    title: 'Clone Tournament | Consciousness Clone',
    description: 'Compete in consciousness tournaments and challenges with other users.',
    type: 'website',
  },
}

export default function CloneTournamentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
