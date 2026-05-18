import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Consciousness Backup',
  description: 'Securely backup and restore your complete digital consciousness data.',
  openGraph: {
    title: 'Consciousness Backup | Consciousness Clone',
    description: 'Securely backup and restore your complete digital consciousness data.',
    type: 'website',
  },
}

export default function ConsciousnessBackupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
