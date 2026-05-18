'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FEATURES } from '../lib/features-data'
import { useSound } from './SoundEffects'

interface CommandItem {
  id: string
  icon: string
  label: string
  description?: string
  category: string
  action: () => void
  href?: string
}

const RECENT_KEY = 'cmd-palette-recent'
const MAX_RECENT = 5

function getRecentCommands(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentCommand(id: string) {
  try {
    const recent = getRecentCommands().filter((r) => r !== id)
    recent.unshift(id)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {}
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentIds, setRecentIds] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { play } = useSound()

  // Load recent commands
  useEffect(() => {
    setRecentIds(getRecentCommands())
  }, [])

  // Build command list
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = []

    // Navigation commands from features
    FEATURES.forEach((f) => {
      items.push({
        id: `nav:${f.href}`,
        icon: f.icon,
        label: f.title,
        description: f.desc,
        category: 'Navigation',
        href: f.href,
        action: () => {
          router.push(f.href)
          saveRecentCommand(`nav:${f.href}`)
        },
      })
    })

    // App actions
    items.push({
      id: 'action:toggle-theme',
      icon: '🎨',
      label: 'Toggle Theme',
      description: 'Switch accent color',
      category: 'Actions',
      action: () => {
        const themes = ['violet', 'rose', 'emerald', 'amber', 'sky', 'fuchsia', 'orange', 'teal']
        const current = localStorage.getItem('cc_theme') || 'violet'
        const idx = themes.indexOf(current)
        const next = themes[(idx + 1) % themes.length]
        localStorage.setItem('cc_theme', next)
        window.dispatchEvent(new CustomEvent('theme-change', { detail: next }))
        saveRecentCommand('action:toggle-theme')
      },
    })

    items.push({
      id: 'action:toggle-sound',
      icon: '🔊',
      label: 'Toggle Sound',
      description: 'Mute or unmute sound effects',
      category: 'Actions',
      action: () => {
        const soundBtn = document.querySelector('[data-sound-toggle]') as HTMLButtonElement
        if (soundBtn) soundBtn.click()
        saveRecentCommand('action:toggle-sound')
      },
    })

    items.push({
      id: 'action:home',
      icon: '🏠',
      label: 'Go Home',
      description: 'Return to homepage',
      category: 'Actions',
      action: () => {
        router.push('/')
        saveRecentCommand('action:home')
      },
    })

    return items
  }, [router])

  // Filter commands
  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    )
  }, [query, commands])

  // Group by category
  const grouped = useMemo(() => {
    const groups: { category: string; items: CommandItem[] }[] = []
    const map = new Map<string, CommandItem[]>()

    // If no query, show recent commands first
    if (!query.trim() && recentIds.length > 0) {
      const recentItems = recentIds
        .map((id) => commands.find((c) => c.id === id))
        .filter(Boolean) as CommandItem[]
      if (recentItems.length > 0) {
        map.set('Recent', recentItems)
      }
    }

    filtered.forEach((item) => {
      const existing = map.get(item.category) || []
      existing.push(item)
      map.set(item.category, existing)
    })

    map.forEach((items, category) => {
      groups.push({ category, items })
    })
    return groups
  }, [filtered, query, recentIds, commands])

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    return grouped.flatMap((g) => g.items)
  }, [grouped])

  // Open/close handlers
  const doOpen = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelectedIndex(0)
    setRecentIds(getRecentCommands())
  }, [])

  const doClose = useCallback(() => {
    setOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  // Listen for toggle events from KeyboardShortcuts
  useEffect(() => {
    const handler = () => {
      if (open) doClose()
      else doOpen()
    }
    window.addEventListener('toggle-command-palette', handler)
    return () => window.removeEventListener('toggle-command-palette', handler)
  }, [open, doOpen, doClose])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (flatItems[selectedIndex]) {
            play.tap()
            flatItems[selectedIndex].action()
            doClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          doClose()
          break
      }
    },
    [flatItems, selectedIndex, play, doClose]
  )

  if (!open) return null

  let flatIndex = 0

  return (
    <div className="cmd-palette-overlay" onClick={doClose}>
      <div
        className="cmd-palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
      >
        {/* Search input */}
        <div className="cmd-palette-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search features, pages, actions..."
            className="cmd-palette-input"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmd-palette-kbd">ESC</kbd>
        </div>

        {/* Results */}
        <div className="cmd-palette-results" ref={listRef}>
          {grouped.length === 0 ? (
            <div className="cmd-palette-empty">
              <span style={{ fontSize: 24 }}>🔍</span>
              <span>No results found</span>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.category} className="cmd-palette-group">
                <div className="cmd-palette-group-label">{group.category}</div>
                {group.items.map((item) => {
                  const idx = flatIndex++
                  const isSelected = idx === selectedIndex
                  return (
                    <div
                      key={item.id}
                      className={`cmd-palette-item${isSelected ? ' selected' : ''}`}
                      data-selected={isSelected}
                      onClick={() => {
                        play.tap()
                        item.action()
                        doClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <span className="cmd-palette-item-icon">{item.icon}</span>
                      <div className="cmd-palette-item-text">
                        <span className="cmd-palette-item-label">{item.label}</span>
                        {item.description && (
                          <span className="cmd-palette-item-desc">{item.description}</span>
                        )}
                      </div>
                      {item.category === 'Navigation' && (
                        <span className="cmd-palette-item-hint">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cmd-palette-footer">
          <div className="cmd-palette-footer-hints">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span className="cmd-palette-footer-label">{flatItems.length} results</span>
        </div>
      </div>
    </div>
  )
}
