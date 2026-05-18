'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  searchAll,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  TRENDING_SEARCHES,
  type GroupedResults,
  type SearchResult,
} from '@/lib/search-engine'

const GROUP_LABELS: Record<keyof GroupedResults, { label: string; icon: string }> = {
  features: { label: 'Features', icon: '✨' },
  memories: { label: 'Memories', icon: '📝' },
  chats: { label: 'Chats', icon: '💬' },
  settings: { label: 'Settings', icon: '⚙️' },
  navigation: { label: 'Navigation', icon: '🧭' },
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GroupedResults | null>(null)
  const [recent, setRecent] = useState<string[]>([])
  const [flatResults, setFlatResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setActiveIndex(-1)
      setRecent(getRecentSearches())
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Flatten results for keyboard nav
  useEffect(() => {
    if (!results) {
      setFlatResults([])
      return
    }
    const flat: SearchResult[] = []
    for (const key of ['features', 'memories', 'chats', 'settings', 'navigation'] as const) {
      flat.push(...results[key])
    }
    setFlatResults(flat)
    setActiveIndex(-1)
  }, [results])

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    if (!q.trim()) {
      setResults(null)
      return
    }
    setResults(searchAll(q))
  }, [])

  const navigate = useCallback((result: SearchResult) => {
    saveRecentSearch(query)
    router.push(result.href)
    onClose()
  }, [query, router, onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (!flatResults.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + flatResults.length) % flatResults.length)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      navigate(flatResults[activeIndex])
    }
  }

  const handleRecentClick = (term: string) => {
    setQuery(term)
    handleSearch(term)
  }

  if (!open) return null

  const hasResults = results && flatResults.length > 0
  const showEmpty = query.trim() && !hasResults

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Search Panel */}
      <div
        className="relative w-full max-w-[600px] mx-4 mt-[10vh] md:mt-[12vh] bg-[#12122a]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden animate-slide-down"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <span className="text-lg text-white/30">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search features, memories, chats…"
            className="flex-1 bg-transparent text-white text-base outline-none placeholder:text-white/20"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] text-white/20 border border-white/[0.06]">ESC</kbd>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
          {/* Recent & Trending (when empty) */}
          {!query.trim() && (
            <div className="space-y-4 p-2">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25">Recent</span>
                    <button
                      onClick={() => { clearRecentSearches(); setRecent([]) }}
                      className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 px-2">
                    {recent.map(term => (
                      <button
                        key={term}
                        onClick={() => handleRecentClick(term)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 text-sm transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25 px-2">Trending</span>
                <div className="flex flex-wrap gap-2 px-2 mt-2">
                  {TRENDING_SEARCHES.map(term => (
                    <button
                      key={term}
                      onClick={() => handleRecentClick(term)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 text-sm transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="space-y-1">
              {(Object.keys(GROUP_LABELS) as (keyof GroupedResults)[]).map(groupKey => {
                const items = results[groupKey]
                if (!items.length) return null
                const { label, icon } = GROUP_LABELS[groupKey]
                return (
                  <div key={groupKey}>
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-xs">{icon}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25">{label}</span>
                      <span className="text-[11px] text-white/15 ml-auto">{items.length}</span>
                    </div>
                    {items.map(item => {
                      const idx = flatResults.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigate(item)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                            idx === activeIndex
                              ? 'bg-violet-500/15 text-white'
                              : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-xs text-white/30 truncate mt-0.5">{item.subtitle}</div>
                            )}
                          </div>
                          {item.type === 'feature' && item.color && (
                            <div className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${item.color} opacity-40`} />
                          )}
                          <span className="text-white/10 text-xs">↵</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {/* No results */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-white/20">
              <span className="text-3xl mb-3">🔍</span>
              <span className="text-sm">No results for &ldquo;{query}&rdquo;</span>
              <span className="text-xs mt-1 text-white/10">Try a different search term</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/[0.06] text-[10px] text-white/15">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06]">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06]">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/[0.06]">esc</kbd> close</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px) scale(0.97) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out }
        .animate-slide-down { animation: slide-down 0.25s ease-out }
      `}</style>
    </div>
  )
}
