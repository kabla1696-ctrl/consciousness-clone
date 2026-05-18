'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ICONS: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

const COLORS: Record<ToastType, string> = {
  success:
    'border-emerald-400/40 bg-emerald-500/15 text-emerald-200 shadow-emerald-500/20',
  error:
    'border-red-400/40 bg-red-500/15 text-red-200 shadow-red-500/20',
  info:
    'border-blue-400/40 bg-blue-500/15 text-blue-200 shadow-blue-500/20',
  warning:
    'border-amber-400/40 bg-amber-500/15 text-amber-200 shadow-amber-500/20',
}

const AUTO_DISMISS_MS = 3000

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null)

/* ------------------------------------------------------------------ */
/*  Single Toast Item                                                  */
/* ------------------------------------------------------------------ */

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(toast.id), 300) // match exit animation
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3
        rounded-xl border px-4 py-3
        backdrop-blur-xl shadow-lg
        ${COLORS[toast.type]}
        ${exiting
          ? 'animate-[toast-exit_300ms_ease-in_forwards]'
          : 'animate-[toast-enter_300ms_ease-out]'
        }
      `}
      role="alert"
    >
      <span className="text-lg shrink-0">{ICONS[toast.type]}</span>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setExiting(true)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        className="shrink-0 rounded-md p-1 hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((prev) => [...prev, { id, type, message }])
    },
    [],
  )

  const ctx: ToastContextValue = {
    success: (msg) => add('success', msg),
    error: (msg) => add('error', msg),
    info: (msg) => add('info', msg),
    warning: (msg) => add('warning', msg),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container — fixed top-right, stacked */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>

      {/* Keyframes injected once */}
      <style jsx global>{`
        @keyframes toast-enter {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toast-exit {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
