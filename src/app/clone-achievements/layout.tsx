import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Achievements',
  description: 'Track and celebrate your digital clone\'s achievements and milestones.',
  openGraph: {
    title: 'Clone Achievements | Consciousness Clone',
    description: 'Track and celebrate your digital clone\'s achievements and milestones.',
    type: 'website',
  },
}

export default function CloneAchievementsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
