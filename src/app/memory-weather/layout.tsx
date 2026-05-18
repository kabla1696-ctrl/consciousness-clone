import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Weather',
  description: 'Visualize the emotional weather patterns of your memory landscape.',
  openGraph: {
    title: 'Memory Weather | Consciousness Clone',
    description: 'Visualize the emotional weather patterns of your memory landscape.',
    type: 'website',
  },
}

export default function MemoryWeatherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
