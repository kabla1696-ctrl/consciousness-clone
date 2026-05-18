import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Passport',
  description: 'Your digital passport for cross-platform consciousness travel and exploration.',
  openGraph: {
    title: 'Clone Passport | Consciousness Clone',
    description: 'Your digital passport for cross-platform consciousness travel and exploration.',
    type: 'website',
  },
}

export default function ClonePassportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
