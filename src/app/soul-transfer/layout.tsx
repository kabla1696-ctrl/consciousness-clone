import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soul Transfer',
  description: 'Transfer your consciousness data between accounts and platforms.',
  openGraph: {
    title: 'Soul Transfer | Consciousness Clone',
    description: 'Transfer your consciousness data between accounts and platforms.',
    type: 'website',
  },
}

export default function SoulTransferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
