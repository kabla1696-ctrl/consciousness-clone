import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Seance',
  description: 'Connect with archived consciousnesses through guided digital seance experiences.',
  openGraph: {
    title: 'Digital Seance | Consciousness Clone',
    description: 'Connect with archived consciousnesses through guided digital seance experiences.',
    type: 'website',
  },
}

export default function DigitalSeanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
