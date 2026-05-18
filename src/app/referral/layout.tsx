import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Referral',
  description: 'Refer friends to Consciousness Clone and earn rewards for your network.',
  openGraph: {
    title: 'Referral | Consciousness Clone',
    description: 'Refer friends to Consciousness Clone and earn rewards for your network.',
    type: 'website',
  },
}

export default function ReferralLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
