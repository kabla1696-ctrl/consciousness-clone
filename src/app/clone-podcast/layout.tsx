import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Podcast',
  description: 'Listen to AI-generated podcasts featuring your digital consciousness insights.',
  openGraph: {
    title: 'Clone Podcast | Consciousness Clone',
    description: 'Listen to AI-generated podcasts featuring your digital consciousness insights.',
    type: 'website',
  },
}

export default function ClonePodcastLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
