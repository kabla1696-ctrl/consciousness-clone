import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Artist',
  description: 'Transform your memories into AI-generated art and visual experiences.',
  openGraph: {
    title: 'Memory Artist | Consciousness Clone',
    description: 'Transform your memories into AI-generated art and visual experiences.',
    type: 'website',
  },
}

export default function MemoryArtistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
