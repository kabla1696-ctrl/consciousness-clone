import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy and data protection information for Consciousness Clone.',
  openGraph: {
    title: 'Privacy | Consciousness Clone',
    description: 'Privacy policy and data protection information for Consciousness Clone.',
    type: 'website',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
