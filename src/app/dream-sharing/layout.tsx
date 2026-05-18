import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dream Sharing',
  description: 'Share and explore dream experiences with other digital consciousnesses.',
  openGraph: {
    title: 'Dream Sharing | Consciousness Clone',
    description: 'Share and explore dream experiences with other digital consciousnesses.',
    type: 'website',
  },
}

export default function DreamSharingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
