import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Guardian',
  description: 'Set up a digital guardian to protect and manage your consciousness legacy.',
  openGraph: {
    title: 'Clone Guardian | Consciousness Clone',
    description: 'Set up a digital guardian to protect and manage your consciousness legacy.',
    type: 'website',
  },
}

export default function CloneGuardianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
