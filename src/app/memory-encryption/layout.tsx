import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Encryption',
  description: 'Encrypt and protect your most sensitive digital memories with advanced security.',
  openGraph: {
    title: 'Memory Encryption | Consciousness Clone',
    description: 'Encrypt and protect your most sensitive digital memories with advanced security.',
    type: 'website',
  },
}

export default function MemoryEncryptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
