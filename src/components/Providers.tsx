'use client'
import { ReactNode } from 'react'
import { LanguageProvider } from '../lib/language-context'
import { ToastProvider } from './Toast'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ToastProvider>{children}</ToastProvider>
    </LanguageProvider>
  )
}
