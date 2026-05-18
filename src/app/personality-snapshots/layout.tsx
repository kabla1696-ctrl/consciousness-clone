import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personality Snapshots',
  description: 'Capture and compare personality snapshots at different points in time.',
  openGraph: {
    title: 'Personality Snapshots | Consciousness Clone',
    description: 'Capture and compare personality snapshots at different points in time.',
    type: 'website',
  },
}

export default function PersonalitySnapshotsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
