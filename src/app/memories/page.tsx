'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

interface Memory {
  id: string
  content: string
  category: string
  mood: string
  created_at: string
}

export default function Memories() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newMemory, setNewMemory] = useState('')
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

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
        category: 'personal',
        mood: '📝',
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

  const filtered = activeTab === 'all' ? memories : memories.filter(m => m.category === activeTab)

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
            <Link href="/chat" className="text-sm text-white/40 hover:text-white transition">Chat</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Memories 📝</h1>
            <p className="text-white/30">{memories.length} memories stored</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Add Memory
          </button>
        </div>

        {/* Add Memory Form */}
        {showAdd && (
          <div className="rounded-2xl border border-white/[0.06] p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-lg font-semibold mb-4">New Memory</h3>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20"
              rows={4}
              placeholder="Write your memory here... What happened? How did you feel?"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={addMemory} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 transition">
                Save Memory
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-white/[0.06] rounded-lg hover:bg-white/[0.02] transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'childhood', 'family', 'milestone', 'travel', 'decision', 'personal'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === tab ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'border border-white/[0.06] hover:bg-white/[0.02] text-white/50'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
