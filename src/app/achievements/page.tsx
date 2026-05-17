'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'memory' | 'chat' | 'streak' | 'special'
  requirement: number
  unlocked: boolean
  unlockedAt?: string
  progress: number
}

const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  { id: 'mem-10', name: 'Memory Starter', description: 'Save your first 10 memories', icon: '📝', category: 'memory', requirement: 10 },
  { id: 'mem-50', name: 'Memory Collector', description: 'Save 50 memories', icon: '📚', category: 'memory', requirement: 50 },
  { id: 'mem-100', name: 'Memory Keeper', description: 'Save 100 memories', icon: '🏛️', category: 'memory', requirement: 100 },
  { id: 'mem-500', name: 'Memory Legend', description: 'Save 500 memories', icon: '🌟', category: 'memory', requirement: 500 },
  { id: 'chat-10', name: 'First Conversations', description: 'Have 10 chat messages', icon: '💬', category: 'chat', requirement: 10 },
  { id: 'chat-50', name: 'Chat Regular', description: 'Have 50 chat messages', icon: '🗣️', category: 'chat', requirement: 50 },
  { id: 'chat-100', name: 'Chat Master', description: 'Have 100 chat messages', icon: '🎭', category: 'chat', requirement: 100 },
  { id: 'streak-3', name: 'Consistent', description: '3-day login streak', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak-7', name: 'Dedicated', description: '7-day login streak', icon: '⚡', category: 'streak', requirement: 7 },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day login streak', icon: '💎', category: 'streak', requirement: 30 },
  { id: 'special-first-memory', name: 'Genesis', description: 'Save your very first memory', icon: '🌱', category: 'special', requirement: 1 },
  { id: 'special-quiz-master', name: 'Quiz Master', description: 'Score 100% on the clone quiz', icon: '🧠', category: 'special', requirement: 1 },
  { id: 'special-life-story', name: 'Biographer', description: 'Generate your life story', icon: '📖', category: 'special', requirement: 1 },
  { id: 'special-public', name: 'Public Figure', description: 'Make your clone profile public', icon: '🌍', category: 'special', requirement: 1 },
  { id: 'special-future', name: 'Time Traveler', description: 'Chat with your future self', icon: '🔮', category: 'special', requirement: 1 },
  { id: 'special-dreamer', name: 'Dreamer', description: 'Record your first dream', icon: '🌙', category: 'special', requirement: 1 },
]

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '🏆' },
  { key: 'memory', label: 'Memory', icon: '📝' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'streak', label: 'Streak', icon: '🔥' },
  { key: 'special', label: 'Special', icon: '✨' },
]

const STORAGE_KEY = 'consciousness-achievements'

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: i % 2 === 0 ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)',
          '--duration': `${7 + Math.random() * 6}s`, '--delay': `${Math.random() * 4}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

export default function AchievementsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      let unlockedMap: Record<string, string> = {}
      try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) unlockedMap = JSON.parse(stored) } catch {}

      const memoryCount = parseInt(localStorage.getItem('consciousness-memory-count') || '0')
      const chatCount = parseInt(localStorage.getItem('consciousness-chat-count') || '0')
      const streakCount = parseInt(localStorage.getItem('consciousness-streak') || '0')
      const specialFlags = JSON.parse(localStorage.getItem('consciousness-special-flags') || '{}')

      const progressMap: Record<string, number> = {}
      progressMap['mem-10'] = memoryCount; progressMap['mem-50'] = memoryCount; progressMap['mem-100'] = memoryCount; progressMap['mem-500'] = memoryCount
      progressMap['chat-10'] = chatCount; progressMap['chat-50'] = chatCount; progressMap['chat-100'] = chatCount
      progressMap['streak-3'] = streakCount; progressMap['streak-7'] = streakCount; progressMap['streak-30'] = streakCount
      progressMap['special-first-memory'] = memoryCount > 0 ? 1 : 0
      progressMap['special-quiz-master'] = specialFlags.quizMaster ? 1 : 0
      progressMap['special-life-story'] = specialFlags.lifeStory ? 1 : 0
      progressMap['special-public'] = specialFlags.publicProfile ? 1 : 0
      progressMap['special-future'] = specialFlags.futureSelf ? 1 : 0
      progressMap['special-dreamer'] = specialFlags.dreamer ? 1 : 0

      const built = ALL_ACHIEVEMENTS.map(a => ({
        ...a, progress: Math.min(progressMap[a.id] || 0, a.requirement), unlocked: !!unlockedMap[a.id], unlockedAt: unlockedMap[a.id],
      }))

      const newUnlocked = { ...unlockedMap }
      let changed = false
      built.forEach(a => {
        if (!a.unlocked && a.progress >= a.requirement) {
          a.unlocked = true; a.unlockedAt = new Date().toISOString(); newUnlocked[a.id] = a.unlockedAt; changed = true
        }
      })
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnlocked))

      setAchievements(built)
      setLoading(false)
    }
    init()
  }, [])

  const filtered = useMemo(() => filter === 'all' ? achievements : achievements.filter(a => a.category === filter), [achievements, filter])

  const stats = useMemo(() => {
    const unlocked = achievements.filter(a => a.unlocked).length
    const total = achievements.length
    const points = achievements.filter(a => a.unlocked).reduce((sum, a) => {
      const rarity = a.category === 'special' ? 50 : a.requirement >= 100 ? 30 : a.requirement >= 50 ? 20 : a.requirement >= 10 ? 10 : 5
      return sum + rarity
    }, 0)
    return { unlocked, total, points }
  }, [achievements])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <FloatingParticles />
      <div className="ambient-orb ambient-orb-violet" style={{ width: 250, height: 250, top: '5%', left: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '15%', right: '-8%' }} />

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold gradient-text">Achievements</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 stagger-children">
          <div className="glass-card hover-lift rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-400">{stats.unlocked}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Unlocked</div>
          </div>
          <div className="glass-card hover-lift rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Total</div>
          </div>
          <div className="glass-card hover-lift rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">⭐ {stats.points}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span className="font-medium">Completion</span>
            <span className="font-mono text-violet-400">{Math.round((stats.unlocked / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div className="premium-progress bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${(stats.unlocked / stats.total) * 100}%` }} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setFilter(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                filter === cat.key
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'glass-card text-white/40 hover:text-white/60'
              }`}>
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="space-y-3 stagger-children">
          {filtered.map(achievement => {
            const progressPct = Math.min((achievement.progress / achievement.requirement) * 100, 100)
            const rarity = achievement.category === 'special' ? 'Legendary' : achievement.requirement >= 100 ? 'Epic' : achievement.requirement >= 50 ? 'Rare' : 'Common'
            const rarityColor = rarity === 'Legendary' ? 'text-yellow-300' : rarity === 'Epic' ? 'text-violet-400' : rarity === 'Rare' ? 'text-blue-400' : 'text-white/40'

            return (
              <div key={achievement.id} className={`rounded-2xl p-4 transition-all duration-300 ${
                achievement.unlocked
                  ? 'gradient-border-card bg-gradient-to-r from-violet-500/10 to-amber-500/10 hover-lift'
                  : 'glass-card hover-lift'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    achievement.unlocked ? 'bg-gradient-to-br from-violet-500/20 to-amber-500/20 shadow-lg shadow-violet-500/10' : 'bg-white/5 grayscale opacity-40'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>{achievement.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full glass-card ${rarityColor}`}>{rarity}</span>
                      {achievement.unlocked && <span className="text-emerald-400 text-xs">✓</span>}
                    </div>
                    <p className={`text-xs mt-1 ${achievement.unlocked ? 'text-white/50' : 'text-white/25'}`}>{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-3">
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div className="premium-progress bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="text-[10px] text-white/20 mt-1 font-mono">{achievement.progress}/{achievement.requirement}</div>
                      </div>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-[10px] text-white/20 mt-1">Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-white/20">No achievements in this category</p>
          </div>
        )}
      </div>
    </main>
  )
}
