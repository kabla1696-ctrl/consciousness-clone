'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface MoodEntry {
  id: string
  mood: string
  intensity: number
  note: string | null
  created_at: string
}

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😍', label: 'Loved' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '🙏', label: 'Grateful' },
  { emoji: '🎉', label: 'Excited' },
  { emoji: '💔', label: 'Heartbroken' },
  { emoji: '✨', label: 'Inspired' },
  { emoji: '🔥', label: 'Fired Up' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🥳', label: 'Party' },
  { emoji: '😌', label: 'Peaceful' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getDayKey(dateStr: string) {
  return new Date(dateStr).toISOString().split('T')[0]
}

export default function MoodTrackerPage() {
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
      // Check if already checked in today
      const today = new Date().toISOString().split('T')[0]
      const todayMood = data.find(e => getDayKey(e.created_at) === today)
      if (todayMood) {
        setTodayEntry(todayMood)
      }
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

  // Insights
  const insights = useMemo(() => {
    if (entries.length === 0) return null

    // Most common mood
    const moodCounts: Record<string, number> = {}
    entries.forEach(e => { moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })
    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]

    // Average intensity
    const avgIntensity = (entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length).toFixed(1)

    // Streak: consecutive days with entries
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

  // Chart data (last 7 or 30 days)
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
            <span className="text-xl">🎭</span>
            <h1 className="text-lg font-bold">Mood Tracker</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Today's Check-in */}
        {todayEntry ? (
          <div className="rounded-xl border border-emerald-500/20 p-4 bg-emerald-500/[0.03] mb-6">
            <div className="text-xs text-emerald-400 mb-2">Today&apos;s mood ✓</div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{todayEntry.mood}</span>
              <div>
                <div className="text-sm font-semibold capitalize">
                  {MOODS.find(m => m.emoji === todayEntry.mood)?.label || 'Unknown'}
                </div>
                <div className="text-xs text-white/30">Intensity: {todayEntry.intensity}/10</div>
                {todayEntry.note && <div className="text-xs text-white/40 mt-1 italic">&quot;{todayEntry.note}&quot;</div>}
              </div>
              <div className="flex-1" />
              <button
                onClick={() => handleDeleteEntry(todayEntry.id)}
                className="text-xs text-white/20 hover:text-red-400 tap-feedback"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckIn(!showCheckIn)}
            className={`w-full rounded-xl border p-4 mb-6 tap-feedback ${
              showCheckIn
                ? 'border-violet-500/30 bg-violet-500/5'
                : 'border-dashed border-white/[0.1] bg-white/[0.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{showCheckIn ? '✏️' : '🎭'}</span>
              <div className="text-left">
                <div className="text-sm font-semibold">{showCheckIn ? 'How are you feeling?' : 'Check in your mood'}</div>
                <div className="text-xs text-white/30">Take a moment to reflect</div>
              </div>
            </div>
          </button>
        )}

        {/* Check-in Form */}
        {showCheckIn && !todayEntry && (
          <div className="rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 mb-6 space-y-4">
            <div>
              <label className="text-xs text-white/40 mb-2 block">How are you feeling?</label>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood.emoji}
                    onClick={() => setSelectedMood(mood.emoji)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg tap-feedback ${
                      selectedMood === mood.emoji
                        ? 'bg-violet-500/20 border border-violet-500/40 scale-105'
                        : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[10px] text-white/40">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">
                Intensity: <span className="text-violet-400 font-semibold">{intensity}</span>/10
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full accent-violet-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500"
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Note (optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What's on your mind?"
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!selectedMood || saving}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '✨ Log My Mood'}
            </button>
          </div>
        )}

        {/* Insights */}
        {insights && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Insights</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
                <div className="text-2xl mb-1">{insights.mostCommon.mood}</div>
                <div className="text-xs text-white/40">Most common</div>
                <div className="text-xs text-white/30">{insights.mostCommon.count} times</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
                <div className="text-2xl font-bold text-violet-400">{insights.avgIntensity}</div>
                <div className="text-xs text-white/40">Avg intensity</div>
                <div className="text-xs text-white/30">out of 10</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
                <div className="text-2xl font-bold text-amber-400">🔥 {insights.streak}</div>
                <div className="text-xs text-white/40">Day streak</div>
                <div className="text-xs text-white/30">keep going!</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
                <div className="text-2xl font-bold text-cyan-400">{insights.totalEntries}</div>
                <div className="text-xs text-white/40">Total entries</div>
                <div className="text-xs text-white/30">last 30 days</div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {entries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">History</h2>
              <div className="flex gap-1">
                {(['7d', '30d'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className={`text-xs px-2 py-1 rounded tap-feedback ${
                      chartView === v ? 'bg-violet-500/20 text-violet-400' : 'text-white/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple bar chart */}
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <div className="flex items-end gap-1 h-32">
                {chartData.map(day => {
                  const height = day.avgIntensity > 0 ? (day.avgIntensity / 10) * 100 : 0
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      {day.count > 0 && (
                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-white/50">
                          {day.mood} {day.avgIntensity}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t transition-all ${
                          day.count > 0
                            ? 'bg-gradient-to-t from-violet-500/60 to-violet-400/30'
                            : 'bg-white/[0.03]'
                        }`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1 mt-2">
                {chartData.map(day => (
                  <div key={day.date} className="flex-1 text-center">
                    <span className="text-[8px] text-white/20">
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
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Recent</h2>
            <div className="space-y-2">
              {entries.slice(0, 20).map(entry => {
                const moodInfo = MOODS.find(m => m.emoji === entry.mood)
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] flex items-center gap-3"
                  >
                    <span className="text-2xl">{entry.mood}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{moodInfo?.label || 'Unknown'}</span>
                        <span className="text-xs text-white/20">{entry.intensity}/10</span>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-white/30 truncate">{entry.note}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-white/30">{formatDate(entry.created_at)}</div>
                      <div className="text-[10px] text-white/15">{formatTime(entry.created_at)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && !showCheckIn && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h2 className="text-lg font-bold mb-2">Track Your Emotional Journey</h2>
            <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">
              Log how you feel each day. Over time, you&apos;ll discover patterns and insights about your emotional wellbeing.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
