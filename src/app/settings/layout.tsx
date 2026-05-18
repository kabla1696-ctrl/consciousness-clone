import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Consciousness Clone',
  description: 'Customize your consciousness clone experience',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
