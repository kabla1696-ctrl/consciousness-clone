import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Encryption',
  description: 'Advanced encryption for protecting the core of your digital soul.',
  openGraph: {
    title: 'Soul Encryption | Consciousness Clone',
    description: 'Advanced encryption for protecting the core of your digital soul.',
    type: 'website',
  },
}

export default function SoulEncryptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
