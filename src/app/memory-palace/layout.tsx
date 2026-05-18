import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Palace',
  description: 'Build and explore your digital memory palace for enhanced recall.',
  openGraph: {
    title: 'Memory Palace | Consciousness Clone',
    description: 'Build and explore your digital memory palace for enhanced recall.',
    type: 'website',
  },
}

export default function MemoryPalaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
