import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Time Capsule | Consciousness Clone',
  description: 'Create messages to be delivered in the future',
}

export default function TimeCapsuleLayout({ children }: { children: React.ReactNode }) {
  return children
}
