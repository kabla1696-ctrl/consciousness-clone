'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface MemoryLocation {
  id: string
  memory_id: string
  latitude: number
  longitude: number
  place_name: string
  created_at: string
  memory?: {
    content: string
    category: string
  }
}

interface NominatimResult { display_name: string; lat: string; lon: string; [key: string]: unknown }
interface GroupedMemories {
  [place: string]: MemoryLocation[]
}

export default function MemoryMap() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [locations, setLocations] = useState<MemoryLocation[]>([])
  const [groupedLocations, setGroupedLocations] = useState<GroupedMemories>({})
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<NominatimResult | null>(null)
  const [memoryContent, setMemoryContent] = useState('')
  const [memoryCategory, setMemoryCategory] = useState('places')
  const [saving, setSaving] = useState(false)
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)
  const [memories, setMemories] = useState<Record<string, unknown>[]>([])

  const CATEGORIES = [
    { value: 'places', label: 'Places', icon: '📍' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'food', label: 'Food', icon: '🍜' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'nature', label: 'Nature', icon: '🌿' },
    { value: 'events', label: 'Events', icon: '🎉' },
  ]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadData(user.id)
    }
    init()
  }, [])

  const loadData = async (userId: string) => {
    const [locResult, memResult] = await Promise.all([
      supabase
        .from('memory_locations')
        .select('id, place_name, memory_id, latitude, longitude, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('memories')
        .select('id, content, category')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (locResult.data) {
      setLocations(locResult.data)

      const grouped: GroupedMemories = {}
      locResult.data.forEach(loc => {
        if (!grouped[loc.place_name]) grouped[loc.place_name] = []
        grouped[loc.place_name].push({
          ...loc,
          memory: memResult.data?.find(m => m.id === loc.memory_id),
        })
      })
      setGroupedLocations(grouped)
    }

    if (memResult.data) setMemories(memResult.data)
  }

  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'User-Agent': 'ConsciousnessClone/1.0' } }
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error('Search error:', err)
    }
    setSearching(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchLocation(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const selectPlace = (place: NominatimResult) => {
    setSelectedPlace(place)
    setSearchQuery(place.display_name.split(',')[0])
    setSearchResults([])
  }

  const saveMemoryLocation = async () => {
    if (!selectedPlace || !memoryContent.trim() || !user) return
    setSaving(true)

    try {
      const { data: memData, error: memError } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          content: memoryContent.trim(),
          category: memoryCategory,
        })
        .select()
        .single()

      if (memError) throw memError

      await supabase.from('memory_locations').insert({
        user_id: user.id,
        memory_id: memData.id,
        latitude: parseFloat(selectedPlace.lat),
        longitude: parseFloat(selectedPlace.lon),
        place_name: selectedPlace.display_name.split(',')[0],
      })

      loadData(user.id)
      setShowAdd(false)
      setSearchQuery('')
      setSelectedPlace(null)
      setMemoryContent('')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save. Try again!')
    }

    setSaving(false)
  }

  const deleteLocation = async (id: string) => {
    if (!confirm('Remove this memory from the map?')) return
    await supabase.from('memory_locations').delete().eq('id', id)
    if (user) loadData(user.id)
  }

  const placeNames = Object.keys(groupedLocations)

  if (!user) {
    return (
      <main className="min-h-screen bg-[#06060f] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-fuchsia-500/20 border-b-fuchsia-400/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#06060f] page-transition relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#06060f]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-5 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1.5 rounded-lg hover:bg-white/[0.04] transition">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 backdrop-blur-sm border border-violet-400/20 flex items-center justify-center shadow-lg shadow-violet-500/10">
            <span className="text-sm">🗺️</span>
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{t('memory map')}</h1>
            <p className="text-[10px] text-white/30">{t('where memories')}</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-400/20 backdrop-blur-sm flex items-center justify-center tap-feedback hover:from-violet-500/30 hover:to-fuchsia-500/20 transition-all shadow-lg shadow-violet-500/10"
          >
            <svg className="w-4 h-4 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/10 to-transparent animate-pulse" />
          </button>
        </div>
      </header>

      <div className="relative px-5 py-6 pb-24 max-w-lg mx-auto">
        {/* Add Memory Form */}
        {showAdd && (
          <div className="relative mb-6">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-violet-500/10 blur-sm" />
            <div className="relative rounded-2xl border border-violet-400/15 bg-[#0d0d1f]/80 backdrop-blur-xl p-5">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">📍</span>
                Add Memory to Place
              </h3>

              {/* Location Search */}
              <div className="mb-4">
                <label className="text-white/30 text-[11px] mb-2 block font-medium uppercase tracking-wider">Search Location</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      setSelectedPlace(null)
                    }}
                    placeholder={t('search place')}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all text-white placeholder:text-white/15 text-sm backdrop-blur-sm"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !selectedPlace && (
                  <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#0a0a1a]/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        onClick={() => selectPlace(result)}
                        className="w-full px-4 py-3 text-left tap-feedback border-b border-white/[0.03] last:border-0 hover:bg-violet-500/[0.06] transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-violet-400 mt-0.5 text-xs">📍</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 truncate">
                              {result.display_name.split(',')[0]}
                            </p>
                            <p className="text-[10px] text-white/25 truncate mt-0.5">
                              {result.display_name.split(',').slice(1, 3).join(',')}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Place */}
                {selectedPlace && (
                  <div className="mt-2 px-3 py-2.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-400/20 flex items-center gap-2 backdrop-blur-sm">
                    <span className="text-emerald-400 text-xs">✓</span>
                    <span className="text-emerald-300/90 text-sm truncate flex-1">{selectedPlace.display_name.split(',')[0]}</span>
                    <button
                      onClick={() => { setSelectedPlace(null); setSearchQuery('') }}
                      className="text-white/20 hover:text-white/50 transition ml-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="text-white/30 text-[11px] mb-2 block font-medium uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setMemoryCategory(cat.value)}
                      className={`relative p-2.5 rounded-xl border text-center tap-feedback transition-all ${
                        memoryCategory === cat.value
                          ? 'border-violet-400/30 bg-violet-500/[0.12] shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                          : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="text-lg">{cat.icon}</div>
                      <div className={`text-[10px] mt-0.5 ${memoryCategory === cat.value ? 'text-violet-300' : 'text-white/30'}`}>{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Content */}
              <div className="mb-4">
                <label className="text-white/30 text-[11px] mb-2 block font-medium uppercase tracking-wider">Memory</label>
                <textarea
                  value={memoryContent}
                  onChange={e => setMemoryContent(e.target.value)}
                  placeholder={t('memory map description')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all text-white placeholder:text-white/15 text-sm resize-none backdrop-blur-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowAdd(false); setSelectedPlace(null); setSearchQuery(''); setMemoryContent('') }}
                  className="flex-1 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 font-medium tap-feedback hover:bg-white/[0.05] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMemoryLocation}
                  disabled={!selectedPlace || !memoryContent.trim() || saving}
                  className="relative flex-1 py-3 rounded-xl font-medium tap-feedback disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 hover:opacity-100 transition-opacity" />
                  <span className="relative text-white flex items-center gap-2">
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>📌 Save</>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { value: placeNames.length, label: 'Places', color: 'violet' },
            { value: locations.length, label: 'Memories', color: 'fuchsia' },
          ].map((stat) => (
            <div key={stat.label} className="group relative">
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${stat.color === 'violet' ? 'from-violet-500/20 to-violet-500/5' : 'from-fuchsia-500/20 to-fuchsia-500/5'} opacity-0 group-hover:opacity-100 blur-sm transition-opacity`} />
              <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm p-4">
                <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${stat.color === 'violet' ? 'from-transparent via-violet-400/20 to-transparent' : 'from-transparent via-fuchsia-400/20 to-transparent'}`} />
                <div className={`text-2xl font-bold ${stat.color === 'violet' ? 'text-violet-400' : 'text-fuchsia-400'} drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]`}>
                  {stat.value}
                </div>
                <div className="text-white/25 text-xs mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Place Cards */}
        <div>
          <h2 className="text-base font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('locations')}</h2>

          {placeNames.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl" />
                <div className="relative text-5xl">🗺️</div>
              </div>
              <p className="text-white/40 text-sm font-medium">No places yet</p>
              <p className="text-white/15 text-xs mt-1.5">{t('explore')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {placeNames.map(place => {
                const placeLocs = groupedLocations[place]
                const isExpanded = expandedPlace === place

                return (
                  <div key={place} className="group relative">
                    <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'} blur-sm transition-opacity`} />
                    <div className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm">
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/15 to-transparent" />
                      <button
                        onClick={() => setExpandedPlace(isExpanded ? null : place)}
                        className="w-full p-4 flex items-center gap-3 tap-feedback text-left"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 border border-violet-400/15 flex items-center justify-center shadow-lg shadow-violet-500/5 backdrop-blur-sm">
                          <span className="text-violet-300 text-sm">📍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-white/90 truncate">{place}</h3>
                          <p className="text-white/25 text-xs">
                            {placeLocs.length} memor{placeLocs.length === 1 ? 'y' : 'ies'}
                          </p>
                        </div>
                        <svg
                          className={`w-4 h-4 text-white/15 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 border-t border-white/[0.04] pt-3">
                          {placeLocs.map(loc => (
                            <div
                              key={loc.id}
                              className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 backdrop-blur-sm hover:bg-white/[0.04] transition-colors"
                            >
                              <p className="text-white/55 text-sm leading-relaxed">
                                {loc.memory?.content || 'Memory content not available'}
                              </p>
                              <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/20">
                                    {new Date(loc.created_at).toLocaleDateString('en-US', {
                                      month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                  </span>
                                  {loc.memory?.category && (
                                    <span className="px-2 py-0.5 rounded-full bg-violet-500/[0.08] border border-violet-400/10 text-violet-300/80 text-[10px]">
                                      {loc.memory.category}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id) }}
                                  className="text-white/15 hover:text-red-400 transition text-xs"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Add Existing Memory */}
        {!showAdd && memories.length > 0 && (
          <div className="mt-8">
            <div className="relative rounded-xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-sm p-4">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              <h3 className="text-xs font-medium text-white/30 mb-2 flex items-center gap-1.5">💡 Tip</h3>
              <p className="text-white/20 text-xs leading-relaxed">
                Tap the + button above to add a memory to a location. You can search for any place in the world and tie your memories to it.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
