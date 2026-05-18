import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clone Quiz',
  description: 'Test your self-knowledge with interactive quizzes about your consciousness.',
  openGraph: {
    title: 'Clone Quiz | Consciousness Clone',
    description: 'Test your self-knowledge with interactive quizzes about your consciousness.',
    type: 'website',
  },
}

export default function CloneQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
