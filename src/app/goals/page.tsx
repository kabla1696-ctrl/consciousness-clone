'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Goal {
  id: string
  title: string
  description: string
  deadline: string
  category: string
  status: 'not_started' | 'in_progress' | 'completed'
  createdAt: string
  streak: number
  lastUpdated: string
}

const CATEGORIES = [
  { key: 'career', label: 'Career', icon: '💼', color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { key: 'health', label: 'Health', icon: '🏃', color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { key: 'education', label: 'Education', icon: '📚', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  { key: 'personal', label: 'Personal', icon: '🌱', color: '#ec4899', glow: 'rgba(236,72,153,0.3)' },
  { key: 'financial', label: 'Financial', icon: '💰', color: '#06b6d4', glow: 'rgba(6,182,212,0.3)' },
]

const STATUS_OPTIONS = [
  { key: 'not_started', label: 'Not Started', color: 'bg-white/[0.06] text-white/40 border border-white/[0.06]' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-violet-500/15 text-violet-400 border border-violet-500/20' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
]

const STORAGE_KEY = 'consciousness-goals'

export default function GoalsPage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [aiAdvice, setAiAdvice] = useState<Record<string, string>>({})
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<string>('all')

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('personal')
  const [status, setStatus] = useState<Goal['status']>('not_started')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setGoals(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  }, [goals, loading])

  const updateStreak = (goal: Goal): Goal => {
    const now = new Date()
    const last = new Date(goal.lastUpdated)
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 1 && goal.status === 'in_progress') {
      return { ...goal, streak: goal.streak + 1, lastUpdated: now.toISOString() }
    }
    if (diffDays > 2) {
      return { ...goal, streak: 0, lastUpdated: now.toISOString() }
    }
    return { ...goal, lastUpdated: now.toISOString() }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDeadline('')
    setCategory('personal')
    setStatus('not_started')
    setEditingId(null)
  }

  const handleSave = () => {
    if (!title.trim()) return

    if (editingId) {
      setGoals(prev => prev.map(g =>
        g.id === editingId
          ? { ...g, title: title.trim(), description: description.trim(), deadline, category, status: updateStreak({ ...g, status }).status, lastUpdated: new Date().toISOString() }
          : g
      ))
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        deadline,
        category,
        status,
        createdAt: new Date().toISOString(),
        streak: 0,
        lastUpdated: new Date().toISOString(),
      }
      setGoals(prev => [newGoal, ...prev])
    }
    resetForm()
    setShowAdd(false)
  }

  const handleEdit = (goal: Goal) => {
    setTitle(goal.title)
    setDescription(goal.description)
    setDeadline(goal.deadline)
    setCategory(goal.category)
    setStatus(goal.status)
    setEditingId(goal.id)
    setShowAdd(true)
  }

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: Goal['status']) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g
      const updated = updateStreak({ ...g, status: newStatus })
      return updated
    }))
  }

  const handleGetAdvice = async (goal: Goal) => {
    setAiLoading(prev => ({ ...prev, [goal.id]: true }))
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I have a goal: "${goal.title}". ${goal.description ? `Description: ${goal.description}.` : ''} Category: ${goal.category}. Status: ${goal.status}. ${goal.deadline ? `Deadline: ${goal.deadline}.` : ''} Give me a short, personalized motivational advice (max 3 sentences) to help me achieve this goal.`,
        }),
      })
      const data = await res.json()
      setAiAdvice(prev => ({ ...prev, [goal.id]: data.reply || 'Keep pushing forward! You\'ve got this.' }))
    } catch {
      setAiAdvice(prev => ({ ...prev, [goal.id]: 'Keep pushing forward! Every step counts.' }))
    }
    setAiLoading(prev => ({ ...prev, [goal.id]: false }))
  }

  const filteredGoals = useMemo(() => {
    if (filter === 'all') return goals
    if (filter === 'active') return goals.filter(g => g.status !== 'completed')
    return goals.filter(g => g.category === filter)
  }, [goals, filter])

  const stats = useMemo(() => {
    const total = goals.length
    const completed = goals.filter(g => g.status === 'completed').length
    const inProgress = goals.filter(g => g.status === 'in_progress').length
    const maxStreak = goals.reduce((max, g) => Math.max(max, g.streak), 0)
    return { total, completed, inProgress, maxStreak, progress: total > 0 ? Math.round((completed / total) * 100) : 0 }
  }, [goals])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-fuchsia-500/10 border-b-fuchsia-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#06060e] relative">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-fuchsia-900/15 blur-[100px]" />
        <div className="absolute top-[50%] left-[30%] w-[25vw] h-[25vw] rounded-full bg-indigo-900/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#06060e]/60 border-b border-white/[0.06]">
        <div className="px-5 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback w-10 h-10 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 group">
            <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="text-xl drop-shadow-lg">🎯</span>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('life goals')}</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { resetForm(); setShowAdd(!showAdd) }}
            className="relative overflow-hidden text-sm px-4 py-2 rounded-xl tap-feedback group"
          >
            <div className="absolute inset-0 bg-violet-500/15 backdrop-blur-xl" />
            <div className="absolute inset-0 rounded-xl border border-violet-500/25 group-hover:border-violet-500/40 transition-colors duration-300" />
            <span className="relative text-violet-400 font-semibold">{showAdd ? '✕' : '+ ' + t('add goal')}</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 px-5 py-4 pb-24">
        {/* Stats Overview */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Total Goals', value: stats.total, color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)' },
              { label: 'Completed', value: stats.completed, color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
              { label: 'Best Streak', value: `🔥 ${stats.maxStreak}`, color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
              { label: t('achieve'), value: `${stats.progress}%`, color: '#06b6d4', glow: 'rgba(6,182,212,0.25)' },
            ].map((stat, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.015]" />
                <div className="absolute inset-0 rounded-2xl border border-white/[0.05] group-hover:border-white/[0.1] transition-colors duration-300" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <div className="relative p-4">
                  <div className="text-2xl font-black" style={{ color: stat.color, textShadow: `0 0 20px ${stat.glow}` }}>{stat.value}</div>
                  <div className="text-[11px] text-white/30 font-medium mt-0.5">{stat.label}</div>
                  {stat.label === 'Completion' && (
                    <div className="mt-2.5 h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${stats.progress}%` }}>
                        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAdd && (
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-violet-600/5 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.01]" />
            <div className="absolute inset-0 rounded-2xl border border-violet-500/20" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            <div className="relative p-5 space-y-4">
              <h3 className="text-sm font-bold text-violet-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">✨</span>
                {editingId ? 'Edit Goal' : 'New Goal'}
              </h3>

              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block font-medium tracking-wide uppercase">Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={t('goal placeholder')}
                  className="w-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all duration-300"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block font-medium tracking-wide uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={t('goal details')}
                  rows={2}
                  className="w-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.04] transition-all duration-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block font-medium tracking-wide uppercase">Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 transition-all duration-300 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/30 mb-1.5 block font-medium tracking-wide uppercase">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as Goal['status'])}
                    className="w-full backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/40 transition-all duration-300 [color-scheme:dark]"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/30 mb-2 block font-medium tracking-wide uppercase">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key)}
                      className={`text-xs px-3.5 py-1.5 rounded-full tap-feedback transition-all duration-300 ${
                        category === cat.key
                          ? 'text-white font-semibold border'
                          : 'bg-white/[0.03] text-white/35 border border-white/[0.06] hover:border-white/[0.12]'
                      }`}
                      style={category === cat.key ? { background: `${cat.color}20`, borderColor: `${cat.color}40`, color: cat.color } : {}}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="w-full relative overflow-hidden py-3.5 rounded-2xl tap-feedback disabled:opacity-30 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 rounded-2xl border border-white/10" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative text-white font-semibold text-sm drop-shadow-lg">{editingId ? '💾 Update Goal' : '✨ Create Goal'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {goals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              ...CATEGORIES.map(c => ({ key: c.key, label: `${c.icon} ${c.label}` })),
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap tap-feedback transition-all duration-300 ${
                  filter === f.key
                    ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-lg shadow-violet-500/10'
                    : 'text-white/30 bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {filteredGoals.map(goal => {
            const catInfo = CATEGORIES.find(c => c.key === goal.category)
            const statusInfo = STATUS_OPTIONS.find(s => s.key === goal.status)
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null
            const isOverdue = daysLeft !== null && daysLeft < 0

            return (
              <div key={goal.id} className="relative rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.015]" />
                <div
                  className="absolute inset-0 rounded-2xl border transition-colors duration-300"
                  style={{
                    borderColor: goal.status === 'completed'
                      ? 'rgba(16,185,129,0.15)'
                      : isOverdue
                      ? 'rgba(239,68,68,0.15)'
                      : 'rgba(255,255,255,0.05)',
                  }}
                />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                {goal.status === 'completed' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent pointer-events-none" />
                )}
                {isOverdue && (
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
                )}
                <div className="relative p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${catInfo?.color || '#8b5cf6'}12`, border: `1px solid ${catInfo?.color || '#8b5cf6'}25` }}
                    >
                      {catInfo?.icon || '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold ${goal.status === 'completed' ? 'text-white/35 line-through' : 'text-white/90'}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-white/25 mt-0.5 line-clamp-2">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                        {goal.streak > 0 && (
                          <span className="text-[10px] text-amber-400 font-medium">🔥 {goal.streak}d streak</span>
                        )}
                        {daysLeft !== null && (
                          <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-400' : daysLeft < 7 ? 'text-amber-400' : 'text-white/15'}`}>
                            {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.03]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: goal.status === 'completed' ? '100%' : goal.status === 'in_progress' ? '50%' : '5%',
                          background: goal.status === 'completed'
                            ? '#10b981'
                            : goal.status === 'in_progress'
                            ? 'linear-gradient(to right, #8b5cf6, #d946ef)'
                            : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {goal.status !== 'completed' && (
                      <button
                        onClick={() => handleStatusChange(goal.id, goal.status === 'not_started' ? 'in_progress' : 'completed')}
                        className="text-[10px] px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 tap-feedback border border-violet-500/15 hover:bg-violet-500/20 transition-all duration-300 font-medium"
                      >
                        {goal.status === 'not_started' ? '▶ Start' : '✓ Complete'}
                      </button>
                    )}
                    <button
                      onClick={() => handleGetAdvice(goal)}
                      disabled={aiLoading[goal.id]}
                      className="text-[10px] px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 tap-feedback disabled:opacity-30 border border-amber-500/15 hover:bg-amber-500/20 transition-all duration-300 font-medium"
                    >
                      {aiLoading[goal.id] ? '⏳' : '🤖'} AI Advice
                    </button>
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-[10px] px-3 py-1.5 rounded-lg bg-white/[0.03] text-white/35 tap-feedback border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/50 transition-all duration-300"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-[10px] px-3 py-1.5 rounded-lg bg-red-500/8 text-red-400/50 tap-feedback border border-red-500/10 hover:bg-red-500/15 transition-all duration-300"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* AI Advice */}
                  {aiAdvice[goal.id] && (
                    <div className="mt-3 relative rounded-xl">
                      <div className="absolute inset-0 bg-amber-500/[0.04]" />
                      <div className="absolute inset-0 rounded-xl border border-amber-500/15" />
                      <div className="relative p-3.5">
                        <div className="text-[10px] text-amber-400 mb-1.5 font-semibold flex items-center gap-1.5">🤖 AI Motivation</div>
                        <p className="text-xs text-white/50 leading-relaxed">{aiAdvice[goal.id]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {goals.length === 0 && !showAdd && (
          <div className="text-center py-20">
            <div className="text-7xl mb-5 drop-shadow-lg">🎯</div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">{t('life goals')}</h2>
            <p className="text-white/25 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              {t('track')} {t('achieve')}. {t('progress')}.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="relative overflow-hidden px-7 py-3.5 rounded-2xl tap-feedback group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative text-white font-semibold text-sm drop-shadow-lg">+ Create Your First Goal</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
