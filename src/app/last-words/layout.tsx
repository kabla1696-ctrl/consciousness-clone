import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Last Words',
  description: 'Compose and preserve your last words and final consciousness transmission.',
  openGraph: {
    title: 'Last Words | Consciousness Clone',
    description: 'Compose and preserve your last words and final consciousness transmission.',
    type: 'website',
  },
}

export default function LastWordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
