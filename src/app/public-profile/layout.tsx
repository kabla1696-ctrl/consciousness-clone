import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Public Profile',
  description: 'View and manage your public consciousness profile visible to other users.',
  openGraph: {
    title: 'Public Profile | Consciousness Clone',
    description: 'View and manage your public consciousness profile visible to other users.',
    type: 'website',
  },
}

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
