import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emotional Weather',
  description: 'Visualize your emotional landscape as a dynamic weather pattern and forecast.',
  openGraph: {
    title: 'Emotional Weather | Consciousness Clone',
    description: 'Visualize your emotional landscape as a dynamic weather pattern and forecast.',
    type: 'website',
  },
}

export default function EmotionalWeatherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
