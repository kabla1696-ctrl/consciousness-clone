import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Leaderboard',
  description: 'See how your consciousness ranks on the global soul leaderboard.',
  openGraph: {
    title: 'Soul Leaderboard | Consciousness Clone',
    description: 'See how your consciousness ranks on the global soul leaderboard.',
    type: 'website',
  },
}

export default function SoulLeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
