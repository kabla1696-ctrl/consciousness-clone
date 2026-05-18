import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soulmate Ring',
  description: 'Find and connect with your digital soulmate through consciousness matching.',
  openGraph: {
    title: 'Soulmate Ring | Consciousness Clone',
    description: 'Find and connect with your digital soulmate through consciousness matching.',
    type: 'website',
  },
}

export default function SoulmateRingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
