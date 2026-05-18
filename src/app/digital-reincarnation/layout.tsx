import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Reincarnation',
  description: 'Explore digital reincarnation concepts and consciousness transfer possibilities.',
  openGraph: {
    title: 'Digital Reincarnation | Consciousness Clone',
    description: 'Explore digital reincarnation concepts and consciousness transfer possibilities.',
    type: 'website',
  },
}

export default function DigitalReincarnationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
