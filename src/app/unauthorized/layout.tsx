import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unauthorized',
  description: 'Access denied — please log in to continue to Consciousness Clone.',
  openGraph: {
    title: 'Unauthorized | Consciousness Clone',
    description: 'Access denied — please log in to continue to Consciousness Clone.',
    type: 'website',
  },
}

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
