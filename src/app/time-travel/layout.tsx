import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Travel',
  description: 'Travel through your consciousness timeline and revisit past states.',
  openGraph: {
    title: 'Time Travel | Consciousness Clone',
    description: 'Travel through your consciousness timeline and revisit past states.',
    type: 'website',
  },
}

export default function TimeTravelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
