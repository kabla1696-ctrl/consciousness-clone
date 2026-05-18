'use client'

import { useEffect, useRef, ReactNode } from 'react'

type Direction = 'up' | 'down' | 'left' | 'right'

interface PageTransitionProps {
  children: ReactNode
  direction?: Direction
  delay?: number   // ms
  duration?: number // ms
  className?: string
}

const ORIGIN: Record<Direction, string> = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
}

export default function PageTransition({
  children,
  direction = 'up',
  delay = 0,
  duration = 600,
  className = '',
}: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger reveal
          setTimeout(() => {
            el.style.transition = `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`
            el.style.opacity = '1'
            el.style.transform = 'translate(0, 0)'
          }, 0)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )

    // Set initial hidden state
    el.style.opacity = '0'
    el.style.transform =
      direction === 'up'
        ? 'translateY(2rem)'
        : direction === 'down'
          ? 'translateY(-2rem)'
          : direction === 'left'
            ? 'translateX(2rem)'
            : 'translateX(-2rem)'

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
