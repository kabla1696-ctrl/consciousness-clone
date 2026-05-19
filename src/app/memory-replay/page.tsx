'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface MemoryEntry {
  id: string; title: string; content: string; mood: string; date: string; tags: string[]; intensity: number
}

const MOODS = [
  { key: 'happy', emoji: '😊', color: '#fbbf24' },
  { key: 'sad', emoji: '😢', color: '#60a5fa' },
  { key: 'angry', emoji: '😡', color: '#f87171' },
  { key: 'peaceful', emoji: '😌', color: '#34d399' },
  { key: 'nostalgic', emoji: '🥺', color: '#c084fc' },
  { key: 'excited', emoji: '🤩', color: '#fb923c' },
]

export default function MemoryReplayPage() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(3000)
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newMood, setNewMood] = useState('happy')
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try {
        const stored = localStorage.getItem('consciousness-memory-replay')
        if (stored) setMemories(JSON.parse(stored))
        else {
          const defaults: MemoryEntry[] = [
            { id: '1', title: 'First Day of School', content: 'Walking through those big doors, heart pounding, backpack too heavy. The smell of chalk and fresh paint. Making a friend on the first day.', mood: 'nostalgic', date: '2010-09-01', tags: ['childhood', 'school'], intensity: 85 },
            { id: '2', title: 'Summer at the Beach', content: 'Sand between toes, waves crashing, the taste of salt on ice cream. Building sandcastles that the ocean always reclaimed.', mood: 'happy', date: '2015-07-15', tags: ['summer', 'family'], intensity: 92 },
            { id: '3', title: 'Saying Goodbye', content: 'Standing at the airport, watching them disappear through security. The walk back to the car felt like the longest distance.', mood: 'sad', date: '2018-03-20', tags: ['loss', 'goodbye'], intensity: 95 },
            { id: '4', title: 'The Concert', content: 'The bass vibrating through the floor, thousands of voices singing in unison, lights painting the sky. Pure electric joy.', mood: 'excited', date: '2019-08-10', tags: ['music', 'friends'], intensity: 88 },
            { id: '5', title: 'Rainy Evening Tea', content: 'Sitting by the window, watching rain trace paths on glass. The warmth of the cup in cold hands. Complete peace.', mood: 'peaceful', date: '2022-11-05', tags: ['solitude', 'peace'], intensity: 70 },
          ]
          setMemories(defaults)
          localStorage.setItem('consciousness-memory-replay', JSON.stringify(defaults))
        }
      } catch (err) { console.error('Failed to load replay data:', err) }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTransitioning(true)
        setTimeout(() => {
          setCurrentIndex(prev => {
            const filtered = filterMood ? memories.filter(m => m.mood === filterMood) : memories
            if (filtered.length === 0) return 0
            return (prev + 1) % filtered.length
          })
          setTransitioning(false)
        }, 500)
      }, speed)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPlaying, speed, memories, filterMood])

  const filtered = filterMood ? memories.filter(m => m.mood === filterMood) : memories
  const current = filtered[currentIndex] || filtered[0]

  const addMemory = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const entry: MemoryEntry = {
      id: Date.now().toString(), title: newTitle.trim(), content: newContent.trim(),
      mood: newMood, date: new Date().toISOString().split('T')[0], tags: [], intensity: 50 + Math.floor(Math.random() * 50)
    }
    const updated = [entry, ...memories]
    setMemories(updated)
    localStorage.setItem('consciousness-memory-replay', JSON.stringify(updated))
    setNewTitle(''); setNewContent(''); setShowAdd(false)
  }

  const deleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id)
    setMemories(updated)
    localStorage.setItem('consciousness-memory-replay', JSON.stringify(updated))
    if (currentIndex >= updated.length) setCurrentIndex(0)
  }

  const moodObj = MOODS.find(m => m.key === current?.mood) || MOODS[0]

  if (loading) return <main className="page-transition min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></main>

  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">📽️ {t('memory replay')}</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Now Playing */}
        <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${transitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10" />
          <div className="relative p-6 space-y-4">
            <div className="text-center">
              <div aria-hidden="true" className="text-5xl mb-2">{moodObj.emoji}</div>
              <h2 className="text-xl font-bold text-white">{current?.title || t('relive')}</h2>
              <p className="text-xs text-white/30 mt-1">{current?.date}</p>
            </div>
            {current && (
              <>
                <p className="text-white/60 text-sm leading-relaxed text-center italic">&ldquo;{current.content}&rdquo;</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: `${moodObj.color}22`, color: moodObj.color }}>{moodObj.emoji} {moodObj.key}</span>
                  <span className="text-xs text-white/20">{t('intensity')}: {current.intensity}%</span>
                </div>
                {/* Intensity bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${current.intensity}%`, background: `linear-gradient(to right, ${moodObj.color}66, ${moodObj.color})` }} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10">⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-xl shadow-lg shadow-violet-500/20">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => setCurrentIndex(prev => Math.min(filtered.length - 1, prev + 1))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10">⏭</button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">{t('playback')}:</span>
          {[5000, 3000, 1500, 800].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`text-xs px-3 py-1 rounded-full ${speed === s ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-white/30'}`}>{s / 1000}s</button>
          ))}
        </div>

        {/* Mood Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterMood(null)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${!filterMood ? 'bg-violet-500/20 text-violet-400' : 'bg-white/5 text-white/30'}`}>{t('all')}</button>
          {MOODS.map(m => (
            <button key={m.key} onClick={() => { setFilterMood(m.key); setCurrentIndex(0) }} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${filterMood === m.key ? 'text-white/80' : 'bg-white/5 text-white/30'}`} style={filterMood === m.key ? { background: `${m.color}22`, color: m.color } : {}}>{m.emoji} {m.key}</button>
          ))}
        </div>

        {/* Add */}
        <button onClick={() => setShowAdd(!showAdd)} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm hover:bg-white/10 transition-colors">
          {showAdd ? '✕ ' + t('cancel') : '＋ ' + t('add memory')}
        </button>
        {showAdd && (
          <div className="bg-white/5 rounded-xl border border-violet-500/10 p-4 space-y-3">
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder={t('memory title')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={t('describe this memory')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm h-20 resize-none" />
            <div className="flex gap-2 flex-wrap">
              {MOODS.map(m => (
                <button key={m.key} onClick={() => setNewMood(m.key)} className={`px-3 py-1 rounded-full text-xs ${newMood === m.key ? 'border' : 'bg-white/5 text-white/30'}`} style={newMood === m.key ? { background: `${m.color}22`, color: m.color, borderColor: `${m.color}44` } : {}}>{m.emoji} {m.key}</button>
              ))}
            </div>
            <button onClick={addMemory} disabled={!newTitle.trim() || !newContent.trim()} className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm disabled:opacity-30">{t('save memory')}</button>
          </div>
        )}

        {/* Memory List */}
        <div className="space-y-2">
          <h3 className="text-xs text-white/30 font-medium">{t('moments')} ({filtered.length})</h3>
          {filtered.map((m, i) => {
            const mm = MOODS.find(x => x.key === m.mood) || MOODS[0]
            return (
              <div key={m.id} onClick={() => setCurrentIndex(i)} className={`p-3 rounded-xl cursor-pointer transition-all ${i === currentIndex ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{mm.emoji}</span>
                    <span className="text-sm text-white font-medium">{m.title}</span>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteMemory(m.id) }} className="text-white/20 hover:text-red-400 text-xs">✕</button>
                </div>
                <p className="text-xs text-white/30 mt-1 line-clamp-1">{m.content}</p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
