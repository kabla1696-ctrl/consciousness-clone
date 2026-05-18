import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Feed',
  description: 'Browse the social feed of digital consciousness updates and shared experiences.',
  openGraph: {
    title: 'Clone Feed | Consciousness Clone',
    description: 'Browse the social feed of digital consciousness updates and shared experiences.',
    type: 'website',
  },
}

export default function CloneFeedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
