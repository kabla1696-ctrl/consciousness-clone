'use client'

import React, { useEffect, useRef, useCallback } from 'react'

interface Action {
  label: string
  icon?: string
  color?: string
  destructive?: boolean
  onClick: () => void
}

interface BottomActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  actions: Action[]
}

export default function BottomActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: BottomActionSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const [dragOffset, setDragOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

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

  // Escape to close
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
    startYRef.current = e.touches[0].clientY
    setDragOffset(0)
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const deltaY = e.touches[0].clientY - startYRef.current
      setDragOffset(Math.max(0, deltaY))
    },
    [isDragging]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset > 80) {
      onClose()
    }
    setDragOffset(0)
  }, [isDragging, dragOffset, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-end justify-center"
      onClick={handleBackdropClick}
      style={{ animation: 'basFadeIn 0.2s ease-out' }}
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg bg-[#0a0a1a] rounded-t-2xl border-t border-white/[0.06] overflow-hidden"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation:
            isOpen && !isDragging ? 'basSlideUp 0.3s ease-out' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-5 pt-2 pb-3">
            <h3 className="text-sm font-semibold text-white/50 text-center uppercase tracking-wider">
              {title}
            </h3>
          </div>
        )}

        {/* Actions */}
        <div className="px-3 pb-2 space-y-0.5">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick()
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-colors tap-feedback ${
                action.destructive
                  ? 'text-red-400 hover:bg-red-500/10 active:bg-red-500/20'
                  : 'text-white hover:bg-white/[0.06] active:bg-white/[0.1]'
              }`}
            >
              {action.icon && (
                <span className="text-lg w-6 text-center">{action.icon}</span>
              )}
              <span
                className={`text-[15px] font-medium ${
                  action.destructive ? 'text-red-400' : action.color || ''
                }`}
              >
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <div className="px-3 pb-4 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-white/[0.08] text-white font-semibold text-[15px] tap-feedback active:bg-white/[0.12] transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Safe area padding */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>

      <style jsx global>{`
        @keyframes basFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes basSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}


