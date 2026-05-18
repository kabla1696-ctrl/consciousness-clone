import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Faq',
  description: 'Frequently asked questions about Consciousness Clone and digital immortality.',
  openGraph: {
    title: 'Faq | Consciousness Clone',
    description: 'Frequently asked questions about Consciousness Clone and digital immortality.',
    type: 'website',
  },
}

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
