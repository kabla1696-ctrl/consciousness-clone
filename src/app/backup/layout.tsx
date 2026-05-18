import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Backup | Consciousness Clone',
  description: 'Export and backup your consciousness data',
}

export default function BackupLayout({ children }: { children: React.ReactNode }) {
  return children
}
