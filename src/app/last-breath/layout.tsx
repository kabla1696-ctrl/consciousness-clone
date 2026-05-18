import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Last Breath',
  description: 'Configure your final digital message and consciousness farewell experience.',
  openGraph: {
    title: 'Last Breath | Consciousness Clone',
    description: 'Configure your final digital message and consciousness farewell experience.',
    type: 'website',
  },
}

export default function LastBreathLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
