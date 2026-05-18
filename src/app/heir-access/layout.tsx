import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Heir Access',
  description: 'Configure heir access and inheritance rules for your digital consciousness.',
  openGraph: {
    title: 'Heir Access | Consciousness Clone',
    description: 'Configure heir access and inheritance rules for your digital consciousness.',
    type: 'website',
  },
}

export default function HeirAccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
