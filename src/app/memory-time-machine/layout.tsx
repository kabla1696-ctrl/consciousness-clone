import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Time Machine',
  description: 'Travel back through your memory timeline with the time machine feature.',
  openGraph: {
    title: 'Memory Time Machine | Consciousness Clone',
    description: 'Travel back through your memory timeline with the time machine feature.',
    type: 'website',
  },
}

export default function MemoryTimeMachineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
