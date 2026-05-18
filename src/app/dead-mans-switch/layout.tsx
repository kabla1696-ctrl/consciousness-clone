import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dead Mans Switch',
  description: 'Configure automated actions and messages triggered by inactivity detection.',
  openGraph: {
    title: 'Dead Mans Switch | Consciousness Clone',
    description: 'Configure automated actions and messages triggered by inactivity detection.',
    type: 'website',
  },
}

export default function DeadMansSwitchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
