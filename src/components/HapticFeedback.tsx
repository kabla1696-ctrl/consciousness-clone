'use client'

import { useCallback, ReactNode } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

async function triggerHaptic(type: HapticType) {
  if (typeof window === 'undefined') return

  // Try Capacitor Haptics first (native)
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      '@capacitor/haptics'
    )

    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light })
        break
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium })
        break
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy })
        break
      case 'success':
        await Haptics.notification({ type: NotificationType.Success })
        break
      case 'error':
        await Haptics.notification({ type: NotificationType.Error })
        break
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning })
        break
    }
    return
  } catch {
    // Not on native, fall through to web vibration
  }

  // Web fallback: navigator.vibrate
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10)
        break
      case 'medium':
        navigator.vibrate(20)
        break
      case 'heavy':
        navigator.vibrate(40)
        break
      case 'success':
        navigator.vibrate([15, 50, 15])
        break
      case 'error':
        navigator.vibrate([30, 30, 30, 30, 30])
        break
      case 'warning':
        navigator.vibrate([20, 40, 20])
        break
    }
  }
}

export function useHaptic() {
  const haptic = useCallback((type: HapticType = 'light') => {
    triggerHaptic(type)
  }, [])

  return { haptic }
}

interface HapticFeedbackProps {
  children: ReactNode
  type?: HapticType
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export default function HapticFeedback({
  children,
  type = 'light',
  className,
  onClick,
  disabled = false,
}: HapticFeedbackProps) {
  const { haptic } = useHaptic()

  const handleClick = useCallback(() => {
    if (disabled) return
    haptic(type)
    onClick?.()
  }, [disabled, haptic, type, onClick])

  return (
    <div
      onClick={handleClick}
      className={className}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {children}
    </div>
  )
}
