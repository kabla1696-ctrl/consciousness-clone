import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Photo Memories',
  description: 'Browse and organize your photo-based memories and visual consciousness data.',
  openGraph: {
    title: 'Photo Memories | Consciousness Clone',
    description: 'Browse and organize your photo-based memories and visual consciousness data.',
    type: 'website',
  },
}

export default function PhotoMemoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
