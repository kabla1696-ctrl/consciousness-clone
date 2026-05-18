'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

// ─── Flag Definitions ───

export type FeatureFlag =
  | 'new-dashboard'
  | 'ai-suggestions'
  | 'voice-mode'
  | 'beta-features'
  | 'simplified-ui'

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  'new-dashboard': false,
  'ai-suggestions': true,
  'voice-mode': true,
  'beta-features': false,
  'simplified-ui': false,
}

const STORAGE_KEY = 'cc_feature_flags'

// ─── Storage Helpers ───

function loadFlags(): Record<FeatureFlag, boolean> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_FLAGS, ...parsed }
    }
  } catch {}
  return { ...DEFAULT_FLAGS }
}

function saveFlags(flags: Record<FeatureFlag, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  } catch {}
}

// ─── URL Override ───

function applyUrlOverrides(flags: Record<FeatureFlag, boolean>): Record<FeatureFlag, boolean> {
  if (typeof window === 'undefined') return flags
  const params = new URLSearchParams(window.location.search)
  const flagParam = params.get('flag')
  if (!flagParam) return flags

  const result = { ...flags }
  // Support ?flag=new-dashboard:true or ?flag=new-dashboard:true,ai-suggestions:false
  for (const part of flagParam.split(',')) {
    const [key, val] = part.split(':')
    if (key in DEFAULT_FLAGS && (val === 'true' || val === 'false')) {
      result[key as FeatureFlag] = val === 'true'
    }
  }
  return result
}

// ─── Context ───

interface FeatureFlagContextValue {
  flags: Record<FeatureFlag, boolean>
  isEnabled: (flag: FeatureFlag) => boolean
  setFlag: (flag: FeatureFlag, value: boolean) => void
  resetFlags: () => void
  exportFlags: () => string
  importFlags: (json: string) => void
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined)

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlagsState] = useState<Record<FeatureFlag, boolean>>(DEFAULT_FLAGS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loaded = loadFlags()
    const withOverrides = applyUrlOverrides(loaded)
    setFlagsState(withOverrides)
    saveFlags(withOverrides)
    setReady(true)
  }, [])

  const setFlag = useCallback((flag: FeatureFlag, value: boolean) => {
    setFlagsState(prev => {
      const next = { ...prev, [flag]: value }
      saveFlags(next)
      return next
    })
  }, [])

  const resetFlags = useCallback(() => {
    setFlagsState({ ...DEFAULT_FLAGS })
    saveFlags(DEFAULT_FLAGS)
  }, [])

  const exportFlags = useCallback(() => {
    return JSON.stringify(flags, null, 2)
  }, [flags])

  const importFlags = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json)
      const merged: Record<FeatureFlag, boolean> = { ...DEFAULT_FLAGS }
      for (const key of Object.keys(DEFAULT_FLAGS) as FeatureFlag[]) {
        if (typeof parsed[key] === 'boolean') {
          merged[key] = parsed[key]
        }
      }
      setFlagsState(merged)
      saveFlags(merged)
    } catch {}
  }, [])

  const isEnabled = useCallback((flag: FeatureFlag) => flags[flag] ?? false, [flags])

  return (
    <FeatureFlagContext.Provider
      value={{ flags, isEnabled, setFlag, resetFlags, exportFlags, importFlags }}
    >
      {children}
    </FeatureFlagContext.Provider>
  )
}

// ─── Public API ───

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const ctx = useContext(FeatureFlagContext)
  if (!ctx) return DEFAULT_FLAGS[flag] ?? false
  return ctx.isEnabled(flag)
}

export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagContext)
  if (!ctx) {
    return {
      flags: DEFAULT_FLAGS,
      isEnabled: (flag: FeatureFlag) => DEFAULT_FLAGS[flag] ?? false,
      setFlag: () => {},
      resetFlags: () => {},
      exportFlags: () => '{}',
      importFlags: () => {},
    }
  }
  return ctx
}

/** Standalone check (works outside React, reads from loaded state) */
let _currentFlags: Record<FeatureFlag, boolean> = DEFAULT_FLAGS

export function isEnabled(flag: FeatureFlag): boolean {
  return _currentFlags[flag] ?? false
}

export function setFlag(flag: FeatureFlag, value: boolean): void {
  _currentFlags[flag] = value
  saveFlags(_currentFlags)
}

export { DEFAULT_FLAGS }
