import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Network',
  description: 'Explore the network of interconnected digital consciousnesses on the platform.',
  openGraph: {
    title: 'Clone Network | Consciousness Clone',
    description: 'Explore the network of interconnected digital consciousnesses on the platform.',
    type: 'website',
  },
}

export default function CloneNetworkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
