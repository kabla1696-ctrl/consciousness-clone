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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadMemories(user.id)
    }
    init()
  }, [])

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
    await supabase.from('memories').delete().eq('id', id)
    setMemories(memories.filter(m => m.id !== id))
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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold">Memories</h1>
        </div>
      </header>

      <div className="pt-4 px-4 max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Memories 📝</h1>
            <p className="text-white/30">{memories.length} memories stored • {categoryStats.length} categories used</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Add Memory
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
            placeholder="🔍 Search your memories..."
          />
        </div>

        {/* Memory Stats */}
        {memories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-violet-400">{memories.length}</div>
              <div className="text-white/30 text-sm">Total Memories</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-fuchsia-400">{categoryStats.length}</div>
              <div className="text-white/30 text-sm">Categories</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-cyan-400">{memories.filter(m => m.mood === '😊').length}</div>
              <div className="text-white/30 text-sm">Happy Memories</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-amber-400">{memories.filter(m => m.category === 'secret').length}</div>
              <div className="text-white/30 text-sm">Secrets</div>
            </div>
          </div>
        )}

        {/* Add Memory Form */}
        {showAdd && (
          <div className="rounded-2xl border border-white/[0.06] p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-lg font-semibold mb-4">New Memory</h3>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20"
              rows={4}
              placeholder="Write your memory here... What happened? How did you feel? What did you learn?"
            />

            {/* Category Select */}
            <div className="mt-4">
              <p className="text-white/40 text-sm mb-2">Category:</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedCategory === cat.id ? 'bg-violet-500/30 border border-violet-500/50' : 'border border-white/[0.06] hover:bg-white/[0.02] text-white/50'}`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Select */}
            <div className="mt-4">
              <p className="text-white/40 text-sm mb-2">Mood:</p>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`w-10 h-10 rounded-lg text-xl transition ${selectedMood === mood ? 'bg-violet-500/30 border border-violet-500/50' : 'border border-white/[0.06] hover:bg-white/[0.02]'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={addMemory} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 transition">
                Save Memory
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-white/[0.06] rounded-lg hover:bg-white/[0.02] transition">
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === cat.id ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'border border-white/[0.06] hover:bg-white/[0.02] text-white/50'}`}
            >
              {cat.icon} {cat.label}
              {cat.id !== 'all' && (
                <span className="ml-1 text-white/30">({memories.filter(m => m.category === cat.id).length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Memory List */}
        {loading ? (
          <div className="text-center text-white/30 py-20">Loading memories...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-white/30 text-lg">No memories yet</p>
            <p className="text-white/20 text-sm mt-2">Click &quot;+ Add Memory&quot; to store your first memory</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((memory) => (
              <div key={memory.id} className="rounded-xl border border-white/[0.04] hover:border-white/[0.08] p-6 transition group" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{memory.mood}</div>
                  <div className="flex-1">
                    <p className="text-white/70 text-lg leading-relaxed">{memory.content}</p>
                    <div className="flex gap-4 mt-3 text-sm text-white/20">
                      <span>{new Date(memory.created_at).toLocaleDateString()}</span>
                      <span className="bg-white/[0.04] px-2 py-0.5 rounded">{memory.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition text-sm"
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
