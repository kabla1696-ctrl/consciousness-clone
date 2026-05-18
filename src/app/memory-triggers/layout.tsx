import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Triggers',
  description: 'Discover what triggers your memories and emotional consciousness patterns.',
  openGraph: {
    title: 'Memory Triggers | Consciousness Clone',
    description: 'Discover what triggers your memories and emotional consciousness patterns.',
    type: 'website',
  },
}

export default function MemoryTriggersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
