'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FEATURES } from '../lib/features-data'

const RECENT_SEARCHES_KEY = 'cc_recent_searches'
const MAX_RECENT = 5

export default function SearchSuggestions({
  value,
  onChange,
  placeholder = 'Search features...',
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  const router = useRouter()
  const [focused, setFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'))
    } catch { /* ignore */ }
  }, [])

  const suggestions = useMemo(() => {
    if (!value.trim()) return []
    const q = value.toLowerCase()
    return FEATURES
      .filter(f => f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q))
      .slice(0, 6)
  }, [value])

  const showDropdown = focused && (value.trim().length > 0 || recentSearches.length > 0)
  const items = value.trim()
    ? suggestions.map(s => ({ label: s.title, sublabel: s.desc, href: s.href, icon: s.icon }))
    : recentSearches.map(r => ({ label: r, sublabel: 'Recent search', href: `/dashboard?search=${encodeURIComponent(r)}`, icon: '🔍' }))

  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return
    try {
      const existing: string[] = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
      const updated = [query, ...existing.filter(r => r !== query)].slice(0, MAX_RECENT)
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      setRecentSearches(updated)
    } catch { /* ignore */ }
  }, [])

  const handleSelect = useCallback((item: typeof items[0]) => {
    if (value.trim()) saveRecentSearch(value.trim())
    onChange('')
    setFocused(false)
    setSelectedIndex(-1)
    router.push(item.href)
  }, [value, onChange, router, saveRecentSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown || items.length === 0) {
      if (e.key === 'Enter' && value.trim()) {
        saveRecentSearch(value.trim())
        // Filter features on current page
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? items.length - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSelect(items[selectedIndex])
        } else if (items.length > 0) {
          handleSelect(items[0])
        }
        break
      case 'Escape':
        setFocused(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }, [showDropdown, items, selectedIndex, handleSelect, value, saveRecentSearch])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [value])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[selectedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div className="relative group">
      {/* Gradient border on focus */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => { onChange(e.target.value); setSelectedIndex(-1) }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-3 rounded-xl glass-strong text-sm text-white/90 placeholder-white/20 outline-none focus:ring-1 focus:ring-violet-500/40 transition-all bg-white/[0.02]"
        />
        {value && (
          <button
            onClick={() => { onChange(''); setSelectedIndex(-1); inputRef.current?.focus() }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && items.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-[#0a0a1a]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-72 overflow-y-auto"
        >
          {!value.trim() && recentSearches.length > 0 && (
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/20 border-b border-white/[0.04]">
              Recent Searches
            </div>
          )}
          {items.map((item, i) => (
            <button
              key={`${item.href}-${i}`}
              onMouseDown={e => e.preventDefault()}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                i === selectedIndex
                  ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 text-white'
                  : 'text-white/60 hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${i === selectedIndex ? 'text-white font-medium' : 'text-white/70'}`}>
                  {item.label}
                </p>
                {item.sublabel && (
                  <p className="text-[10px] text-white/25 truncate mt-0.5">{item.sublabel}</p>
                )}
              </div>
              {i === selectedIndex && (
                <span className="text-[9px] text-violet-400/60 font-mono shrink-0">↵</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
