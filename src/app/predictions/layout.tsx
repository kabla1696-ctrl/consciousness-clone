import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Predictions',
  description: 'AI predictions and forecasts based on your consciousness patterns and trends.',
  openGraph: {
    title: 'Predictions | Consciousness Clone',
    description: 'AI predictions and forecasts based on your consciousness patterns and trends.',
    type: 'website',
  },
}

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
