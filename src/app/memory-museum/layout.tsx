import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Museum',
  description: 'Visit the virtual museum showcasing your most treasured digital memories.',
  openGraph: {
    title: 'Memory Museum | Consciousness Clone',
    description: 'Visit the virtual museum showcasing your most treasured digital memories.',
    type: 'website',
  },
}

export default function MemoryMuseumLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
