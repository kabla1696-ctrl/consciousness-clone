'use client'

import { useCallback, useState, useEffect } from 'react'
import { useToast } from './Toast'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  /** Extra CSS classes */
  className?: string
  /** Button label — defaults to icon-only */
  label?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ShareButton({
  title = 'Consciousness Clone',
  text = 'Check out Consciousness Clone — your digital consciousness, living forever.',
  url,
  className = '',
  label,
}: ShareButtonProps) {
  const toast = useToast()
  const [canShare, setCanShare] = useState(false)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleShare = useCallback(async () => {
    if (sharing) return
    setSharing(true)

    const shareUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '')

    try {
      if (canShare) {
        await navigator.share({ title, text, url: shareUrl })
        toast.success('Shared successfully!')
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
      }
    } catch (err: unknown) {
      // User cancelled share — not an error
      if (err instanceof Error && err.name === 'AbortError') return
      // Clipboard fallback can also fail; try legacy
      try {
        legacyCopy(shareUrl)
        toast.success('Link copied to clipboard!')
      } catch {
        toast.error('Could not share. Try copying the URL manually.')
      }
    } finally {
      setSharing(false)
    }
  }, [canShare, sharing, title, text, url, toast])

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className={`
        inline-flex items-center gap-2 rounded-xl
        border border-white/10 bg-white/5 backdrop-blur-sm
        px-4 py-2.5 text-sm font-medium text-purple-200/80
        hover:bg-white/10 hover:text-white hover:border-purple-400/30
        active:scale-[0.97] transition-all duration-200
        disabled:opacity-50 disabled:cursor-wait
        ${className}
      `}
      aria-label="Share"
    >
      {/* Share / clipboard icon */}
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {canShare ? (
          // Share icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        ) : (
          // Clipboard icon
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
          />
        )}
      </svg>
      {label && <span>{label}</span>}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Legacy clipboard copy for older browsers / non-HTTPS contexts */
function legacyCopy(text: string) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('execCommand copy failed')
}
