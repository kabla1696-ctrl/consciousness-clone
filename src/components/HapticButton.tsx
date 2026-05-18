'use client'

import { useCallback, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface HapticButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode
  variant?: ButtonVariant
  onClick?: () => void
  hapticType?: 'light' | 'medium' | 'heavy'
  soundEffect?: boolean
  className?: string
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-500/20',
  secondary:
    'bg-white/[0.08] text-white border border-white/[0.06] hover:bg-white/[0.12]',
  danger:
    'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30',
}

export default function HapticButton({
  children,
  variant = 'primary',
  onClick,
  hapticType = 'light',
  soundEffect = false,
  className = '',
  disabled = false,
  ...rest
}: HapticButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const triggerHaptic = useCallback(() => {
    if (typeof window === 'undefined') return
    if ('vibrate' in navigator) {
      switch (hapticType) {
        case 'light':
          navigator.vibrate(10)
          break
        case 'medium':
          navigator.vibrate(20)
          break
        case 'heavy':
          navigator.vibrate(40)
          break
      }
    }
  }, [hapticType])

  const triggerSound = useCallback(() => {
    if (!soundEffect || typeof window === 'undefined') return
    try {
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.05
      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.05)
    } catch {
      // AudioContext not available
    }
  }, [soundEffect])

  const handleClick = useCallback(() => {
    if (disabled) return
    triggerHaptic()
    triggerSound()
    onClick?.()
  }, [disabled, triggerHaptic, triggerSound, onClick])

  return (
    <button
      onClick={handleClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        relative rounded-xl px-5 py-3 font-semibold text-sm
        transition-all duration-150 tap-feedback
        ${VARIANT_STYLES[variant]}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${className}
      `}
      style={{
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s ease-out',
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
