import { renderHook } from '@testing-library/react'
import { LanguageProvider, useLanguage } from '../lib/language-context'

describe('LanguageContext', () => {
  it('provides t function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(typeof result.current.t).toBe('function')
  })

  it('returns key as fallback for missing translations', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('defaults to English language', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.lang).toBe('en')
  })

  it('provides setLang function', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(typeof result.current.setLang).toBe('function')
  })

  it('defaults to ltr direction', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>{children}</LanguageProvider>
    )
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.dir).toBe('ltr')
  })
})
