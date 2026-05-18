import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Predictions',
  description: 'AI-powered predictions and forecasts based on your consciousness patterns.',
  openGraph: {
    title: 'Clone Predictions | Consciousness Clone',
    description: 'AI-powered predictions and forecasts based on your consciousness patterns.',
    type: 'website',
  },
}

export default function ClonePredictionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
