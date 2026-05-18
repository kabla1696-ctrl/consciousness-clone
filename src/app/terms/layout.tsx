import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of service and usage guidelines for the Consciousness Clone platform.',
  openGraph: {
    title: 'Terms | Consciousness Clone',
    description: 'Terms of service and usage guidelines for the Consciousness Clone platform.',
    type: 'website',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
