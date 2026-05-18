import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Goals',
  description: 'Set, track, and achieve personal growth goals with your digital consciousness.',
  openGraph: {
    title: 'Goals | Consciousness Clone',
    description: 'Set, track, and achieve personal growth goals with your digital consciousness.',
    type: 'website',
  },
}

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
