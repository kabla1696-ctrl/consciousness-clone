import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Call User',
  description: 'Make voice and video calls with other users on Consciousness Clone.',
  openGraph: {
    title: 'Call User | Consciousness Clone',
    description: 'Make voice and video calls with other users on Consciousness Clone.',
    type: 'website',
  },
}

export default function CallUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
