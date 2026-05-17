'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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

interface GroupedMemories {
  [place: string]: MemoryLocation[]
}

export default function MemoryMap() {
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<MemoryLocation[]>([])
  const [groupedLocations, setGroupedLocations] = useState<GroupedMemories>({})
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [memoryContent, setMemoryContent] = useState('')
  const [memoryCategory, setMemoryCategory] = useState('places')
  const [saving, setSaving] = useState(false)
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null)
  const [memories, setMemories] = useState<any[]>([])

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
        .select('*')
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

      // Group by place_name
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

  const selectPlace = (place: any) => {
    setSelectedPlace(place)
    setSearchQuery(place.display_name.split(',')[0])
    setSearchResults([])
  }

  const saveMemoryLocation = async () => {
    if (!selectedPlace || !memoryContent.trim() || !user) return
    setSaving(true)

    try {
      // First save the memory
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

      // Then save the location
      await supabase.from('memory_locations').insert({
        user_id: user.id,
        memory_id: memData.id,
        latitude: parseFloat(selectedPlace.lat),
        longitude: parseFloat(selectedPlace.lon),
        place_name: selectedPlace.display_name.split(',')[0],
      })

      // Reload
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
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🗺️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Memory Map</h1>
            <p className="text-[10px] text-white/40">Memories tied to places</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center tap-feedback"
          >
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {/* Add Memory Form */}
        {showAdd && (
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 mb-6">
            <h3 className="text-sm font-bold mb-4">📍 Add Memory to Place</h3>

            {/* Location Search */}
            <div className="mb-4">
              <label className="text-white/40 text-xs mb-2 block">Search Location</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setSelectedPlace(null)
                  }}
                  placeholder="Search for a place..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && !selectedPlace && (
                <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#0a0a1a] overflow-hidden">
                  {searchResults.map((result, i) => (
                    <button
                      key={i}
                      onClick={() => selectPlace(result)}
                      className="w-full px-4 py-3 text-left tap-feedback border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-violet-400 mt-0.5">📍</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 truncate">
                            {result.display_name.split(',')[0]}
                          </p>
                          <p className="text-[10px] text-white/30 truncate">
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
                <div className="mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-emerald-400 text-sm truncate">{selectedPlace.display_name.split(',')[0]}</span>
                  <button
                    onClick={() => { setSelectedPlace(null); setSearchQuery('') }}
                    className="ml-auto text-white/30 hover:text-white/60"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="text-white/40 text-xs mb-2 block">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setMemoryCategory(cat.value)}
                    className={`p-2 rounded-lg border text-center tap-feedback transition ${
                      memoryCategory === cat.value
                        ? 'border-violet-500/40 bg-violet-500/10'
                        : 'border-white/[0.04] bg-white/[0.02]'
                    }`}
                  >
                    <div className="text-lg">{cat.icon}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Memory Content */}
            <div className="mb-4">
              <label className="text-white/40 text-xs mb-2 block">Memory</label>
              <textarea
                value={memoryContent}
                onChange={e => setMemoryContent(e.target.value)}
                placeholder="What happened here? What do you remember?"
                rows={3}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAdd(false); setSelectedPlace(null); setSearchQuery(''); setMemoryContent('') }}
                className="flex-1 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/60 font-medium tap-feedback"
              >
                Cancel
              </button>
              <button
                onClick={saveMemoryLocation}
                disabled={!selectedPlace || !memoryContent.trim() || saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium tap-feedback disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>📌 Save</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-2xl font-bold text-violet-400">{placeNames.length}</div>
            <div className="text-white/30 text-xs">Places</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-2xl font-bold text-fuchsia-400">{locations.length}</div>
            <div className="text-white/30 text-xs">Memories</div>
          </div>
        </div>

        {/* Place Cards */}
        <div>
          <h2 className="text-lg font-bold mb-4">Your Places</h2>

          {placeNames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-white/40 text-sm">No places yet</p>
              <p className="text-white/20 text-xs mt-1">Add your first memory location!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {placeNames.map(place => {
                const placeLocs = groupedLocations[place]
                const isExpanded = expandedPlace === place

                return (
                  <div
                    key={place}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedPlace(isExpanded ? null : place)}
                      className="w-full p-4 flex items-center gap-3 tap-feedback text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-violet-400">📍</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{place}</h3>
                        <p className="text-white/30 text-xs">
                          {placeLocs.length} memor{placeLocs.length === 1 ? 'y' : 'ies'}
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2">
                        {placeLocs.map(loc => (
                          <div
                            key={loc.id}
                            className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3"
                          >
                            <p className="text-white/60 text-sm leading-relaxed">
                              {loc.memory?.content || 'Memory content not available'}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/20">
                                  {new Date(loc.created_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  })}
                                </span>
                                {loc.memory?.category && (
                                  <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[10px]">
                                    {loc.memory.category}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id) }}
                                className="text-white/20 hover:text-red-400 transition text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Add Existing Memory */}
        {!showAdd && memories.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-white/40 mb-3">💡 Tip</h3>
            <p className="text-white/20 text-xs leading-relaxed">
              Tap the + button above to add a memory to a location. You can search for any place in the world and tie your memories to it.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
