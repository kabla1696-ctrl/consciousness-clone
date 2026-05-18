import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Memory Vault | Consciousness Clone',
  description: 'Your secure digital memory vault — preserve every moment',
}

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return children
}
