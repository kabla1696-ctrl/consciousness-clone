import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Frequency',
  description: 'Discover and tune your unique soul frequency and consciousness vibration.',
  openGraph: {
    title: 'Soul Frequency | Consciousness Clone',
    description: 'Discover and tune your unique soul frequency and consciousness vibration.',
    type: 'website',
  },
}

export default function SoulFrequencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
