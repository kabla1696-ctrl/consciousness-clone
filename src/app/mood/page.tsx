'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface MoodEntry {
  id: string
  mood: string
  intensity: number
  note: string | null
  created_at: string
}

const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#22c55e' },
  { emoji: '😢', label: 'Sad', color: '#3b82f6' },
  { emoji: '😡', label: 'Angry', color: '#ef4444' },
  { emoji: '😰', label: 'Anxious', color: '#8b5cf6' },
  { emoji: '😍', label: 'Loved', color: '#ec4899' },
  { emoji: '🤔', label: 'Thoughtful', color: '#06b6d4' },
  { emoji: '💪', label: 'Strong', color: '#f97316' },
  { emoji: '🙏', label: 'Grateful', color: '#a78bfa' },
  { emoji: '🎉', label: 'Excited', color: '#f59e0b' },
  { emoji: '💔', label: 'Heartbroken', color: '#6366f1' },
  { emoji: '✨', label: 'Inspired', color: '#d946ef' },
  { emoji: '🔥', label: 'Fired Up', color: '#ef4444' },
  { emoji: '😤', label: 'Frustrated', color: '#dc2626' },
  { emoji: '😴', label: 'Tired', color: '#64748b' },
  { emoji: '🥳', label: 'Party', color: '#f59e0b' },
  { emoji: '😌', label: 'Peaceful', color: '#14b8a6' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getDayKey(dateStr: string) {
  return new Date(dateStr).toISOString().split('T')[0]
}

export default function MoodTrackerPage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [note, setNote] = useState('')
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null)
  const [chartView, setChartView] = useState<'7d' | '30d'>('7d')
  const [showCelebration, setShowCelebration] = useState(false)
  const [bouncingMood, setBouncingMood] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await loadEntries(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const loadEntries = async (userId: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (data) {
      setEntries(data)
      const today = new Date().toISOString().split('T')[0]
      const todayMood = data.find(e => getDayKey(e.created_at) === today)
      if (todayMood) setTodayEntry(todayMood)
    }
  }

  const handleCheckIn = async () => {
    if (!selectedMood || !user) return
    setSaving(true)

    const { error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood: selectedMood,
      intensity,
      note: note.trim() || null,
    })

    if (!error) {
      setSelectedMood(null)
      setIntensity(5)
      setNote('')
      setShowCheckIn(false)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2500)
      await loadEntries(user.id)
    }
    setSaving(false)
  }

  const handleDeleteEntry = async (id: string) => {
    if (!user) return
    await supabase.from('mood_entries').delete().eq('id', id)
    await loadEntries(user.id)
    if (todayEntry?.id === id) setTodayEntry(null)
  }

  const handleMoodSelect = (emoji: string) => {
    setSelectedMood(emoji)
    setBouncingMood(emoji)
    setTimeout(() => setBouncingMood(null), 500)
  }

  const insights = useMemo(() => {
    if (entries.length === 0) return null

    const moodCounts: Record<string, number> = {}
    entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })
    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]

    const avgIntensity = (entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1)

    const uniqueDays = [...new Set(entries.map(e => getDayKey(e.created_at)))].sort().reverse()
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      if (uniqueDays.includes(key)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return {
      mostCommon: { mood: mostCommon[0], count: mostCommon[1] },
      avgIntensity,
      streak,
      totalEntries: entries.length,
    }
  }, [entries])

  const chartData = useMemo(() => {
    const days = chartView === '7d' ? 7 : 30
    const data: { date: string; label: string; avgIntensity: number; mood: string | null; count: number }[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dayEntries = entries.filter(e => getDayKey(e.created_at) === key)
      const avg = dayEntries.length > 0
        ? dayEntries.reduce((s, e) => s + e.intensity, 0) / dayEntries.length
        : 0
      const latestMood = dayEntries.length > 0 ? dayEntries[0].mood : null

      data.push({
        date: key,
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        avgIntensity: Math.round(avg * 10) / 10,
        mood: latestMood,
        count: dayEntries.length,
      })
    }
    return data
  }, [entries, chartView])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)', animation: 'orb1 22s ease-in-out infinite' }} />
        <div className="absolute bottom-[-150px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animation: 'orb2 28s ease-in-out infinite' }} />
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          <div className="relative">
            <div className="text-8xl bounce-select">✨</div>
            {/* Confetti particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full" style={{
                background: ['#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#06b6d4', '#d946ef'][i],
                animation: `confetti-${(i % 4) + 1} 1.5s ease-out forwards`,
                animationDelay: `${i * 0.05}s`,
              }} />
            ))}
            <p className="text-center text-violet-400 font-bold text-lg mt-4 animate-slide-up">Mood logged! 🎉</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xl">🎭</span>
          <h1 className="text-lg font-bold">{t('mood tracker')}</h1>
          {insights && insights.streak > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <span className="text-lg fire-text">🔥</span>
              <span className="text-sm font-bold text-amber-400">{insights.streak}</span>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 px-4 py-4 pb-24">
        {/* Today's Check-in */}
        {todayEntry ? (
          <div className="rounded-2xl glass-strong p-5 mb-6 animate-slide-up" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
            <div className="text-xs text-emerald-400 font-medium mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              {t('today')}&apos;s mood ✓
            </div>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{todayEntry.mood}</span>
              <div>
                <div className="text-base font-bold capitalize">
                  {MOODS.find(m => m.emoji === todayEntry.mood)?.label || 'Unknown'}
                </div>
                <div className="text-xs text-white/30 mt-0.5">Intensity: {todayEntry.intensity}/10</div>
                {todayEntry.note && <div className="text-xs text-white/35 mt-1 italic">&quot;{todayEntry.note}&quot;</div>}
              </div>
              <div className="flex-1" />
              <button
                onClick={() => handleDeleteEntry(todayEntry.id)}
                className="text-xs text-white/20 hover:text-red-400 tap-feedback p-2 rounded-lg hover:bg-red-500/10 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckIn(!showCheckIn)}
            className={`w-full rounded-2xl p-5 mb-6 tap-feedback transition-all ${showCheckIn ? 'glass-strong border-violet-500/20' : 'glass border-dashed border-white/[0.08]'}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl" style={{ animation: showCheckIn ? 'none' : 'float-subtle 3s ease-in-out infinite' }}>{showCheckIn ? '✏️' : '🎭'}</span>
              <div className="text-left">
                <div className="text-sm font-bold">{showCheckIn ? t('how are you') : 'Check in your mood'}</div>
                <div className="text-xs text-white/25">Take a moment to reflect</div>
              </div>
            </div>
          </button>
        )}

        {/* Check-in Form */}
        {showCheckIn && !todayEntry && (
          <div className="rounded-2xl glass-strong p-5 mb-6 space-y-5 animate-slide-up" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
            <div>
              <label className="text-xs text-white/35 font-medium uppercase tracking-wider mb-3 block">{t('select mood')}</label>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.emoji}
                    onClick={() => handleMoodSelect(mood.emoji)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl tap-feedback transition-all ${selectedMood === mood.emoji ? 'bg-violet-500/20 border border-violet-500/40 scale-105 shadow-lg shadow-violet-500/10' : 'glass hover:scale-105'} ${bouncingMood === mood.emoji ? 'bounce-select' : ''}`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[9px] text-white/35 font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/35 font-medium uppercase tracking-wider mb-3 block">
                Intensity: <span className="text-violet-400 font-bold text-sm">{intensity}</span>/10
              </label>
              <div className="relative px-1">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={intensity}
                  onChange={e => setIntensity(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #ec4899 ${intensity * 10}%, rgba(255,255,255,0.06) ${intensity * 10}%, rgba(255,255,255,0.06) 100%)`,
                  }}
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
                    cursor: pointer;
                    border: 2px solid rgba(255,255,255,0.2);
                  }
                `}</style>
              </div>
              <div className="flex justify-between text-[10px] text-white/15 mt-2 font-medium">
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/35 font-medium uppercase tracking-wider mb-2 block">Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={t('whats on your mind')}
                rows={2}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 resize-none transition"
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!selectedMood || saving}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-3.5 rounded-xl tap-feedback disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-[0.98]"
            >
              {saving ? 'Saving...' : '✨ Log My Mood'}
            </button>
          </div>
        )}

        {/* Insights */}
        {insights && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Insights</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl glass-strong p-4 glow-pulse-hover transition-all hover:scale-[1.03]">
                <div className="text-3xl mb-2">{insights.mostCommon.mood}</div>
                <div className="text-xs text-white/35 font-medium">Most common</div>
                <div className="text-xs text-white/20">{insights.mostCommon.count} times</div>
              </div>
              <div className="rounded-2xl glass-strong p-4 glow-pulse-hover transition-all hover:scale-[1.03]">
                <div className="text-3xl font-black text-violet-400 roll-in">{insights.avgIntensity}</div>
                <div className="text-xs text-white/35 font-medium">Avg intensity</div>
                <div className="text-xs text-white/20">out of 10</div>
              </div>
              <div className="rounded-2xl glass-strong p-4 glow-pulse-hover transition-all hover:scale-[1.03]">
                <div className="text-2xl font-black flex items-center gap-1">
                  <span className="fire-text">🔥</span>
                  <span className="text-amber-400">{insights.streak}</span>
                </div>
                <div className="text-xs text-white/35 font-medium">Day streak</div>
                <div className="text-xs text-white/20">keep going!</div>
              </div>
              <div className="rounded-2xl glass-strong p-4 glow-pulse-hover transition-all hover:scale-[1.03]">
                <div className="text-3xl font-black text-cyan-400 roll-in" style={{ animationDelay: '0.1s' }}>{insights.totalEntries}</div>
                <div className="text-xs text-white/35 font-medium">Total entries</div>
                <div className="text-xs text-white/20">last 30 days</div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {entries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider">History</h2>
              <div className="flex gap-1 glass rounded-lg p-0.5">
                {(['7d', '30d'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`text-xs px-3 py-1.5 rounded-md tap-feedback font-medium transition-all ${chartView === v ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md' : 'text-white/30 hover:text-white/50'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Animated bar chart */}
            <div className="rounded-2xl glass-strong p-5">
              <div className="flex items-end gap-1 h-36">
                {chartData.map((day, i) => {
                  const height = day.avgIntensity > 0 ? (day.avgIntensity / 10) * 100 : 0
                  const moodInfo = MOODS.find(m => m.emoji === day.mood)
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {day.count > 0 && (
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity glass px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10">
                          <span>{day.mood}</span> <span className="text-white/40">{day.avgIntensity}</span>
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${day.count > 0 ? '' : 'bg-white/[0.03]'}`}
                        style={{
                          height: `${Math.max(height, 4)}%`,
                          background: day.count > 0
                            ? `linear-gradient(to top, ${moodInfo?.color || '#8b5cf6'}40, ${moodInfo?.color || '#8b5cf6'}15)`
                            : undefined,
                          animationDelay: `${i * 0.03}s`,
                          animation: day.count > 0 ? `reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s both` : undefined,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1 mt-3">
                {chartData.map(day => (
                  <div key={day.date} className="flex-1 text-center">
                    <span className="text-[8px] text-white/15 font-medium">
                      {chartView === '7d'
                        ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })
                        : new Date(day.date).getDate()
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Recent</h2>
            <div className="space-y-2">
              {entries.slice(0, 20).map((entry, i) => {
                const moodInfo = MOODS.find(m => m.emoji === entry.mood)
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl glass p-4 flex items-center gap-3 transition-all hover:scale-[1.005] animate-slide-up"
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s`, borderLeft: `3px solid ${moodInfo?.color || '#8b5cf6'}30` }}
                  >
                    <span className="text-2xl">{entry.mood}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{moodInfo?.label || 'Unknown'}</span>
                        <span className="text-[10px] text-white/20 font-mono">{entry.intensity}/10</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-white/25 truncate mt-0.5">{entry.note}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-white/25 font-medium">{formatDate(entry.created_at)}</div>
                      <div className="text-[10px] text-white/10">{formatTime(entry.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && !showCheckIn && (
          <div className="text-center py-20">
            <div className="text-7xl mb-6" style={{ animation: 'float-subtle 4s ease-in-out infinite' }}>🎭</div>
            <h2 className="text-xl font-bold mb-2">Track Your Emotional Journey</h2>
            <p className="text-white/25 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Log how you feel each day. Over time, you&apos;ll discover patterns and insights about your emotional wellbeing.
            </p>
            <button
              onClick={() => setShowCheckIn(true)}
              className="px-8 py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 pulse-btn"
            >
              Start Tracking
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
