'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Dream {
  id: string
  title: string
  description: string
  mood: string
  lucidity: number
  date: string
  analysis?: string
  created_at: string
}

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😨', label: 'Scared' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😌', label: 'Peaceful' },
  { emoji: '🤔', label: 'Confused' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😍', label: 'Loving' },
  { emoji: '😵‍💫', label: 'Surreal' },
]

const DREAM_THEMES = ['flying', 'falling', 'water', 'chase', 'exam', 'teeth', 'death', 'reunion', 'adventure', 'nightmare', 'lucid', 'recurring', 'prophetic', 'surreal', 'romantic', 'dark']

const LS_KEY = 'cc_dreams'

function loadDreams(): Dream[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch { return [] }
}

function saveDreams(dreams: Dream[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(dreams))
}

export default function DreamLab() {
  const [user, setUser] = useState<any>(null)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mood, setMood] = useState('😊')
  const [lucidity, setLucidity] = useState(3)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setDreams(loadDreams())
    }
    init()
  }, [])

  const addDream = () => {
    if (!title.trim() || !description.trim()) return
    const dream: Dream = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      mood,
      lucidity,
      date,
      created_at: new Date().toISOString(),
    }
    const updated = [dream, ...dreams]
    setDreams(updated)
    saveDreams(updated)
    setTitle('')
    setDescription('')
    setMood('😊')
    setLucidity(3)
    setDate(new Date().toISOString().split('T')[0])
    setShowAdd(false)
  }

  const deleteDream = (id: string) => {
    const updated = dreams.filter(d => d.id !== id)
    setDreams(updated)
    saveDreams(updated)
  }

  const analyzeDream = async (dream: Dream) => {
    setAnalyzing(dream.id)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this dream and provide psychological interpretation:\n\nTitle: ${dream.title}\nDream: ${dream.description}\nMood: ${dream.mood}\nLucidity: ${dream.lucidity}/5`,
        }),
      })
      const data = await res.json()
      const updated = dreams.map(d =>
        d.id === dream.id ? { ...d, analysis: data.reply || data.message || 'No analysis available.' } : d
      )
      setDreams(updated)
      saveDreams(updated)
    } catch {
      const updated = dreams.map(d =>
        d.id === dream.id ? { ...d, analysis: 'Failed to analyze. Try again later.' } : d
      )
      setDreams(updated)
      saveDreams(updated)
    }
    setAnalyzing(null)
  }

  const filtered = dreams.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
  })

  // Patterns
  const moodCounts: Record<string, number> = {}
  dreams.forEach(d => { moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1 })
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const avgLucidity = dreams.length > 0 ? (dreams.reduce((s, d) => s + d.lucidity, 0) / dreams.length).toFixed(1) : '0'

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
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <h1 className="text-base font-bold">Dream Lab</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Intro */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Dream Lab 🌙</h2>
          <p className="text-white/30 text-sm">Record, analyze, and understand your dreams</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-violet-400">{dreams.length}</div>
            <div className="text-white/30 text-[10px]">Dreams</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-fuchsia-400">{avgLucidity}</div>
            <div className="text-white/30 text-[10px]">Avg Lucidity</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-cyan-400">{dreams.filter(d => d.analysis).length}</div>
            <div className="text-white/30 text-[10px]">Analyzed</div>
          </div>
        </div>

        {/* Dream Patterns */}
        {dreams.length > 3 && (
          <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] mb-6">
            <h3 className="text-sm font-semibold text-white/60 mb-3">🧠 Dream Patterns</h3>
            <div className="flex flex-wrap gap-2">
              {topMoods.map(([moodEmoji, count]) => (
                <span key={moodEmoji} className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-sm">
                  {moodEmoji} × {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
            placeholder="🔍 Search your dreams..."
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition tap-feedback"
        >
          {showAdd ? '✕ Cancel' : '✨ Record New Dream'}
        </button>

        {/* Add Dream Form */}
        {showAdd && (
          <div className="rounded-xl border border-white/[0.06] p-5 bg-white/[0.02] mb-6 space-y-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
              placeholder="Dream title..."
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20"
              rows={4}
              placeholder="Describe your dream in detail..."
            />
            <div>
              <p className="text-white/40 text-xs mb-2">Mood:</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.emoji}
                    onClick={() => setMood(m.emoji)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${mood === m.emoji ? 'bg-violet-500/30 border border-violet-500/50' : 'border border-white/[0.06] hover:bg-white/[0.02] text-white/50'}`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2">Lucidity: {lucidity}/5</p>
              <input
                type="range"
                min={1}
                max={5}
                value={lucidity}
                onChange={e => setLucidity(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 px-1">
                <span>Vivid</span>
                <span>Lucid</span>
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2">Date:</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white"
              />
            </div>
            <button
              onClick={addDream}
              disabled={!title.trim() || !description.trim()}
              className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30"
            >
              Save Dream
            </button>
          </div>
        )}

        {/* Dream List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🌙</div>
            <p className="text-white/30">No dreams recorded yet</p>
            <p className="text-white/20 text-sm mt-1">Start by recording your first dream</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(dream => (
              <div key={dream.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] hover:bg-white/[0.04] transition group">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{dream.mood}</span>
                    <div>
                      <h3 className="font-semibold text-sm">{dream.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-white/30">
                        <span>{new Date(dream.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Lucidity: {dream.lucidity}/5</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDream(dream.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-3">{dream.description}</p>
                {dream.analysis ? (
                  <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-3">
                    <p className="text-[10px] text-violet-400 font-semibold mb-1">🧠 AI Analysis</p>
                    <p className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap">{dream.analysis}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => analyzeDream(dream)}
                    disabled={analyzing === dream.id}
                    className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition disabled:opacity-50"
                  >
                    {analyzing === dream.id ? '🔄 Analyzing...' : '🧠 Analyze Dream'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
