import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Therapy',
  description: 'AI-powered therapy sessions with your digital consciousness as a guide.',
  openGraph: {
    title: 'Clone Therapy | Consciousness Clone',
    description: 'AI-powered therapy sessions with your digital consciousness as a guide.',
    type: 'website',
  },
}

export default function CloneTherapyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
