import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Identity',
  description: 'Manage and customize your digital clone\'s identity and persona settings.',
  openGraph: {
    title: 'Clone Identity | Consciousness Clone',
    description: 'Manage and customize your digital clone\'s identity and persona settings.',
    type: 'website',
  },
}

export default function CloneIdentityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
