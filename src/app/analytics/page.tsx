'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Analytics() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalMemories: 0,
    totalChats: 0,
    categoryBreakdown: {} as Record<string, number>,
    moodBreakdown: {} as Record<string, number>,
    recentActivity: [] as any[],
    topCategories: [] as [string, number][],
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadAnalytics(user.id)
    }
    init()
  }, [])

  const loadAnalytics = async (userId: string) => {
    const [memoriesRes, messagesRes] = await Promise.all([
      supabase.from('memories').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ])

    const memories = memoriesRes.data || []
    const messages = messagesRes.data || []

    const categoryBreakdown: Record<string, number> = {}
    const moodBreakdown: Record<string, number> = {}

    memories.forEach(m => {
      categoryBreakdown[m.category] = (categoryBreakdown[m.category] || 0) + 1
      moodBreakdown[m.mood] = (moodBreakdown[m.mood] || 0) + 1
    })

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const recentActivity = [...memories.slice(0, 5), ...messages.slice(0, 5)]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)

    setStats({
      totalMemories: memories.length,
      totalChats: messages.length,
      categoryBreakdown,
      moodBreakdown,
      recentActivity,
      topCategories,
    })
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  const maxCategoryCount = Math.max(...Object.values(stats.categoryBreakdown), 1)

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
            <Link href="/memories" className="text-sm text-white/40 hover:text-white transition">Memories</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Clone Analytics 📊</h1>
        <p className="text-white/30 mb-10">Understand your digital consciousness</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-violet-400">{stats.totalMemories}</div>
            <div className="text-white/30 text-sm mt-1">Total Memories</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-fuchsia-400">{stats.totalChats}</div>
            <div className="text-white/30 text-sm mt-1">Chat Messages</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-cyan-400">{Object.keys(stats.categoryBreakdown).length}</div>
            <div className="text-white/30 text-sm mt-1">Categories Used</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-amber-400">{Object.keys(stats.moodBreakdown).length}</div>
            <div className="text-white/30 text-sm mt-1">Moods Tracked</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Category Breakdown */}
          <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <h2 className="text-xl font-bold mb-6">Memory Categories 📝</h2>
            {stats.topCategories.length === 0 ? (
              <p className="text-white/30 text-center py-8">No memories yet. Start adding some!</p>
            ) : (
              <div className="space-y-4">
                {stats.topCategories.map(([category, count]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60 capitalize">{category.replace('_', ' ')}</span>
                      <span className="text-white/30">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood Distribution */}
          <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <h2 className="text-xl font-bold mb-6">Mood Distribution 😊</h2>
            {Object.keys(stats.moodBreakdown).length === 0 ? (
              <p className="text-white/30 text-center py-8">No mood data yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.moodBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-2xl">{mood}</span>
                      <span className="text-white/50 text-sm">×{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">Recent Activity 🕐</h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-white/30 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.02] last:border-0">
                  <div className="text-2xl">{item.role ? '💬' : item.mood || '📝'}</div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm truncate max-w-md">
                      {item.role ? `Chat: ${item.content}` : `Memory: ${item.content}`}
                    </p>
                    <p className="text-white/20 text-xs mt-1">
                      {item.category && `${item.category} • `}{new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="rounded-2xl border border-violet-500/20 p-8 mt-6" style={{ background: 'rgba(139, 92, 246, 0.03)' }}>
          <h2 className="text-xl font-bold mb-4">Clone Insights 💡</h2>
          <div className="space-y-3 text-white/50 text-sm">
            {stats.totalMemories < 5 && (
              <p>📝 Add more memories to help your clone understand you better!</p>
            )}
            {stats.totalMemories >= 5 && stats.totalMemories < 20 && (
              <p>🧬 Your clone is learning! Keep adding memories to deepen its understanding.</p>
            )}
            {stats.totalMemories >= 20 && (
              <p>✨ Your clone has a solid foundation of memories. It can now respond more authentically!</p>
            )}
            {stats.totalChats > 10 && (
              <p>💬 Great conversation history! Your clone is getting better at matching your style.</p>
            )}
            {Object.keys(stats.categoryBreakdown).length < 3 && (
              <p>🌈 Try adding memories from different categories for a more well-rounded clone.</p>
            )}
            {stats.topCategories.length > 0 && (
              <p>📊 Your most documented area is <strong className="text-white/70">{stats.topCategories[0][0].replace('_', ' ')}</strong> with {stats.topCategories[0][1]} memories.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
