import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dream Mode',
  description: 'Enter dream mode for subconscious exploration and creative consciousness sessions.',
  openGraph: {
    title: 'Dream Mode | Consciousness Clone',
    description: 'Enter dream mode for subconscious exploration and creative consciousness sessions.',
    type: 'website',
  },
}

export default function DreamModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
