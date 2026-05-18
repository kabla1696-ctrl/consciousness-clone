import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Level',
  description: 'View your clone\'s level, XP progress, and unlockable abilities.',
  openGraph: {
    title: 'Clone Level | Consciousness Clone',
    description: 'View your clone\'s level, XP progress, and unlockable abilities.',
    type: 'website',
  },
}

export default function CloneLevelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
