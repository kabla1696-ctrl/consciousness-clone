'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const el = containerRef.current
      if (el && el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    },
    [refreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling.current || refreshing) return
      const deltaY = e.touches[0].clientY - startY.current
      if (deltaY > 0) {
        // Resistance effect: diminishing returns as you pull further
        const resistance = 0.4
        const distance = Math.min(deltaY * resistance, threshold * 1.5)
        setPullDistance(distance)
        // Prevent native scroll while pulling
        if (distance > 5) {
          e.preventDefault()
        }
      }
    },
    [refreshing, threshold]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return
    pulling.current = false

    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      setPullDistance(threshold * 0.6)
      try {
        await onRefresh()
      } catch {}
      setRefreshing(false)
    }
    setPullDistance(0)
  }, [pullDistance, threshold, refreshing, onRefresh])

  const spinnerRotation = refreshing ? 'animate-spin' : ''
  const showSpinner = pullDistance > 20 || refreshing

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all"
        style={{
          height: showSpinner ? pullDistance : 0,
          opacity: Math.min(pullDistance / threshold, 1),
          transition: pulling.current ? 'none' : 'height 0.3s ease, opacity 0.3s ease',
        }}
      >
        <svg
          className={`h-6 w-6 text-purple-400 ${spinnerRotation}`}
          style={
            !refreshing
              ? { transform: `rotate(${(pullDistance / threshold) * 360}deg)` }
              : undefined
          }
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        {refreshing && (
          <span className="ml-2 text-sm text-purple-400">Refreshing…</span>
        )}
      </div>

      {children}
    </div>
  )
}
