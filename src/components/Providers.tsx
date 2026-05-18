'use client'
import { ReactNode } from 'react'
import { LanguageProvider } from '../lib/language-context'
import { ToastProvider } from './Toast'
import { ThemeProvider } from '../lib/theme-context'
import { SoundProvider } from './SoundEffects'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SoundProvider>
          <ToastProvider>{children}</ToastProvider>
        </SoundProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
