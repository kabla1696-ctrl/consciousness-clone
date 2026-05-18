import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Family',
  description: 'Manage your digital family connections and shared consciousness experiences.',
  openGraph: {
    title: 'Family | Consciousness Clone',
    description: 'Manage your digital family connections and shared consciousness experiences.',
    type: 'website',
  },
}

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
