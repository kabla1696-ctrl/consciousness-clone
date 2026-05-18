import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Confessions',
  description: 'Share anonymous confessions and deep thoughts through your digital consciousness.',
  openGraph: {
    title: 'Clone Confessions | Consciousness Clone',
    description: 'Share anonymous confessions and deep thoughts through your digital consciousness.',
    type: 'website',
  },
}

export default function CloneConfessionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
