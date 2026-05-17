'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Room { id: string; name: string; emoji: string; description: string; memories: PalaceMemory[]; color: string }
interface PalaceMemory { id: string; title: string; placement: string; vividness: number }

const DEFAULT_ROOMS: Room[] = [
  { id: 'entrance', name: 'Grand Entrance', emoji: '🏛️', description: 'Marble floors echo with first impressions', memories: [], color: '#8b5cf6' },
  { id: 'library', name: 'Library of Knowledge', emoji: '📚', description: 'Shelves stretching to infinity, filled with learned wisdom', memories: [], color: '#3b82f6' },
  { id: 'garden', name: 'Memory Garden', emoji: '🌿', description: 'Blooming flowers, each one a cherished moment', memories: [], color: '#22c55e' },
  { id: 'kitchen', name: 'Heart of Home', emoji: '🍳', description: 'Warmth, aromas, and the taste of comfort', memories: [], color: '#f97316' },
  { id: 'bedroom', name: 'Dream Chamber', emoji: '🛏️', description: 'Soft whispers of intimate thoughts and dreams', memories: [], color: '#ec4899' },
  { id: 'attic', name: 'Forgotten Attic', emoji: '🕸️', description: 'Dusty boxes of buried memories, waiting to be rediscovered', memories: [], color: '#a78bfa' },
  { id: 'basement', name: 'Deep Vault', emoji: '🔐', description: 'The deepest memories, locked away for protection', memories: [], color: '#ef4444' },
  { id: 'rooftop', name: 'Sky Terrace', emoji: '🌌', description: 'Open sky, infinite horizons, dreams of the future', memories: [], color: '#6366f1' },
]

export default function MemoryPalacePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPlacement, setNewPlacement] = useState('')
  const [newVividness, setNewVividness] = useState(70)
  const [view, setView] = useState<'grid' | 'detail'>('grid')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try {
        const stored = localStorage.getItem('consciousness-memory-palace')
        if (stored) {
          const data = JSON.parse(stored)
          setRooms(data.rooms || DEFAULT_ROOMS)
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const saveRooms = (r: Room[]) => {
    setRooms(r)
    localStorage.setItem('consciousness-memory-palace', JSON.stringify({ rooms: r }))
  }

  const addMemory = () => {
    if (!selectedRoom || !newTitle.trim()) return
    const mem: PalaceMemory = { id: Date.now().toString(), title: newTitle.trim(), placement: newPlacement.trim() || 'Near the entrance', vividness: newVividness }
    const updated = rooms.map(r => r.id === selectedRoom.id ? { ...r, memories: [...r.memories, mem] } : r)
    saveRooms(updated)
    setSelectedRoom(updated.find(r => r.id === selectedRoom.id) || null)
    setNewTitle(''); setNewPlacement(''); setShowAdd(false)
  }

  const removeMemory = (roomId: string, memId: string) => {
    const updated = rooms.map(r => r.id === roomId ? { ...r, memories: r.memories.filter(m => m.id !== memId) } : r)
    saveRooms(updated)
    if (selectedRoom?.id === roomId) setSelectedRoom(updated.find(r => r.id === roomId) || null)
  }

  const totalMemories = rooms.reduce((sum, r) => sum + r.memories.length, 0)

  if (loading) return <main className="page-transition min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></main>

  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">🏰 Memory Palace</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-xl font-bold text-white">{rooms.length}</div>
            <div className="text-[10px] text-white/30">Rooms</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-xl font-bold text-white">{totalMemories}</div>
            <div className="text-[10px] text-white/30">Memories</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-xl font-bold text-white">{rooms.filter(r => r.memories.length > 0).length}</div>
            <div className="text-[10px] text-white/30">Active</div>
          </div>
        </div>

        {view === 'grid' ? (
          <>
            {/* Room Grid */}
            <div className="grid grid-cols-2 gap-3">
              {rooms.map(room => (
                <button key={room.id} onClick={() => { setSelectedRoom(room); setView('detail') }} className="relative rounded-xl p-4 text-left transition-all hover:scale-[1.02] border border-white/5 overflow-hidden" style={{ background: `${room.color}08` }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-20" style={{ background: room.color }} />
                  <div className="text-3xl mb-2">{room.emoji}</div>
                  <div className="text-sm font-semibold text-white">{room.name}</div>
                  <div className="text-[10px] text-white/30 mt-1">{room.memories.length} memories</div>
                  {room.memories.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {room.memories.slice(0, 3).map((m, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: room.color }} />
                      ))}
                      {room.memories.length > 3 && <div className="text-[10px] text-white/20">+{room.memories.length - 3}</div>}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Journey */}
            <div className="bg-white/5 rounded-xl border border-white/5 p-4">
              <h3 className="text-xs font-medium text-white/30 mb-3">🏰 Palace Journey</h3>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {rooms.map((r, i) => (
                  <div key={r.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${r.color}22`, border: `1px solid ${r.color}33` }}>{r.emoji}</div>
                    {i < rooms.length - 1 && <div className="w-4 h-0.5 bg-white/10" />}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/20 mt-2">Walk through your palace to recall memories in order</p>
            </div>
          </>
        ) : selectedRoom && (
          <>
            <button onClick={() => setView('grid')} className="text-sm text-violet-400">← Back to Palace</button>
            {/* Room Header */}
            <div className="relative rounded-xl overflow-hidden p-6 text-center" style={{ background: `${selectedRoom.color}08`, border: `1px solid ${selectedRoom.color}15` }}>
              <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${selectedRoom.color}, transparent)` }} />
              <div className="text-5xl mb-2">{selectedRoom.emoji}</div>
              <h2 className="text-xl font-bold text-white">{selectedRoom.name}</h2>
              <p className="text-xs text-white/40 mt-1">{selectedRoom.description}</p>
              <div className="text-xs text-white/20 mt-2">{selectedRoom.memories.length} memories placed here</div>
            </div>

            {/* Add Memory */}
            <button onClick={() => setShowAdd(!showAdd)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
              {showAdd ? '✕ Cancel' : '＋ Place Memory Here'}
            </button>
            {showAdd && (
              <div className="bg-white/5 rounded-xl border border-violet-500/10 p-4 space-y-3">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Memory title" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
                <input value={newPlacement} onChange={e => setNewPlacement(e.target.value)} placeholder="Where in the room? (e.g., On the shelf, By the window)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
                <div>
                  <div className="flex justify-between text-xs text-white/30 mb-1"><span>Vividness</span><span>{newVividness}%</span></div>
                  <input type="range" min={10} max={100} value={newVividness} onChange={e => setNewVividness(parseInt(e.target.value))} className="w-full" style={{ accentColor: selectedRoom.color }} />
                </div>
                <button onClick={addMemory} disabled={!newTitle.trim()} className="w-full py-2.5 rounded-xl text-white text-sm disabled:opacity-30" style={{ background: selectedRoom.color }}>Place Memory</button>
              </div>
            )}

            {/* Memories in Room */}
            {selectedRoom.memories.length === 0 ? (
              <div className="text-center py-8 text-white/20">
                <div className="text-4xl mb-2">🏚️</div>
                <p className="text-sm">This room is empty</p>
                <p className="text-xs mt-1">Place a memory here to fill it</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedRoom.memories.map(m => (
                  <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: `${selectedRoom.color}22` }}>📍</div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{m.title}</div>
                      <div className="text-[10px] text-white/30">{m.placement}</div>
                      <div className="mt-1 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${m.vividness}%`, background: selectedRoom.color }} />
                      </div>
                    </div>
                    <button onClick={() => removeMemory(selectedRoom.id, m.id)} className="text-white/20 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
