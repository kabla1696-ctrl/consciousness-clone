import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Diagnosis',
  description: 'Diagnose and analyze the health and vitality of your digital consciousness.',
  openGraph: {
    title: 'Soul Diagnosis | Consciousness Clone',
    description: 'Diagnose and analyze the health and vitality of your digital consciousness.',
    type: 'website',
  },
}

export default function SoulDiagnosisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
