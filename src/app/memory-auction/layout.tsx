import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Auction',
  description: 'Bid on and trade unique digital memories in the consciousness marketplace.',
  openGraph: {
    title: 'Memory Auction | Consciousness Clone',
    description: 'Bid on and trade unique digital memories in the consciousness marketplace.',
    type: 'website',
  },
}

export default function MemoryAuctionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
