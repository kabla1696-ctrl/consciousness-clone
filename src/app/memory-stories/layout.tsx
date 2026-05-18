import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Stories',
  description: 'AI-generated narrative stories woven from your collection of memories.',
  openGraph: {
    title: 'Memory Stories | Consciousness Clone',
    description: 'AI-generated narrative stories woven from your collection of memories.',
    type: 'website',
  },
}

export default function MemoryStoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
