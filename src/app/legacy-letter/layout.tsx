import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legacy Letters | Consciousness Clone',
  description: 'Write letters to loved ones for the future',
}

export default function LegacyLetterLayout({ children }: { children: React.ReactNode }) {
  return children
}
