import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Widget',
  description: 'Embeddable widgets for sharing your consciousness data on external sites.',
  openGraph: {
    title: 'Widget | Consciousness Clone',
    description: 'Embeddable widgets for sharing your consciousness data on external sites.',
    type: 'website',
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
