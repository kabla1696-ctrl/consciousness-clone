'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  snapPoints?: number[]
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [25, 50, 90],
}: BottomSheetProps) {
  const [snapIndex, setSnapIndex] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentHeight = useRef(0)

  const snapHeight = snapPoints[snapIndex] ?? snapPoints[1] ?? 50

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Keyboard support — Escape to close
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    const sheet = sheetRef.current
    if (sheet) {
      currentHeight.current = sheet.getBoundingClientRect().height
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const deltaY = startY.current - e.touches[0].clientY
      setDragOffset(deltaY)
    },
    [isDragging]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    const sheet = sheetRef.current
    if (!sheet) return

    const viewportHeight = window.innerHeight
    const newHeightPx = currentHeight.current + dragOffset
    const newHeightPercent = (newHeightPx / viewportHeight) * 100

    // Find the closest snap point
    let closestIndex = snapIndex
    let closestDist = Infinity
    snapPoints.forEach((sp, i) => {
      const dist = Math.abs(newHeightPercent - sp)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    })

    // If dragged down past the smallest snap point, close
    if (newHeightPercent < (snapPoints[0] ?? 25) / 2) {
      onClose()
    } else {
      setSnapIndex(closestIndex)
    }

    setDragOffset(0)
  }, [isDragging, dragOffset, snapIndex, snapPoints, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  const handleBarClick = useCallback(() => {
    // Cycle through snap points on tap
    setSnapIndex((prev) => (prev + 1) % snapPoints.length)
  }, [snapPoints.length])

  if (!isOpen) return null

  const heightPercent = isDragging
    ? Math.max(10, snapHeight + (dragOffset / window.innerHeight) * 100)
    : snapHeight

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={handleBackdropClick}
      style={{
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        ref={sheetRef}
        className="w-full bg-[#0a0a1a] rounded-t-2xl border-t border-white/[0.06] flex flex-col"
        style={{
          height: `${heightPercent}vh`,
          transition: isDragging ? 'none' : 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isOpen && !isDragging ? 'slideUp 0.3s ease-out' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing shrink-0"
          onClick={handleBarClick}
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {children}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
