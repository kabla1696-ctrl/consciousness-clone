'use client'

import React, { useState, useCallback } from 'react'

interface FABAction {
  icon: string
  label: string
  onClick: () => void
  color?: string
}

const DEFAULT_ACTIONS: FABAction[] = [
  { icon: '🧠', label: 'New Memory', onClick: () => {} },
  { icon: '💬', label: 'Start Chat', onClick: () => {} },
  { icon: '😊', label: 'Log Mood', onClick: () => {} },
  { icon: '📝', label: 'Quick Note', onClick: () => {} },
]

interface FloatingActionButtonProps {
  actions?: FABAction[]
}

const FloatingActionButton = React.memo(function FloatingActionButton({
  actions = DEFAULT_ACTIONS,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleAction = useCallback(
    (action: FABAction) => {
      action.onClick()
      setIsOpen(false)
    },
    []
  )

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
          style={{ animation: 'fabFadeIn 0.2s ease-out' }}
        />
      )}

      {/* Action items */}
      <div className="fixed bottom-[88px] right-4 z-[96] flex flex-col-reverse items-end gap-3 md:hidden">
        {actions.map((action, i) => (
          <div
            key={action.label}
            className="flex items-center gap-3"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen
                ? 'translateY(0) scale(1)'
                : 'translateY(20px) scale(0.5)',
              transition: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1) ${
                isOpen ? i * 0.05 : (actions.length - 1 - i) * 0.03
              }s`,
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
          >
            {/* Label pill */}
            <span className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/[0.08] text-xs font-medium text-white/80 shadow-lg whitespace-nowrap">
              {action.label}
            </span>

            {/* Action button */}
            <button
              onClick={() => handleAction(action)}
              className="w-12 h-12 rounded-full bg-[#1a1a2e] border border-white/[0.08] flex items-center justify-center text-lg shadow-lg active:scale-90 transition-transform tap-feedback"
              aria-label={action.label}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={toggle}
        className="fixed bottom-[88px] right-4 z-[97] w-14 h-14 rounded-full shadow-xl flex items-center justify-center md:hidden transition-all duration-300 active:scale-90 tap-feedback"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        aria-label={isOpen ? 'Close menu' : 'Quick actions'}
      >
        <span className="text-xl text-white">+</span>
      </button>

      <style jsx global>{`
        @keyframes fabFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
})

export default FloatingActionButton
