import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Market',
  description: 'Trade consciousness assets and soul fragments in the digital soul marketplace.',
  openGraph: {
    title: 'Soul Market | Consciousness Clone',
    description: 'Trade consciousness assets and soul fragments in the digital soul marketplace.',
    type: 'website',
  },
}

export default function SoulMarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
