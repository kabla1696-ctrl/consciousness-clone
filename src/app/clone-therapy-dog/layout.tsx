import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Therapy Dog',
  description: 'Your AI therapy companion — comfort and emotional support from your digital pet.',
  openGraph: {
    title: 'Clone Therapy Dog | Consciousness Clone',
    description: 'Your AI therapy companion — comfort and emotional support from your digital pet.',
    type: 'website',
  },
}

export default function CloneTherapyDogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
