'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#d946ef' : i % 4 === 2 ? '#06b6d4' : '#f59e0b',
            opacity: 0.4 + Math.random() * 0.3,
            animation: `particleFloat ${8 + Math.random() * 14}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
      {/* Ambient orbs */}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #d946ef, transparent)', bottom: '10%', left: '-5%', animationDelay: '3s' }} />
      <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px] animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', top: '40%', right: '15%', animationDelay: '6s' }} />
    </div>
  )
}

function GlowCard({ children, className = '', glowColor = 'violet' }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const colors: Record<string, string> = {
    violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
    fuchsia: 'hover:shadow-[0_0_40px_rgba(217,70,239,0.15)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    amber: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
  }
  return (
    <div className={`relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-500 ${colors[glowColor] || colors.violet} ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  )
}

export default function Analytics() {
  const t = useT()
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
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="relative">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-violet-500/10 blur-xl animate-pulse" />
        </div>
      </main>
    )
  }

  const maxCategoryCount = Math.max(...Object.values(stats.categoryBreakdown), 1)

  const statCards = [
    { label: t('memories'), value: stats.totalMemories, gradient: 'from-violet-500 to-violet-400', icon: '📝', glow: 'violet' },
    { label: t('chat'), value: stats.totalChats, gradient: 'from-fuchsia-500 to-pink-400', icon: '💬', glow: 'fuchsia' },
    { label: t('features count'), value: Object.keys(stats.categoryBreakdown).length, gradient: 'from-cyan-500 to-teal-400', icon: '📂', glow: 'cyan' },
    { label: t('mood'), value: Object.keys(stats.moodBreakdown).length, gradient: 'from-amber-500 to-yellow-400', icon: '🎭', glow: 'amber' },
  ]

  return (
    <main className="min-h-screen relative" style={{ background: '#050510' }}>
      <Particles />

      {/* Animated gradient lines */}
      <div className="fixed top-0 left-0 right-0 h-px z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">🧠</div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            {[
              { href: '/dashboard', label: t('dashboard') },
              { href: '/chat', label: t('chat') },
              { href: '/memories', label: t('memories') },
            ].map(link => (
              <Link key={link.href} href={link.href} className="text-sm text-white/30 hover:text-white transition-all duration-300 relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto relative z-10 pb-16">
        {/* Header */}
        <div className="mb-12 animate-[fadeInUp_0.6s_ease-out]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs text-violet-300/80">{t('analytics')}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">{t('analytics')}</span>
          </h1>
          <p className="text-white/25 text-lg">{t('soul sync')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {statCards.map((stat, i) => (
            <GlowCard key={stat.label} glowColor={stat.glow} className="p-6 text-center">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br opacity-[0.08] blur-2xl" style={{ background: `radial-gradient(circle, ${stat.glow === 'violet' ? '#8b5cf6' : stat.glow === 'fuchsia' ? '#d946ef' : stat.glow === 'cyan' ? '#06b6d4' : '#f59e0b'}, transparent)` }} />
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
              <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>{stat.value}</div>
              <div className="text-white/25 text-xs font-medium uppercase tracking-wider">{stat.label}</div>
            </GlowCard>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Category Breakdown */}
          <GlowCard glowColor="violet" className="p-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm">📝</span>
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('memories')}</span>
            </h2>
            {stats.topCategories.length === 0 ? (
              <p className="text-white/20 text-center py-12 text-sm">{t('no data')}</p>
            ) : (
              <div className="space-y-6">
                {stats.topCategories.map(([category, count], i) => (
                  <div key={category} className="group">
                    <div className="flex justify-between text-sm mb-2.5">
                      <span className="text-white/60 capitalize font-medium">{category.replace('_', ' ')}</span>
                      <span className="text-white/30 font-mono text-xs">{count}</span>
                    </div>
                    <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          background: 'linear-gradient(90deg, #8b5cf6, #d946ef, #06b6d4)',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>

          {/* Mood Distribution */}
          <GlowCard glowColor="fuchsia" className="p-8">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl" />
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-sm">😊</span>
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('mood')}</span>
            </h2>
            {Object.keys(stats.moodBreakdown).length === 0 ? (
              <p className="text-white/20 text-center py-12 text-sm">{t('no data')}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.moodBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([mood, count]) => (
                    <div
                      key={mood}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 hover:shadow-[0_0_20px_rgba(217,70,239,0.1)] transition-all duration-300 hover:scale-105 cursor-default"
                    >
                      <span className="text-2xl">{mood}</span>
                      <span className="text-white/40 text-sm font-mono">×{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </GlowCard>
        </div>

        {/* Recent Activity */}
        <GlowCard glowColor="cyan" className="p-8 mb-12">
          <div className="absolute top-0 left-1/2 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -translate-x-1/2" />
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-sm">🕐</span>
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('heartbeat')}</span>
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p className="text-white/20 text-center py-12 text-sm">{t('no data')}</p>
          ) : (
            <div className="space-y-2">
              {stats.recentActivity.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 px-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10 flex items-center justify-center text-xl group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300">
                    {item.role ? '💬' : item.mood || '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-sm truncate group-hover:text-white/70 transition-colors">
                      {item.role ? `${t('chat')}: ${item.content}` : `${t('memories')}: ${item.content}`}
                    </p>
                    <p className="text-white/15 text-xs mt-1">
                      {item.category && `${item.category} • `}{new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400/0 group-hover:bg-violet-400/60 transition-all duration-300" />
                </div>
              ))}
            </div>
          )}
        </GlowCard>

        {/* Insights */}
        <GlowCard glowColor="violet" className="p-8">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl" />
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-sm">💡</span>
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('analytics')}</span>
          </h2>
          <div className="space-y-3 text-white/40 text-sm">
            {stats.totalMemories < 5 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">📝</span>
                <p>{t('new memory')}</p>
              </div>
            )}
            {stats.totalMemories >= 5 && stats.totalMemories < 20 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">🧬</span>
                <p>{t('life score')}</p>
              </div>
            )}
            {stats.totalMemories >= 20 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">✨</span>
                <p>{t('achievements')}</p>
              </div>
            )}
            {stats.totalChats > 10 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">💬</span>
                <p>{t('clone quiz')}</p>
              </div>
            )}
            {Object.keys(stats.categoryBreakdown).length < 3 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">🌈</span>
                <p>{t('idea generator')}</p>
              </div>
            )}
            {stats.topCategories.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
                <span className="text-lg">📊</span>
                <p>{t('memory dna')} <strong className="text-white/60">{stats.topCategories[0][0].replace('_', ' ')}</strong> — {stats.topCategories[0][1]} {t('memories')}</p>
              </div>
            )}
          </div>
        </GlowCard>
      </div>

      <style jsx global>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(20px); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
