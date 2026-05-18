import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Connect',
  description: 'Connect and interact with other users\' digital clones on the platform.',
  openGraph: {
    title: 'Clone Connect | Consciousness Clone',
    description: 'Connect and interact with other users\' digital clones on the platform.',
    type: 'website',
  },
}

export default function CloneConnectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
