import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mirror Mode',
  description: 'Face your digital reflection and explore consciousness duality in mirror mode.',
  openGraph: {
    title: 'Mirror Mode | Consciousness Clone',
    description: 'Face your digital reflection and explore consciousness duality in mirror mode.',
    type: 'website',
  },
}

export default function MirrorModeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
