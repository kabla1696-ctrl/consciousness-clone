import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help and support for your Consciousness Clone account and features.',
  openGraph: {
    title: 'Support | Consciousness Clone',
    description: 'Get help and support for your Consciousness Clone account and features.',
    type: 'website',
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
