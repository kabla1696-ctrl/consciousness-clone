import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legacy',
  description: 'Manage your digital legacy — preserve your consciousness for future generations.',
  openGraph: {
    title: 'Legacy | Consciousness Clone',
    description: 'Manage your digital legacy — preserve your consciousness for future generations.',
    type: 'website',
  },
}

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
