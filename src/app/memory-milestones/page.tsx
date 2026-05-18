'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Milestone { id: string; icon: string; title: string; desc: string; target: number; current: number; xp: number; unlocked: boolean; category: string }

const ALL_MILESTONES: Omit<Milestone, 'current' | 'unlocked'>[] = [
  { id: 'mem10', icon: '📝', title: 'Memory Keeper', desc: 'Add 10 memories', target: 10, xp: 50, category: 'memories' },
  { id: 'mem50', icon: '📚', title: 'Memory Collector', desc: 'Add 50 memories', target: 50, xp: 200, category: 'memories' },
  { id: 'mem100', icon: '🏛️', title: 'Memory Library', desc: 'Add 100 memories', target: 100, xp: 500, category: 'memories' },
  { id: 'mem500', icon: '🌌', title: 'Memory Universe', desc: 'Add 500 memories', target: 500, xp: 2000, category: 'memories' },
  { id: 'streak7', icon: '🔥', title: 'Week Warrior', desc: '7-day streak', target: 7, xp: 100, category: 'streak' },
  { id: 'streak30', icon: '💪', title: 'Monthly Master', desc: '30-day streak', target: 30, xp: 500, category: 'streak' },
  { id: 'streak365', icon: '👑', title: 'Year Legend', desc: '365-day streak', target: 365, xp: 5000, category: 'streak' },
  { id: 'chat10', icon: '💬', title: 'Chatterbox', desc: '10 chat messages', target: 10, xp: 50, category: 'chat' },
  { id: 'chat100', icon: '🗣️', title: 'Deep Talker', desc: '100 chat messages', target: 100, xp: 300, category: 'chat' },
  { id: 'mood7', icon: '🎭', title: 'Mood Tracker', desc: 'Log mood 7 times', target: 7, xp: 75, category: 'mood' },
  { id: 'mood30', icon: '📊', title: 'Mood Master', desc: 'Log mood 30 times', target: 30, xp: 250, category: 'mood' },
  { id: 'people5', icon: '👥', title: 'Social Circle', desc: 'Add 5 people', target: 5, xp: 100, category: 'people' },
  { id: 'people20', icon: '🌍', title: 'Connected', desc: 'Add 20 people', target: 20, xp: 400, category: 'people' },
  { id: 'feature5', icon: '🎯', title: 'Explorer', desc: 'Use 5 features', target: 5, xp: 75, category: 'features' },
  { id: 'feature20', icon: '🚀', title: 'Power User', desc: 'Use 20 features', target: 20, xp: 500, category: 'features' },
  { id: 'quiz1', icon: '🎮', title: 'Quiz Taker', desc: 'Complete a quiz', target: 1, xp: 50, category: 'quiz' },
  { id: 'dream1', icon: '🌙', title: 'Dreamer', desc: 'Record a dream', target: 1, xp: 50, category: 'dreams' },
  { id: 'goal1', icon: '🎯', title: 'Goal Setter', desc: 'Set a goal', target: 1, xp: 50, category: 'goals' },
  { id: 'voice1', icon: '🎤', title: 'Voice Heard', desc: 'Record a voice journal', target: 1, xp: 50, category: 'voice' },
  { id: 'family1', icon: '👨‍👩‍👧‍👦', title: 'Family Tree', desc: 'Add family members', target: 1, xp: 50, category: 'family' },
]

export default function MemoryMilestones() {
  const t = useT();
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [totalXP, setTotalXP] = useState(0)
  const [filter, setFilter] = useState('all')
  const [showCelebration, setShowCelebration] = useState<string | null>(null)

  useEffect(() => {
    const memCount = parseInt(localStorage.getItem('cc_memory_count') || '0')
    const chatCount = parseInt(localStorage.getItem('cc_chat_count') || '0')
    const moodCount = parseInt(localStorage.getItem('cc_mood_count') || '0')
    const streak = parseInt(localStorage.getItem('cc_streak') || '0')
    const peopleCount = parseInt(localStorage.getItem('cc_people_count') || '0')
    const featureCount = parseInt(localStorage.getItem('cc_features_used') || '0')
    const quizDone = localStorage.getItem('cc_quiz_done') === 'true' ? 1 : 0
    const dreamCount = parseInt(localStorage.getItem('cc_dream_count') || '0')
    const goalCount = parseInt(localStorage.getItem('cc_goal_count') || '0')
    const voiceCount = parseInt(localStorage.getItem('cc_voice_count') || '0')
    const familyCount = parseInt(localStorage.getItem('cc_family_count') || '0')

    const counts: Record<string, number> = {
      memories: memCount, streak, chat: chatCount, mood: moodCount,
      people: peopleCount, features: featureCount, quiz: quizDone,
      dreams: dreamCount, goals: goalCount, voice: voiceCount, family: familyCount,
    }

    const saved = localStorage.getItem('cc_unlocked_milestones')
    const unlocked = saved ? JSON.parse(saved) : []

    const updated = ALL_MILESTONES.map(m => {
      const current = counts[m.category] || 0
      const justUnlocked = current >= m.target && !unlocked.includes(m.id)
      if (justUnlocked) { unlocked.push(m.id); setShowCelebration(m.id) }
      return { ...m, current, unlocked: current >= m.target }
    })

    setMilestones(updated)
    setTotalXP(updated.filter(m => m.unlocked).reduce((sum, m) => sum + m.xp, 0))
    localStorage.setItem('cc_unlocked_milestones', JSON.stringify(unlocked))
  }, [])

  const filtered = filter === 'all' ? milestones : filter === 'unlocked' ? milestones.filter(m => m.unlocked) : milestones.filter(m => !m.unlocked)
  const unlockPct = Math.round((milestones.filter(m => m.unlocked).length / milestones.length) * 100)

  const CATEGORIES = ['all', 'unlocked', 'memories', 'streak', 'chat', 'mood', 'people', 'features']

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1 + 'px', height: Math.random() * 4 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: ['rgba(234,179,8,0.4)', 'rgba(245,158,11,0.3)', 'rgba(251,191,36,0.3)'][i % 3], animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">🏆</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400">{t('milestones')}</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'xp', value: totalXP.toLocaleString(), color: 'text-amber-400' },
            { label: 'unlocked', value: `${milestones.filter(m => m.unlocked).length}/${milestones.length}`, color: 'text-emerald-400' },
            { label: 'level', value: `${unlockPct}%`, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-white/30 text-[10px]">{t(s.label)}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="rounded-xl border border-white/[0.06] p-4 mb-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/40 text-xs">{t('level')}</span>
            <span className="text-amber-400 text-xs font-medium">{unlockPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.05]">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-1000" style={{ width: `${unlockPct}%` }} />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2 scroll-container">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap tap-feedback ${filter === c ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border capitalize`}>{c}</button>
          ))}
        </div>

        {/* Milestones */}
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} className={`rounded-xl border p-4 backdrop-blur-xl transition-all ${m.unlocked ? 'border-amber-500/20' : 'border-white/[0.06]'}`} style={{ background: m.unlocked ? 'rgba(245,158,11,0.03)' : 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${m.unlocked ? '' : 'grayscale opacity-40'}`} style={{ background: m.unlocked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)' }}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${m.unlocked ? 'text-amber-400' : 'text-white/60'}`}>{m.title}</span>
                    {m.unlocked && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">✓</span>}
                  </div>
                  <p className="text-white/30 text-xs">{m.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }} />
                    </div>
                    <span className="text-white/20 text-[10px]">{m.current}/{m.target}</span>
                  </div>
                  <span className="text-amber-400/40 text-[10px]">+{m.xp} XP</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowCelebration(null)}>
          <div className="text-center" style={{ animation: 'float-subtle 2s ease-in-out' }}>
            <div aria-hidden="true" className="text-8xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-400 mb-2">{t('milestones')} {t('unlocked')}!</h2>
            <p className="text-white/60 text-lg">{milestones.find(m => m.id === showCelebration)?.title}</p>
            <p className="text-amber-400 text-sm mt-1">+{milestones.find(m => m.id === showCelebration)?.xp} XP</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
      `}</style>
    </main>
  )
}