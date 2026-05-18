'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { FEATURES, Feature } from '../lib/features-data'

const STORAGE_KEY = 'cc_favorites'
const MAX_FAVORITES = 6

// Category color map for badges
const CATEGORY_COLORS: Record<string, string> = {
  Core: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Memory: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Social: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  Creative: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
  Wellness: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Legacy: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Fun: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  Advanced: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
}

function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
  } catch { /* ignore */ }
}

function getFavoriteFeatures(favHrefs: string[]): Feature[] {
  return favHrefs
    .map((href) => FEATURES.find((f) => f.href === href))
    .filter(Boolean) as Feature[]
}

export default function FavoriteFeatures() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const dragItemRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const toggleFavorite = useCallback((href: string) => {
    setFavorites((prev) => {
      let next: string[]
      if (prev.includes(href)) {
        next = prev.filter((h) => h !== href)
      } else if (prev.length < MAX_FAVORITES) {
        next = [...prev, href]
      } else {
        return prev // max reached
      }
      saveFavorites(next)
      return next
    })
  }, [])

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
    // Make the drag image semi-transparent
    const target = e.currentTarget as HTMLDivElement
    dragItemRef.current = target
    setTimeout(() => {
      target.style.opacity = '0.4'
    }, 0)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropIndex(index)
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLDivElement
    target.style.opacity = '1'
    setIsDragging(false)
    setDragIndex(null)
    setDropIndex(null)
    dragItemRef.current = null
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (isNaN(fromIdx) || fromIdx === dropIdx) {
      setIsDragging(false)
      setDragIndex(null)
      setDropIndex(null)
      return
    }

    setFavorites((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(dropIdx, 0, moved)
      saveFavorites(next)
      return next
    })

    setIsDragging(false)
    setDragIndex(null)
    setDropIndex(null)
  }, [])

  const favoriteFeatures = getFavoriteFeatures(favorites)

  // Show empty state if no favorites and not editing
  if (favorites.length === 0 && !isEditing) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25">
            ❤️ Favorites
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10"
          >
            + Add
          </button>
        </div>
        <div className="rounded-2xl border border-dashed border-white/[0.06] p-6 text-center">
          <p className="text-white/20 text-xs">Pin your favorite features here</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-violet-400/60 text-xs mt-2 hover:text-violet-400 transition-colors"
          >
            Select favorites →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25">
          ❤️ Favorites
          {favorites.length > 0 && (
            <span className="ml-1.5 text-white/15">({favorites.length}/{MAX_FAVORITES})</span>
          )}
        </h2>
        <button
          onClick={() => setIsEditing((e) => !e)}
          className="text-[10px] text-violet-400/60 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg hover:bg-violet-500/10"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      {/* Favorites grid */}
      {favoriteFeatures.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          {favoriteFeatures.map((f, index) => (
            <div
              key={f.href}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group transition-all duration-200 ${
                isDragging && dragIndex === index ? 'scale-95 opacity-50' : ''
              } ${isDragging && dropIndex === index ? 'scale-105 ring-2 ring-violet-500/30 rounded-xl' : ''}`}
            >
              <Link href={isEditing ? '#' : f.href} className="block tap-feedback" onClick={(e) => { if (isEditing) e.preventDefault() }}>
                <div
                  className="relative overflow-hidden rounded-xl p-3 text-center transition-all duration-300 hover:scale-[1.04] bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12]"
                  style={{ borderTopColor: f.glow.replace('0.15', '0.3').replace('0.12', '0.3') }}
                >
                  {/* Gradient accent */}
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.color} opacity-40`} />

                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="text-[10px] font-medium text-white/60 leading-tight truncate">{f.title}</p>

                  {/* Drag handle (visible in edit mode) */}
                  {isEditing && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                    </div>
                  )}

                  {/* Remove button */}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(f.href)
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Edit mode: show all features to add */}
      {isEditing && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-3 max-h-[280px] overflow-y-auto scrollbar-hide">
          <p className="text-[10px] text-white/25 mb-3 px-1">
            Tap to add/remove • Drag favorites to reorder • Max {MAX_FAVORITES}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {FEATURES.map((f) => {
              const isFav = favorites.includes(f.href)
              const atMax = favorites.length >= MAX_FAVORITES && !isFav
              return (
                <button
                  key={f.href}
                  onClick={() => !atMax && toggleFavorite(f.href)}
                  disabled={atMax}
                  className={`relative p-2 rounded-lg text-center transition-all duration-200 ${
                    isFav
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : atMax
                        ? 'bg-white/[0.01] border border-white/[0.03] opacity-30 cursor-not-allowed'
                        : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]'
                  }`}
                >
                  <div className="text-lg">{f.icon}</div>
                  <p className="text-[9px] text-white/40 truncate mt-0.5">{f.title}</p>
                  {isFav && (
                    <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-violet-500 flex items-center justify-center">
                      <span className="text-[7px] text-white">✓</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Export helper for use in other components
export { getFavorites, toggleFavorite as toggleFavoriteHelper }

function toggleFavorite(href: string) {
  const current = getFavorites()
  let next: string[]
  if (current.includes(href)) {
    next = current.filter((h) => h !== href)
  } else if (current.length < MAX_FAVORITES) {
    next = [...current, href]
  } else {
    return current
  }
  saveFavorites(next)
  return next
}
