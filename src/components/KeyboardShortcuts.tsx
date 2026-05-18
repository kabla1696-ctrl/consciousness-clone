'use client'

import { useState, useEffect, useCallback } from 'react'

const SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Open command palette', mac: true },
  { keys: ['Ctrl', 'K'], description: 'Open command palette', mac: false },
  { keys: ['⌘', '/'], description: 'Show keyboard shortcuts', mac: true },
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', mac: false },
  { keys: ['⌘', 'B'], description: 'Toggle sidebar', mac: true },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', mac: false },
  { keys: ['ESC'], description: 'Close modals / palette', mac: true },
  { keys: ['?'], description: 'Show shortcuts (when no input focused)', mac: true },
]

export default function KeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  const doClose = useCallback(() => setShowHelp(false), [])

  // Global keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const mod = isMac ? e.metaKey : e.ctrlKey

      // Cmd/Ctrl + K → Command palette
      if (mod && e.key === 'k') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('toggle-command-palette'))
        return
      }

      // Cmd/Ctrl + / → Show shortcuts help
      if (mod && e.key === '/') {
        e.preventDefault()
        setShowHelp((prev) => !prev)
        return
      }

      // Cmd/Ctrl + B → Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('toggle-sidebar'))
        return
      }

      // Escape → Close modals
      if (e.key === 'Escape') {
        // Close command palette if open
        window.dispatchEvent(new CustomEvent('close-command-palette'))
        setShowHelp(false)
        return
      }

      // ? → Show shortcuts (only when no input is focused)
      if (e.key === '?' && !isInput && !mod) {
        e.preventDefault()
        setShowHelp((prev) => !prev)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMac])

  // Listen for close events
  useEffect(() => {
    const handler = () => doClose()
    window.addEventListener('close-shortcuts-help', handler)
    return () => window.removeEventListener('close-shortcuts-help', handler)
  }, [doClose])

  if (!showHelp) return null

  return (
    <div className="shortcuts-overlay" onClick={doClose}>
      <div
        className="shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
        aria-modal="true"
      >
        <div className="shortcuts-header">
          <div className="shortcuts-title">
            <span style={{ fontSize: 20 }}>⌨️</span>
            <span>Keyboard Shortcuts</span>
          </div>
          <button className="shortcuts-close" onClick={doClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="shortcuts-list">
          {SHORTCUTS.filter((s) => s.mac === isMac || s.keys[0] === 'ESC' || s.keys[0] === '?').map(
            (shortcut, i) => (
              <div key={i} className="shortcuts-item">
                <span className="shortcuts-desc">{shortcut.description}</span>
                <div className="shortcuts-keys">
                  {shortcut.keys.map((key, ki) => (
                    <kbd key={ki} className="shortcuts-key">
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div className="shortcuts-footer">
          <span>Press <kbd className="shortcuts-key" style={{ fontSize: 11 }}>ESC</kbd> or <kbd className="shortcuts-key" style={{ fontSize: 11 }}>?</kbd> to close</span>
        </div>
      </div>
    </div>
  )
}
