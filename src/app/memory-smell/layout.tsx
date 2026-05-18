import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Smell',
  description: 'Associate scent memories with your digital consciousness experiences.',
  openGraph: {
    title: 'Memory Smell | Consciousness Clone',
    description: 'Associate scent memories with your digital consciousness experiences.',
    type: 'website',
  },
}

export default function MemorySmellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
