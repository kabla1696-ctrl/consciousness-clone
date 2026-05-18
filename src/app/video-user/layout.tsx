import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video User',
  description: 'Video call and chat with other users on the Consciousness Clone platform.',
  openGraph: {
    title: 'Video User | Consciousness Clone',
    description: 'Video call and chat with other users on the Consciousness Clone platform.',
    type: 'website',
  },
}

export default function VideoUserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
