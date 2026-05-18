'use client'
import React, { useRef, type MouseEvent, type ReactNode } from 'react'

interface RippleButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  type?: 'button' | 'submit'
  'aria-label'?: string
}

const RippleButton = React.memo(function RippleButton({ children, className = '', onClick, variant = 'primary', disabled = false, type = 'button', ...rest }: RippleButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current
    if (!btn || disabled) return
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    const size = Math.max(rect.width, rect.height) * 2
    ripple.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;background:rgba(255,255,255,0.2);transform:scale(0);animation:ripple 0.6s ease-out forwards;`
    btn.style.position = 'relative'
    btn.style.overflow = 'hidden'
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 700)
    onClick?.()
  }

  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25',
    secondary: 'bg-white/10 text-white border border-white/10 hover:bg-white/15',
    ghost: 'text-white/70 hover:bg-white/5 hover:text-white'
  }

  return (
    <button ref={btnRef} type={type} disabled={disabled} onClick={handleClick}
      className={`relative overflow-hidden transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...rest}>
      {children}
    </button>
  )
})

export default RippleButton
