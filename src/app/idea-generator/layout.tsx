import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Idea Generator',
  description: 'AI-powered idea generation and creative brainstorming with your consciousness.',
  openGraph: {
    title: 'Idea Generator | Consciousness Clone',
    description: 'AI-powered idea generation and creative brainstorming with your consciousness.',
    type: 'website',
  },
}

export default function IdeaGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
