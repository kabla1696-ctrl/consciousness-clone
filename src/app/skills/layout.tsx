import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skills',
  description: 'Discover and develop new skills through your digital consciousness training.',
  openGraph: {
    title: 'Skills | Consciousness Clone',
    description: 'Discover and develop new skills through your digital consciousness training.',
    type: 'website',
  },
}

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
