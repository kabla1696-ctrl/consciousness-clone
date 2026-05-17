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
  // Memory milestones
  { id: 'mem-10', name: 'Memory Starter', description: 'Save your first 10 memories', icon: '📝', category: 'memory', requirement: 10 },
  { id: 'mem-50', name: 'Memory Collector', description: 'Save 50 memories', icon: '📚', category: 'memory', requirement: 50 },
  { id: 'mem-100', name: 'Memory Keeper', description: 'Save 100 memories', icon: '🏛️', category: 'memory', requirement: 100 },
  { id: 'mem-500', name: 'Memory Legend', description: 'Save 500 memories', icon: '🌟', category: 'memory', requirement: 500 },
  // Chat milestones
  { id: 'chat-10', name: 'First Conversations', description: 'Have 10 chat messages', icon: '💬', category: 'chat', requirement: 10 },
  { id: 'chat-50', name: 'Chat Regular', description: 'Have 50 chat messages', icon: '🗣️', category: 'chat', requirement: 50 },
  { id: 'chat-100', name: 'Chat Master', description: 'Have 100 chat messages', icon: '🎭', category: 'chat', requirement: 100 },
  // Streaks
  { id: 'streak-3', name: 'Consistent', description: '3-day login streak', icon: '🔥', category: 'streak', requirement: 3 },
  { id: 'streak-7', name: 'Dedicated', description: '7-day login streak', icon: '⚡', category: 'streak', requirement: 7 },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day login streak', icon: '💎', category: 'streak', requirement: 30 },
  // Special
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

      // Load unlocked achievements
      let unlockedMap: Record<string, string> = {}
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) unlockedMap = JSON.parse(stored)
      } catch {}

      // Calculate progress from actual data
      const memoryCount = parseInt(localStorage.getItem('consciousness-memory-count') || '0')
      const chatCount = parseInt(localStorage.getItem('consciousness-chat-count') || '0')
      const streakCount = parseInt(localStorage.getItem('consciousness-streak') || '0')
      const specialFlags = JSON.parse(localStorage.getItem('consciousness-special-flags') || '{}')

      const progressMap: Record<string, number> = {}
      // Memory achievements
      progressMap['mem-10'] = memoryCount
      progressMap['mem-50'] = memoryCount
      progressMap['mem-100'] = memoryCount
      progressMap['mem-500'] = memoryCount
      // Chat achievements
      progressMap['chat-10'] = chatCount
      progressMap['chat-50'] = chatCount
      progressMap['chat-100'] = chatCount
      // Streak achievements
      progressMap['streak-3'] = streakCount
      progressMap['streak-7'] = streakCount
      progressMap['streak-30'] = streakCount
      // Special achievements
      progressMap['special-first-memory'] = memoryCount > 0 ? 1 : 0
      progressMap['special-quiz-master'] = specialFlags.quizMaster ? 1 : 0
      progressMap['special-life-story'] = specialFlags.lifeStory ? 1 : 0
      progressMap['special-public'] = specialFlags.publicProfile ? 1 : 0
      progressMap['special-future'] = specialFlags.futureSelf ? 1 : 0
      progressMap['special-dreamer'] = specialFlags.dreamer ? 1 : 0

      const built = ALL_ACHIEVEMENTS.map(a => ({
        ...a,
        progress: Math.min(progressMap[a.id] || 0, a.requirement),
        unlocked: !!unlockedMap[a.id],
        unlockedAt: unlockedMap[a.id],
      }))

      // Auto-unlock achievements that meet requirements
      const newUnlocked = { ...unlockedMap }
      let changed = false
      built.forEach(a => {
        if (!a.unlocked && a.progress >= a.requirement) {
          a.unlocked = true
          a.unlockedAt = new Date().toISOString()
          newUnlocked[a.id] = a.unlockedAt
          changed = true
        }
      })
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnlocked))

      setAchievements(built)
      setLoading(false)
    }
    init()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return achievements
    return achievements.filter(a => a.category === filter)
  }, [achievements, filter])

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
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">Achievements</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-2xl font-bold text-violet-400">{stats.unlocked}</div>
            <div className="text-[10px] text-white/30 uppercase">Unlocked</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-white/30 uppercase">Total</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">⭐ {stats.points}</div>
            <div className="text-[10px] text-white/30 uppercase">Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Completion</span>
            <span>{Math.round((stats.unlocked / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div className="bg-gradient-to-r from-violet-500 to-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(stats.unlocked / stats.total) * 100}%` }} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                filter === cat.key
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="space-y-3">
          {filtered.map(achievement => {
            const progressPct = Math.min((achievement.progress / achievement.requirement) * 100, 100)
            const rarity = achievement.category === 'special' ? 'Legendary' : achievement.requirement >= 100 ? 'Epic' : achievement.requirement >= 50 ? 'Rare' : 'Common'
            const rarityColor = rarity === 'Legendary' ? 'text-yellow-300' : rarity === 'Epic' ? 'text-violet-400' : rarity === 'Rare' ? 'text-blue-400' : 'text-white/40'

            return (
              <div
                key={achievement.id}
                className={`rounded-xl border p-4 transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-violet-500/10 to-amber-500/10 border-violet-500/20'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    achievement.unlocked ? 'bg-violet-500/20' : 'bg-white/5 grayscale opacity-40'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
                        {achievement.name}
                      </h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 ${rarityColor}`}>{rarity}</span>
                      {achievement.unlocked && <span className="text-emerald-400 text-xs">✓</span>}
                    </div>
                    <p className={`text-xs mt-0.5 ${achievement.unlocked ? 'text-white/50' : 'text-white/25'}`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div className="bg-violet-500/60 h-1.5 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="text-[10px] text-white/20 mt-0.5">{achievement.progress}/{achievement.requirement}</div>
                      </div>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <div className="text-[10px] text-white/20 mt-1">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/20">
            <div className="text-4xl mb-2">🏆</div>
            <p>No achievements in this category</p>
          </div>
        )}
      </div>
    </main>
  )
}
