'use client'

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from 'react'

interface SoundContextValue {
  muted: boolean
  toggleMute: () => void
  play: {
    tap: () => void
    success: () => void
    error: () => void
    notification: () => void
    whoosh: () => void
  }
}

const SoundContext = createContext<SoundContextValue | null>(null)

const SOUND_MUTED_KEY = 'sound-muted'

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    return new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15
) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

function playTap(ctx: AudioContext) {
  playTone(ctx, 800, 0.06, 'sine', 0.08)
}

function playSuccess(ctx: AudioContext) {
  // Pleasant ascending two-note chime
  playTone(ctx, 523, 0.15, 'sine', 0.12) // C5
  setTimeout(() => playTone(ctx, 784, 0.25, 'sine', 0.12), 100) // G5
}

function playError(ctx: AudioContext) {
  // Descending two-note buzz
  playTone(ctx, 400, 0.12, 'square', 0.08)
  setTimeout(() => playTone(ctx, 300, 0.2, 'square', 0.08), 100)
}

function playNotification(ctx: AudioContext) {
  // Short bright ding
  playTone(ctx, 1047, 0.08, 'sine', 0.1) // C6
  setTimeout(() => playTone(ctx, 1319, 0.15, 'sine', 0.1), 60) // E6
}

function playWhoosh(ctx: AudioContext) {
  // Sweeping noise-like effect using rapid frequency sweep
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25)

  gainNode.gain.setValueAtTime(0.06, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.25)
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(true)
  const ctxRef = useRef<AudioContext | null>(null)

  // Load saved preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SOUND_MUTED_KEY)
      if (saved !== null) {
        setMuted(saved === 'true')
      }
    } catch {}
  }, [])

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = getAudioContext()
    }
    // Resume if suspended (browser autoplay policy)
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const withSound = useCallback(
    (fn: (ctx: AudioContext) => void) => {
      return () => {
        if (muted) return
        const ctx = getCtx()
        if (ctx) fn(ctx)
      }
    },
    [muted, getCtx]
  )

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SOUND_MUTED_KEY, String(next))
      } catch {}
      return next
    })
  }, [])

  const value: SoundContextValue = {
    muted,
    toggleMute,
    play: {
      tap: withSound(playTap),
      success: withSound(playSuccess),
      error: withSound(playError),
      notification: withSound(playNotification),
      whoosh: withSound(playWhoosh),
    },
  }

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    // Return silent fallback if provider not mounted
    const noop = () => {}
    return {
      muted: true,
      toggleMute: noop,
      play: {
        tap: noop,
        success: noop,
        error: noop,
        notification: noop,
        whoosh: noop,
      },
    }
  }
  return ctx
}
