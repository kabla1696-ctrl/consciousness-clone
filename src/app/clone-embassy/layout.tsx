import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Embassy',
  description: 'The diplomatic hub for cross-platform digital consciousness representation.',
  openGraph: {
    title: 'Clone Embassy | Consciousness Clone',
    description: 'The diplomatic hub for cross-platform digital consciousness representation.',
    type: 'website',
  },
}

export default function CloneEmbassyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
