import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Sync',
  description: 'Synchronize your consciousness across devices and platforms seamlessly.',
  openGraph: {
    title: 'Soul Sync | Consciousness Clone',
    description: 'Synchronize your consciousness across devices and platforms seamlessly.',
    type: 'website',
  },
}

export default function SoulSyncLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
