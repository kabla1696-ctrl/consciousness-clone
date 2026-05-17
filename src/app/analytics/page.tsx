'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 2.5 + 1}px`,
            height: `${Math.random() * 2.5 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#d946ef' : '#06b6d4',
            '--duration': `${Math.random() * 12 + 8}s`,
            '--delay': `${Math.random() * 6}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="ambient-orb ambient-orb-violet" style={{ width: 400, height: 400, top: '-5%', right: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 300, height: 300, bottom: '20%', left: '-5%' }} />
      <div className="ambient-orb ambient-orb-cyan" style={{ width: 200, height: 200, top: '50%', right: '20%' }} />
    </div>
  )
}

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
      <main className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const maxCategoryCount = Math.max(...Object.values(stats.categoryBreakdown), 1)

  const statCards = [
    { label: 'Total Memories', value: stats.totalMemories, color: 'text-violet-400', icon: '📝' },
    { label: 'Chat Messages', value: stats.totalChats, color: 'text-fuchsia-400', icon: '💬' },
    { label: 'Categories Used', value: Object.keys(stats.categoryBreakdown).length, color: 'text-cyan-400', icon: '📂' },
    { label: 'Moods Tracked', value: Object.keys(stats.moodBreakdown).length, color: 'text-amber-400', icon: '🎭' },
  ]

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay">
      <Particles />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">🧠</div>
            <span className="text-lg font-bold gradient-text">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/chat', label: 'Chat' },
              { href: '/memories', label: 'Memories' },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-white/30 hover:text-white transition-all duration-300 hover:glow-text">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto relative z-10 pb-12">
        {/* Header */}
        <div className="mb-10 animate-slide-up">
          <h1 className="text-5xl font-black gradient-text mb-2">Clone Analytics</h1>
          <p className="text-white/25 text-lg">Understand your digital consciousness</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger-children">
          {statCards.map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center hover-lift group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
              <div className={`text-4xl font-black ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-white/25 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Category Breakdown */}
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-3xl" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-lg">📝</span> Memory Categories
            </h2>
            {stats.topCategories.length === 0 ? (
              <p className="text-white/20 text-center py-12 text-sm">No memories yet. Start adding some!</p>
            ) : (
              <div className="space-y-5 stagger-children">
                {stats.topCategories.map(([category, count]) => (
                  <div key={category} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60 capitalize font-medium">{category.replace('_', ' ')}</span>
                      <span className="text-white/30 font-mono">{count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out premium-progress"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood Distribution */}
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-3xl" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-lg">😊</span> Mood Distribution
            </h2>
            {Object.keys(stats.moodBreakdown).length === 0 ? (
              <p className="text-white/20 text-center py-12 text-sm">No mood data yet</p>
            ) : (
              <div className="flex flex-wrap gap-3 stagger-children">
                {Object.entries(stats.moodBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div
                      key={mood}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card hover:border-violet-500/20 transition-all duration-300 hover:scale-105 cursor-default"
                    >
                      <span className="text-2xl">{mood}</span>
                      <span className="text-white/40 text-sm font-mono">×{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2" />
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-lg">🕐</span> Recent Activity
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-white/20 text-center py-12 text-sm">No activity yet</p>
          ) : (
            <div className="space-y-2 stagger-children">
              {stats.recentActivity.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {item.role ? '💬' : item.mood || '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-sm truncate">
                      {item.role ? `Chat: ${item.content}` : `Memory: ${item.content}`}
                    </p>
                    <p className="text-white/15 text-xs mt-1">
                      {item.category && `${item.category} • `}{new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="gradient-border-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="text-lg">💡</span> Clone Insights
          </h2>
          <div className="space-y-3 text-white/40 text-sm stagger-children">
            {stats.totalMemories < 5 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>📝</span>
                <p>Add more memories to help your clone understand you better!</p>
              </div>
            )}
            {stats.totalMemories >= 5 && stats.totalMemories < 20 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>🧬</span>
                <p>Your clone is learning! Keep adding memories to deepen its understanding.</p>
              </div>
            )}
            {stats.totalMemories >= 20 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>✨</span>
                <p>Your clone has a solid foundation of memories. It can now respond more authentically!</p>
              </div>
            )}
            {stats.totalChats > 10 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>💬</span>
                <p>Great conversation history! Your clone is getting better at matching your style.</p>
              </div>
            )}
            {Object.keys(stats.categoryBreakdown).length < 3 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>🌈</span>
                <p>Try adding memories from different categories for a more well-rounded clone.</p>
              </div>
            )}
            {stats.topCategories.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01]">
                <span>📊</span>
                <p>Your most documented area is <strong className="text-white/60">{stats.topCategories[0][0].replace('_', ' ')}</strong> with {stats.topCategories[0][1]} memories.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
