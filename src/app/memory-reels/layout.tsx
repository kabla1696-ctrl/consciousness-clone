import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Reels',
  description: 'Watch AI-generated video reels compiled from your digital memories.',
  openGraph: {
    title: 'Memory Reels | Consciousness Clone',
    description: 'Watch AI-generated video reels compiled from your digital memories.',
    type: 'website',
  },
}

export default function MemoryReelsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
