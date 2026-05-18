import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Sleep',
  description: 'Track and optimize your digital clone\'s rest and regeneration cycles.',
  openGraph: {
    title: 'Clone Sleep | Consciousness Clone',
    description: 'Track and optimize your digital clone\'s rest and regeneration cycles.',
    type: 'website',
  },
}

export default function CloneSleepLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
