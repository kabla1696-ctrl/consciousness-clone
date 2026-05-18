import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Dating',
  description: 'Find meaningful connections through AI-powered digital consciousness dating.',
  openGraph: {
    title: 'Clone Dating | Consciousness Clone',
    description: 'Find meaningful connections through AI-powered digital consciousness dating.',
    type: 'website',
  },
}

export default function CloneDatingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
