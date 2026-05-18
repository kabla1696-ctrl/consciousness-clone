import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Marketplace',
  description: 'Buy, sell, and trade digital memories in the consciousness marketplace.',
  openGraph: {
    title: 'Memory Marketplace | Consciousness Clone',
    description: 'Buy, sell, and trade digital memories in the consciousness marketplace.',
    type: 'website',
  },
}

export default function MemoryMarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
