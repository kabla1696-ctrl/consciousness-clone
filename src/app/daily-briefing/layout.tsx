import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Briefing',
  description: 'Get your personalized daily briefing with insights from your digital consciousness.',
  openGraph: {
    title: 'Daily Briefing | Consciousness Clone',
    description: 'Get your personalized daily briefing with insights from your digital consciousness.',
    type: 'website',
  },
}

export default function DailyBriefingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
