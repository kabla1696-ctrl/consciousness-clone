'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export interface AccentTheme {
  id: string
  name: string
  color: string
  glow: string
  rgb: string
}

export const accentThemes: AccentTheme[] = [
  { id: 'violet', name: 'Violet', color: '#8b5cf6', glow: 'rgba(139,92,246,0.15)', rgb: '139,92,246' },
  { id: 'rose', name: 'Rose', color: '#f43f5e', glow: 'rgba(244,63,94,0.15)', rgb: '244,63,94' },
  { id: 'emerald', name: 'Emerald', color: '#10b981', glow: 'rgba(16,185,129,0.15)', rgb: '16,185,129' },
  { id: 'amber', name: 'Amber', color: '#f59e0b', glow: 'rgba(245,158,11,0.15)', rgb: '245,158,11' },
  { id: 'sky', name: 'Sky', color: '#0ea5e9', glow: 'rgba(14,165,233,0.15)', rgb: '14,165,233' },
  { id: 'fuchsia', name: 'Fuchsia', color: '#d946ef', glow: 'rgba(217,70,239,0.15)', rgb: '217,70,239' },
  { id: 'orange', name: 'Orange', color: '#f97316', glow: 'rgba(249,115,22,0.15)', rgb: '249,115,22' },
  { id: 'teal', name: 'Teal', color: '#14b8a6', glow: 'rgba(20,184,166,0.15)', rgb: '20,184,166' },
]

interface ThemeContextValue {
  theme: AccentTheme
  setTheme: (theme: AccentTheme) => void
  themes: AccentTheme[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AccentTheme>(accentThemes[0])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cc_theme')
      if (stored) {
        const parsed = accentThemes.find(t => t.id === stored)
        if (parsed) {
          setThemeState(parsed)
          applyTheme(parsed)
          return
        }
      }
    } catch {}
    applyTheme(accentThemes[0])
  }, [])

  const setTheme = useCallback((newTheme: AccentTheme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    try {
      localStorage.setItem('cc_theme', newTheme.id)
    } catch {}
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: accentThemes }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyTheme(t: AccentTheme) {
  const root = document.documentElement
  root.style.setProperty('--accent-color', t.color)
  root.style.setProperty('--accent-glow', t.glow)
  root.style.setProperty('--accent-rgb', t.rgb)
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  // Return default theme during SSR/prerender when provider isn't mounted
  if (!ctx) return { theme: accentThemes[0], setTheme: () => {}, themes: accentThemes }
  return ctx
}
