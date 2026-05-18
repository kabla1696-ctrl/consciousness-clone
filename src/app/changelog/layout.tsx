import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'View the latest updates, features, and improvements to Consciousness Clone.',
  openGraph: {
    title: 'Changelog | Consciousness Clone',
    description: 'View the latest updates, features, and improvements to Consciousness Clone.',
    type: 'website',
  },
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
