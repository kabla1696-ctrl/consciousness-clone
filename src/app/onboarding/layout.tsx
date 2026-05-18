import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Welcome | Consciousness Clone',
  description: 'Get started with your consciousness clone journey',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
