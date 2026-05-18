import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../lib/theme-context'

describe('ThemeContext', () => {
  it('provides theme and toggleColorMode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBeDefined()
    expect(typeof result.current.toggleColorMode).toBe('function')
  })

  it('defaults to violet accent theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme.id).toBe('violet')
  })

  it('defaults to dark color mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.colorMode).toBe('dark')
  })

  it('toggles color mode', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.colorMode).toBe('dark')
    act(() => {
      result.current.toggleColorMode()
    })
    expect(result.current.colorMode).toBe('light')
    act(() => {
      result.current.toggleColorMode()
    })
    expect(result.current.colorMode).toBe('dark')
  })

  it('provides accent color matching theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.accentColor).toBe(result.current.theme.color)
  })

  it('provides list of themes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.themes.length).toBeGreaterThan(0)
  })
})
