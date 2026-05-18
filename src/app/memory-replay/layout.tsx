import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Replay',
  description: 'Replay and relive your favorite memories in immersive detail.',
  openGraph: {
    title: 'Memory Replay | Consciousness Clone',
    description: 'Replay and relive your favorite memories in immersive detail.',
    type: 'website',
  },
}

export default function MemoryReplayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
