import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Mining',
  description: 'Mine consciousness tokens and rewards through soul mining activities.',
  openGraph: {
    title: 'Soul Mining | Consciousness Clone',
    description: 'Mine consciousness tokens and rewards through soul mining activities.',
    type: 'website',
  },
}

export default function SoulMiningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
