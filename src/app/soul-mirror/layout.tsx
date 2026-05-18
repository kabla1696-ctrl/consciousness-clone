import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Mirror',
  description: 'See an alternative reflection of your consciousness in the soul mirror.',
  openGraph: {
    title: 'Soul Mirror | Consciousness Clone',
    description: 'See an alternative reflection of your consciousness in the soul mirror.',
    type: 'website',
  },
}

export default function SoulMirrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
