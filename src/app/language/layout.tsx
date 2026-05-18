import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Language | Consciousness Clone',
  description: 'Choose your preferred language for consciousness clone',
}

export default function LanguageLayout({ children }: { children: React.ReactNode }) {
  return children
}
