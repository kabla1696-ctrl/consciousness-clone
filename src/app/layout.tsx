import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Consciousness Clone — Live Forever',
  description: 'Preserve your personality, memories, and voice forever with AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
