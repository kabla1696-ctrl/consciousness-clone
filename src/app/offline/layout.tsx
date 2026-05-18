import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline. Your consciousness is resting.',
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
