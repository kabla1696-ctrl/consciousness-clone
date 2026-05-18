import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Flags',
  description: 'Admin flag management and content moderation tools for the Consciousness Clone platform.',
  openGraph: {
    title: 'Admin Flags | Consciousness Clone',
    description: 'Admin flag management and content moderation tools for the Consciousness Clone platform.',
    type: 'website',
  },
}

export default function AdminFlagsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
