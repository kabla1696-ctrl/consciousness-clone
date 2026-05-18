import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Tattoo',
  description: 'Design and apply digital tattoos that represent your consciousness identity.',
  openGraph: {
    title: 'Soul Tattoo | Consciousness Clone',
    description: 'Design and apply digital tattoos that represent your consciousness identity.',
    type: 'website',
  },
}

export default function SoulTattooLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
