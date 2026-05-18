import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Diary',
  description: 'Your digital clone\'s private diary — automated reflections and daily entries.',
  openGraph: {
    title: 'Clone Diary | Consciousness Clone',
    description: 'Your digital clone\'s private diary — automated reflections and daily entries.',
    type: 'website',
  },
}

export default function CloneDiaryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
