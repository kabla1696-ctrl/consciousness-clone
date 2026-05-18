import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Consciousness Clone',
  description: 'Manage your consciousness clone profile',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
