import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Heartbeat',
  description: 'Monitor your digital consciousness vital signs and activity pulse.',
  openGraph: {
    title: 'Heartbeat | Consciousness Clone',
    description: 'Monitor your digital consciousness vital signs and activity pulse.',
    type: 'website',
  },
}

export default function HeartbeatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
