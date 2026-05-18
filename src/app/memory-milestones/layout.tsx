import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Milestones',
  description: 'Celebrate significant memory milestones and consciousness achievements.',
  openGraph: {
    title: 'Memory Milestones | Consciousness Clone',
    description: 'Celebrate significant memory milestones and consciousness achievements.',
    type: 'website',
  },
}

export default function MemoryMilestonesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
