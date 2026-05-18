import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Future Self',
  description: 'Communicate with your projected future digital consciousness self.',
  openGraph: {
    title: 'Future Self | Consciousness Clone',
    description: 'Communicate with your projected future digital consciousness self.',
    type: 'website',
  },
}

export default function FutureSelfLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
