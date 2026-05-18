'use client'

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react'

interface SwipeActionsProps {
  children: ReactNode
  leftAction?: {
    icon: string
    label: string
    color?: string
  }
  rightAction?: {
    icon: string
    label: string
    color?: string
  }
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  className?: string
}

export default function SwipeActions({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  className = '',
}: SwipeActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentXRef = useRef(0)
  const isHorizontalRef = useRef<boolean | null>(null)

  const maxSwipe = 120

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    startXRef.current = touch.clientX
    startYRef.current = touch.clientY
    currentXRef.current = touch.clientX
    isHorizontalRef.current = null
    setIsSwiping(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startXRef.current
    const deltaY = touch.clientY - startYRef.current

    // Determine swipe direction on first significant move
    if (isHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        isHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY)
      }
      return
    }

    // If vertical, don't interfere with scrolling
    if (!isHorizontalRef.current) return

    e.preventDefault()
    currentXRef.current = touch.clientX

    // Apply rubber-band effect
    const rawOffset = deltaX
    const direction = rawOffset > 0 ? 1 : -1
    const absOffset = Math.abs(rawOffset)

    // Only allow swipe if action exists for that direction
    if (direction > 0 && !leftAction && !onSwipeRight) return
    if (direction < 0 && !rightAction && !onSwipeLeft) return

    // Rubber-band: diminishing returns past threshold
    const rubberBand = absOffset > threshold
      ? threshold + (absOffset - threshold) * 0.3
      : absOffset

    setOffset(direction * Math.min(rubberBand, maxSwipe))
  }, [isSwiping, threshold, leftAction, rightAction, onSwipeLeft, onSwipeRight])

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return
    setIsSwiping(false)

    const absOffset = Math.abs(offset)

    // Trigger action if past threshold
    if (absOffset >= threshold) {
      if (offset > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (offset < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Animate back with spring effect
    setOffset(0)
    isHorizontalRef.current = null
  }, [isSwiping, offset, threshold, onSwipeLeft, onSwipeRight])

  // Calculate action visibility
  const leftProgress = Math.min(Math.max(offset / threshold, 0), 1)
  const rightProgress = Math.min(Math.max(-offset / threshold, 0), 1)

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left action reveal */}
      {leftAction && (
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center w-24"
          style={{
            opacity: leftProgress,
            transform: `translateX(${-24 + leftProgress * 24}px)`,
          }}
        >
          <div
            className={`flex flex-col items-center gap-1 ${leftAction.color || 'text-emerald-400'}`}
          >
            <span className="text-xl">{leftAction.icon}</span>
            <span className="text-[10px] font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right action reveal */}
      {rightAction && (
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-center w-24"
          style={{
            opacity: rightProgress,
            transform: `translateX(${24 - rightProgress * 24}px)`,
          }}
        >
          <div
            className={`flex flex-col items-center gap-1 ${rightAction.color || 'text-red-400'}`}
          >
            <span className="text-xl">{rightAction.icon}</span>
            <span className="text-[10px] font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className="relative z-10 bg-[#050510]"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
