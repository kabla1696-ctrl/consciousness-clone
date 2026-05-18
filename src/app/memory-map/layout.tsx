import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Map',
  description: 'Explore your memories on an interactive geographic and temporal map.',
  openGraph: {
    title: 'Memory Map | Consciousness Clone',
    description: 'Explore your memories on an interactive geographic and temporal map.',
    type: 'website',
  },
}

export default function MemoryMapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
