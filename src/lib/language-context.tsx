'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TRANSLATIONS } from './languages'

interface LanguageContextType {
  lang: string
  setLang: (code: string) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'ltr',
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cc_language') || 'en'
    setLangState(saved)
    document.documentElement.lang = saved
    const isRtl = ['ar', 'ur', 'fa', 'he', 'ps'].includes(saved)
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    setMounted(true)
  }, [])

  const setLang = (code: string) => {
    setLangState(code)
    localStorage.setItem('cc_language', code)
    document.documentElement.lang = code
    const isRtl = ['ar', 'ur', 'fa', 'he', 'ps'].includes(code)
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
  }

  const t = (key: string): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key
  }

  const dir = ['ar', 'ur', 'fa', 'he', 'ps'].includes(lang) ? 'rtl' : 'ltr'

  // Don't block render — just render children immediately
  // Translation will update on mount when localStorage is read
  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

// Convenience hook for just translation
export function useT() {
  const { t } = useContext(LanguageContext)
  return t
}
