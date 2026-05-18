import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Share',
  description: 'Share your consciousness experiences and memories with others.',
  openGraph: {
    title: 'Share | Consciousness Clone',
    description: 'Share your consciousness experiences and memories with others.',
    type: 'website',
  },
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
