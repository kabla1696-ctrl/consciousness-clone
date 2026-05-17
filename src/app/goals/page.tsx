'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  { key: 'career', label: 'Career', icon: '💼', color: 'text-blue-400' },
  { key: 'health', label: 'Health', icon: '🏃', color: 'text-emerald-400' },
  { key: 'education', label: 'Education', icon: '📚', color: 'text-amber-400' },
  { key: 'personal', label: 'Personal', icon: '🌱', color: 'text-pink-400' },
  { key: 'financial', label: 'Financial', icon: '💰', color: 'text-cyan-400' },
]

const STATUS_OPTIONS = [
  { key: 'not_started', label: 'Not Started', color: 'bg-white/10 text-white/40' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-violet-500/20 text-violet-400' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400' },
]

const STORAGE_KEY = 'consciousness-goals'

export default function GoalsPage() {
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
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h1 className="text-lg font-bold">Life Goals</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { resetForm(); setShowAdd(!showAdd) }}
            className="text-sm bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg tap-feedback"
          >
            {showAdd ? '✕' : '+ Add'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Stats Overview */}
        {goals.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="text-2xl font-bold text-violet-400">{stats.total}</div>
              <div className="text-xs text-white/40">Total Goals</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-xs text-white/40">Completed</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="text-2xl font-bold text-amber-400">🔥 {stats.maxStreak}</div>
              <div className="text-xs text-white/40">Best Streak</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="text-2xl font-bold text-cyan-400">{stats.progress}%</div>
              <div className="text-xs text-white/40">Completion</div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAdd && (
          <div className="rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-violet-400">{editingId ? 'Edit Goal' : 'New Goal'}</h3>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="More details about this goal..."
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Goal['status'])}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Category</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategory(cat.key)}
                    className={`text-xs px-3 py-1.5 rounded-full tap-feedback ${
                      category === cat.key
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                        : 'bg-white/[0.04] text-white/40 border border-white/[0.08]'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40"
            >
              {editingId ? '💾 Update Goal' : '✨ Create Goal'}
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        {goals.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              ...CATEGORIES.map(c => ({ key: c.key, label: `${c.icon} ${c.label}` })),
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap tap-feedback ${
                  filter === f.key
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-white/30 bg-white/[0.02]'
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
              <div
                key={goal.id}
                className={`rounded-xl border p-4 bg-white/[0.02] ${
                  goal.status === 'completed'
                    ? 'border-emerald-500/20'
                    : isOverdue
                    ? 'border-red-500/20'
                    : 'border-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xl mt-0.5">{catInfo?.icon || '🎯'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${goal.status === 'completed' ? 'text-white/40 line-through' : 'text-white'}`}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-white/30 mt-0.5 line-clamp-2">{goal.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                      {goal.streak > 0 && (
                        <span className="text-[10px] text-amber-400">🔥 {goal.streak}d streak</span>
                      )}
                      {daysLeft !== null && (
                        <span className={`text-[10px] ${isOverdue ? 'text-red-400' : daysLeft < 7 ? 'text-amber-400' : 'text-white/20'}`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress based on status */}
                <div className="mb-3">
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.status === 'completed'
                          ? 'bg-emerald-500'
                          : goal.status === 'in_progress'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                          : 'bg-white/10'
                      }`}
                      style={{ width: goal.status === 'completed' ? '100%' : goal.status === 'in_progress' ? '50%' : '5%' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {goal.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(goal.id, goal.status === 'not_started' ? 'in_progress' : 'completed')}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 tap-feedback"
                    >
                      {goal.status === 'not_started' ? '▶ Start' : '✓ Complete'}
                    </button>
                  )}
                  <button
                    onClick={() => handleGetAdvice(goal)}
                    disabled={aiLoading[goal.id]}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 tap-feedback disabled:opacity-40"
                  >
                    {aiLoading[goal.id] ? '⏳' : '🤖'} AI Advice
                  </button>
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/40 tap-feedback"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400/60 tap-feedback"
                  >
                    🗑️
                  </button>
                </div>

                {/* AI Advice */}
                {aiAdvice[goal.id] && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/[0.05] border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 mb-1">🤖 AI Motivation</div>
                    <p className="text-xs text-white/60">{aiAdvice[goal.id]}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {goals.length === 0 && !showAdd && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-lg font-bold mb-2">Set Your Life Goals</h2>
            <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">
              Define what you want to achieve. Track progress, build streaks, and get AI-powered motivation along the way.
            </p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl tap-feedback"
            >
              + Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
