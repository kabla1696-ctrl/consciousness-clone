'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Memory {
  id: string
  content: string
  category: string
  mood: string
  created_at: string
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'childhood', label: 'Childhood', icon: '🧒' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'friendship', label: 'Friends', icon: '🤝' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'career', label: 'Career', icon: '💼' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'food', label: 'Food', icon: '🍕' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'dreams', label: 'Dreams', icon: '💭' },
  { id: 'fears', label: 'Fears', icon: '😰' },
  { id: 'achievement', label: 'Achievement', icon: '🏆' },
  { id: 'failure', label: 'Failure', icon: '💔' },
  { id: 'regret', label: 'Regret', icon: '😔' },
  { id: 'lesson', label: 'Lessons', icon: '📖' },
  { id: 'turning_point', label: 'Turning Points', icon: '🔄' },
  { id: 'spiritual', label: 'Spiritual', icon: '🙏' },
  { id: 'health', label: 'Health', icon: '💪' },
  { id: 'hobby', label: 'Hobby', icon: '🎨' },
  { id: 'secret', label: 'Secrets', icon: '🤫' },
  { id: 'opinion', label: 'Opinions', icon: '💬' },
  { id: 'personality', label: 'Personality', icon: '🧬' },
  { id: 'bad_habits', label: 'Bad Habits', icon: '😈' },
  { id: 'strengths', label: 'Strengths', icon: '💪' },
  { id: 'weaknesses', label: 'Weaknesses', icon: '😔' },
  { id: 'secrets', label: 'Dark Secrets', icon: '🌑' },
]

const MOODS = ['😊', '😢', '😡', '😰', '😍', '🤔', '💪', '🙏', '🎉', '💔', '✨', '🔥', '📝', '🧒', '✈️', '🎓', '💼', '❤️', '🎵', '🍕']

export default function Memories() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newMemory, setNewMemory] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('personal')
  const [selectedMood, setSelectedMood] = useState('📝')
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadMemories(user.id)
    }
    init()
  }, [])

  // Rolling counter
  useEffect(() => {
    if (memories.length === 0) return
    const target = memories.length
    const duration = 1000
    const steps = 25
    const step = target / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      setDisplayCount(Math.min(Math.round(step * current), target))
      if (current >= steps) clearInterval(interval)
    }, duration / steps)

    return () => clearInterval(interval)
  }, [memories.length])

  const loadMemories = async (userId: string) => {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setMemories(data)
    setLoading(false)
  }

  const addMemory = async () => {
    if (!newMemory.trim() || !user) return

    const { data } = await supabase
      .from('memories')
      .insert({
        user_id: user.id,
        content: newMemory.trim(),
        category: selectedCategory,
        mood: selectedMood,
      })
      .select()
      .single()

    if (data) {
      setMemories([data, ...memories])
      setNewMemory('')
      setShowAdd(false)
    }
  }

  const deleteMemory = async (id: string) => {
    setDeletingId(id)
    await new Promise(r => setTimeout(r, 400))
    await supabase.from('memories').delete().eq('id', id)
    setMemories(memories.filter(m => m.id !== id))
    setDeletingId(null)
  }

  const filtered = memories.filter(m => {
    const matchesCategory = activeTab === 'all' || m.category === activeTab
    const matchesSearch = !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categoryStats = CATEGORIES.filter(c => c.id !== 'all').map(cat => ({
    ...cat,
    count: memories.filter(m => m.category === cat.id).length,
  })).filter(c => c.count > 0)

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Background orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animation: 'orb1 22s ease-in-out infinite' }} />
        <div className="absolute bottom-[-150px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', animation: 'orb2 28s ease-in-out infinite' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold">Memories</h1>
          <div className="flex-1" />
          <span className="text-xs text-white/20 font-mono">{displayCount} stored</span>
        </div>
      </header>

      <div className="relative z-10 pt-4 px-4 max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-shimmer">Your Memories 📝</h1>
            <p className="text-white/25 text-sm mt-1">{memories.length} memories stored • {categoryStats.length} categories used</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className={`relative px-5 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 ${!showAdd ? 'pulse-btn' : ''}`}
          >
            {showAdd ? '✕ Close' : '+ Add Memory'}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 glass-strong rounded-xl focus:outline-none focus:border-violet-500/40 transition text-white placeholder:text-white/20 text-sm"
              placeholder="Search your memories..."
            />
          </div>
        </div>

        {/* Memory Stats */}
        {memories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { value: displayCount, label: 'Total Memories', color: 'text-violet-400', bar: 'from-violet-500/30' },
              { value: categoryStats.length, label: 'Categories', color: 'text-fuchsia-400', bar: 'from-fuchsia-500/30' },
              { value: memories.filter(m => m.mood === '😊').length, label: 'Happy Memories', color: 'text-cyan-400', bar: 'from-cyan-500/30' },
              { value: memories.filter(m => m.category === 'secret').length, label: 'Secrets', color: 'text-amber-400', bar: 'from-amber-500/30' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl glass-strong p-4 text-center glow-pulse-hover transition-all hover:scale-[1.03]">
                <div className={`text-2xl font-black ${stat.color} roll-in`} style={{ animationDelay: `${i * 0.1}s` }}>{stat.value}</div>
                <div className="text-white/25 text-xs font-medium mt-1">{stat.label}</div>
                <div className={`w-full h-0.5 bg-gradient-to-r ${stat.bar} to-transparent rounded-full mt-2`} />
              </div>
            ))}
          </div>
        )}

        {/* Add Memory Form */}
        {showAdd && (
          <div className="rounded-2xl glass-strong p-6 mb-8 animate-slide-up">
            <h3 className="text-lg font-bold mb-4 text-shimmer">New Memory</h3>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="w-full px-4 py-3.5 glass rounded-xl focus:outline-none focus:border-violet-500/40 transition resize-none text-white placeholder:text-white/20 text-sm"
              rows={4}
              placeholder="Write your memory here... What happened? How did you feel? What did you learn?"
            />

            {/* Category Select */}
            <div className="mt-4">
              <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === cat.id ? 'bg-violet-500/25 border border-violet-500/40 text-violet-300 shadow-md shadow-violet-500/10' : 'glass text-white/40 hover:text-white/60'}`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Select */}
            <div className="mt-4">
              <p className="text-white/35 text-xs font-medium uppercase tracking-wider mb-2">Mood</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`w-10 h-10 rounded-xl text-lg transition-all ${selectedMood === mood ? 'bg-violet-500/25 border border-violet-500/40 scale-110 shadow-md shadow-violet-500/10 bounce-select' : 'glass hover:scale-105'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={addMemory} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95">
                Save Memory
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 glass rounded-xl text-sm text-white/40 hover:text-white/60 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${activeTab === cat.id ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/20 text-white' : 'glass text-white/40 hover:text-white/60'}`}
            >
              {cat.icon} {cat.label}
              {cat.id !== 'all' && memories.filter(m => m.category === cat.id).length > 0 && (
                <span className="ml-1 text-white/25">({memories.filter(m => m.category === cat.id).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Memory List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl glass p-6 h-24 skeleton" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4" style={{ animation: 'float-subtle 4s ease-in-out infinite' }}>📝</div>
            <p className="text-white/40 text-lg font-semibold">No memories yet</p>
            <p className="text-white/20 text-sm mt-2">Click &quot;+ Add Memory&quot; to store your first memory</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((memory, i) => (
              <div
                key={memory.id}
                className={`rounded-2xl glass p-5 transition-all duration-300 hover:scale-[1.01] group relative overflow-hidden ${deletingId === memory.id ? 'animate-fade-out' : 'animate-slide-up'} cat-border-${memory.category}`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{memory.mood}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[15px] leading-relaxed">{memory.content}</p>
                    <div className="flex gap-3 mt-3 text-xs text-white/20">
                      <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                      <span className="bg-white/[0.04] px-2 py-0.5 rounded-full">{memory.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/15 hover:text-red-400 transition-all text-sm p-1 rounded-lg hover:bg-red-500/10"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
