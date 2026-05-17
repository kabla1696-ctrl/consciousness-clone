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

/* ── floating particle component ── */
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0
              ? 'rgba(139,92,246,0.4)'
              : i % 3 === 1
                ? 'rgba(168,85,247,0.3)'
                : 'rgba(192,132,252,0.25)',
            animation: `dreamFloat ${6 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${-Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  )
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

  const moodCounts: Record<string, number> = {}
  dreams.forEach(d => { moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1 })
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const avgLucidity = dreams.length > 0 ? (dreams.reduce((s, d) => s + d.lucidity, 0) / dreams.length).toFixed(1) : '0'

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/60 border-t-violet-400 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative overflow-hidden">
      {/* Animated gradient bg */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-violet-900/20 blur-[120px] animate-[orb1_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-purple-900/15 blur-[100px] animate-[orb2_25s_ease-in-out_infinite]" />
        <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-900/10 blur-[80px] animate-[orb3_18s_ease-in-out_infinite]" />
      </div>
      <Particles />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/40 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 flex items-center justify-center backdrop-blur-sm border border-violet-500/20">
              <span className="text-base">🌙</span>
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Dream Lab</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 relative z-10">
        {/* Intro */}
        <div className="mb-6 animate-[fadeSlideUp_0.5s_ease-out]">
          <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">Dream Lab 🌙</h2>
          <p className="text-white/30 text-sm">Record, analyze, and understand your dreams</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 animate-[fadeSlideUp_0.5s_ease-out_0.1s_both]">
          {[
            { value: dreams.length, label: 'Dreams', gradient: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', text: 'text-violet-400', glow: 'shadow-violet-500/10' },
            { value: avgLucidity, label: 'Avg Lucidity', gradient: 'from-fuchsia-500/20 to-fuchsia-600/10', border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/10' },
            { value: dreams.filter(d => d.analysis).length, label: 'Analyzed', gradient: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl border ${s.border} p-3 bg-gradient-to-br ${s.gradient} backdrop-blur-xl text-center shadow-lg ${s.glow} hover:scale-[1.03] transition-transform duration-300`}>
              <div className={`text-xl font-bold ${s.text}`}>{s.value}</div>
              <div className="text-white/30 text-[10px] font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Dream Patterns */}
        {dreams.length > 3 && (
          <div className="rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02] backdrop-blur-xl mb-6 animate-[fadeSlideUp_0.5s_ease-out_0.15s_both]">
            <h3 className="text-sm font-semibold text-white/50 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">🧠</span>
              {t('patterns')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {topMoods.map(([moodEmoji, count]) => (
                <span key={moodEmoji} className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm backdrop-blur-sm hover:bg-violet-500/20 transition-colors cursor-default">
                  {moodEmoji} × {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-4 animate-[fadeSlideUp_0.5s_ease-out_0.2s_both]">
          <div className="relative group">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
              placeholder="🔍 Search your dreams..."
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-full mb-6 px-4 py-3.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl font-semibold text-sm text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 animate-[fadeSlideUp_0.5s_ease-out_0.25s_both]"
        >
          {showAdd ? '✕ Cancel' : '✨ Record New Dream'}
        </button>

        {/* Add Dream Form */}
        {showAdd && (
          <div className="rounded-2xl border border-violet-500/20 p-5 bg-violet-500/[0.03] backdrop-blur-xl mb-6 space-y-4 animate-[fadeSlideUp_0.4s_ease-out]">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_15px_rgba(139,92,246,0.08)] transition-all duration-300 text-white placeholder:text-white/20 backdrop-blur-sm"
              placeholder="Dream title..."
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/40 transition-all duration-300 resize-none text-white placeholder:text-white/20 backdrop-blur-sm"
              rows={4}
              placeholder="Describe your dream in detail..."
            />
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium">Mood:</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m.emoji}
                    onClick={() => setMood(m.emoji)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-all duration-200 ${mood === m.emoji
                      ? 'bg-violet-500/30 border border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.15)] scale-105'
                      : 'border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-white/50'
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium">Lucidity: {lucidity}/5</p>
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
              <p className="text-white/40 text-xs mb-2 font-medium">Date:</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/40 transition-all duration-300 text-white backdrop-blur-sm"
              />
            </div>
            <button
              onClick={addDream}
              disabled={!title.trim() || !description.trim()}
              className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl font-semibold text-sm text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 disabled:opacity-30 disabled:shadow-none transition-all duration-300"
            >
              Save Dream
            </button>
          </div>
        )}

        {/* Dream List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-[fadeSlideUp_0.5s_ease-out]">
            <div className="text-6xl mb-4 opacity-80">🌙</div>
            <p className="text-white/40 font-medium">No dreams recorded yet</p>
            <p className="text-white/20 text-sm mt-1">Start by recording your first dream</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((dream, i) => (
              <div
                key={dream.id}
                className="group rounded-2xl border border-white/[0.06] p-4 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)] transition-all duration-300"
                style={{ animation: `fadeSlideUp 0.4s ease-out ${i * 0.05}s both` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 flex items-center justify-center text-xl border border-violet-500/10">
                      {dream.mood}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white/90">{dream.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-white/30 mt-0.5">
                        <span>{new Date(dream.date).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>Lucidity: {dream.lucidity}/5</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDream(dream.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-200 text-xs p-1"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-white/45 text-sm leading-relaxed mb-3">{dream.description}</p>
                {dream.analysis ? (
                  <div className="rounded-xl bg-violet-500/[0.06] border border-violet-500/15 p-3">
                    <p className="text-[10px] text-violet-400 font-semibold mb-1.5 flex items-center gap-1.5">🧠 AI Analysis</p>
                    <p className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap">{dream.analysis}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => analyzeDream(dream)}
                    disabled={analyzing === dream.id}
                    className="px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-300 disabled:opacity-50"
                  >
                    {analyzing === dream.id ? '🔄 Analyzing...' : '🧠 Analyze Dream'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes dreamFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(20px); opacity: 0.5; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
