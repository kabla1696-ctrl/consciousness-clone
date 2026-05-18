'use client'

import { useState, useEffect, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DISMISS_KEY = 'pwa-install-dismissed'
const SHOW_DELAY_MS = 30_000 // 30 seconds

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  /* Capture the beforeinstallprompt event --------------------------- */
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show after delay
      setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  /* Inject keyframes once ------------------------------------------ */
  useEffect(() => {
    if (document.getElementById('pwa-keyframes')) return
    const style = document.createElement('style')
    style.id = 'pwa-keyframes'
    style.textContent = `
      @keyframes pwa-slide-up {
        from { opacity: 0; transform: translate(-50%, 100%) scale(0.95); }
        to   { opacity: 1; transform: translate(-50%, 0) scale(1); }
      }
    `
    document.head.appendChild(style)
  }, [])

  /* Hide if already installed --------------------------------------- */
  useEffect(() => {
    const handler = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  /* Actions ---------------------------------------------------------- */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'dismissed') {
        localStorage.setItem(DISMISS_KEY, 'true')
      }
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
      setInstalling(false)
    }
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }, [])

  /* Don't render anything when hidden -------------------------------- */
  if (!visible) return null

  /* Render ----------------------------------------------------------- */
  return (
    <div
      className="fixed bottom-6 left-1/2 z-[9998] w-[calc(100%-2rem)] max-w-md"
      style={{ animation: 'pwa-slide-up 500ms cubic-bezier(0.16,1,0.3,1)', transform: 'translateX(-50%)' }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 backdrop-blur-xl shadow-2xl shadow-purple-500/20 p-5">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="flex items-start gap-4">
          {/* Brain emoji icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl shadow-lg shadow-purple-500/30">
            🧠
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white">
              Install Consciousness Clone
            </h3>
            <p className="mt-0.5 text-sm text-purple-200/70">
              Get the full app experience
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1.5 text-purple-300/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-wait"
          >
            {installing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Installing…
              </span>
            ) : (
              'Install'
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-purple-200/80 hover:bg-white/10 hover:text-white active:scale-[0.98] transition-all duration-200"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
