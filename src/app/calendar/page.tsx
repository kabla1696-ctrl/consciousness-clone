'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import CalendarGrid, { CalendarEvent } from '@/components/CalendarGrid'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface Memory {
  id?: string
  title?: string
  text?: string
  content?: string
  timestamp?: string
  date?: string
  created_at?: string
}

interface MoodEntry {
  id?: string
  mood?: string
  label?: string
  emoji?: string
  timestamp?: string
  date?: string
  created_at?: string
}

interface Achievement {
  id?: string
  title?: string
  name?: string
  description?: string
  unlocked_at?: string
  date?: string
  icon?: string
}

interface ChatMessage {
  id?: string
  content?: string
  text?: string
  timestamp?: string
  date?: string
  created_at?: string
  milestone?: boolean
}

function getDateStr(ts: string | undefined): string | null {
  if (!ts) return null
  try {
    const d = new Date(ts)
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return null
  }
}

function safeParse<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [animKey, setAnimKey] = useState(0)

  // Load events from localStorage
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    const allEvents: CalendarEvent[] = []

    // Memories
    const memories = safeParse<Memory>('cc_memories')
    for (const m of memories) {
      const date = getDateStr(m.timestamp || m.date || m.created_at)
      if (date) {
        allEvents.push({
          date,
          title: m.title || m.text || m.content || 'Memory',
          type: 'memory',
          icon: '🧠',
        })
      }
    }

    // Mood entries
    const moods = safeParse<MoodEntry>('cc_mood_entries')
    for (const m of moods) {
      const date = getDateStr(m.timestamp || m.date || m.created_at)
      if (date) {
        allEvents.push({
          date,
          title: m.mood || m.label || 'Mood entry',
          type: 'mood',
          icon: m.emoji || '😊',
        })
      }
    }

    // Achievements
    const achievements = safeParse<Achievement>('cc_achievements')
    for (const a of achievements) {
      const date = getDateStr(a.unlocked_at || a.date)
      if (date) {
        allEvents.push({
          date,
          title: a.title || a.name || 'Achievement',
          type: 'achievement',
          icon: a.icon || '🏆',
        })
      }
    }

    // Chat milestones — pick every 50th message or flagged milestones
    const chats = safeParse<ChatMessage>('cc_chat_messages')
    chats.forEach((c, i) => {
      if (c.milestone || (i > 0 && i % 50 === 0)) {
        const date = getDateStr(c.timestamp || c.date || c.created_at)
        if (date) {
          allEvents.push({
            date,
            title: c.content || c.text || `Chat #${i}`,
            type: 'milestone',
            icon: '💬',
          })
        }
      }
    })

    // Also check cc_milestones
    const milestones = safeParse<{ date?: string; title?: string; description?: string }>('cc_milestones')
    for (const m of milestones) {
      const date = getDateStr(m.date)
      if (date) {
        allEvents.push({
          date,
          title: m.title || m.description || 'Milestone',
          type: 'milestone',
          icon: '🎯',
        })
      }
    }

    setEvents(allEvents)
  }, [])

  // Events for current month
  const monthEvents = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return events.filter((e) => e.date.startsWith(prefix))
  }, [events, year, month])

  // Events for selected day
  const dayEvents = useMemo(() => {
    if (!selectedDate) return []
    return events.filter((e) => e.date === selectedDate)
  }, [events, selectedDate])

  const navigate = useCallback((dir: -1 | 1) => {
    setDirection(dir === 1 ? 'left' : 'right')
    setAnimKey((k) => k + 1)
    setTimeout(() => {
      setMonth((m) => {
        const next = m + dir
        if (next < 0) {
          setYear((y) => y - 1)
          return 11
        }
        if (next > 11) {
          setYear((y) => y + 1)
          return 0
        }
        return next
      })
    }, 0)
  }, [])

  const goToToday = useCallback(() => {
    const t = new Date()
    setYear(t.getFullYear())
    setMonth(t.getMonth())
    setSelectedDate(
      `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
    )
  }, [])

  // Animation class
  const animClass = direction
    ? direction === 'left'
      ? 'animate-[slideInRight_0.3s_ease-out]'
      : 'animate-[slideInLeft_0.3s_ease-out]'
    : ''

  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            📅 Calendar
          </h1>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm rounded-xl bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-all tap-feedback border border-violet-500/20"
          >
            Today
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all tap-feedback"
            aria-label="Previous month"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg md:text-xl font-semibold text-white/80">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all tap-feedback"
            aria-label="Next month"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar grid — glass card */}
        <div className="glass-card p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] mb-6">
          <div key={animKey} className={animClass}>
            <CalendarGrid
              year={year}
              month={month}
              events={monthEvents}
              onDayClick={(d) => setSelectedDate(d === selectedDate ? null : d)}
              selectedDate={selectedDate}
            />
          </div>
        </div>

        {/* Event type legend */}
        <div className="flex flex-wrap gap-4 mb-6 px-2">
          {[
            { type: 'memory', label: 'Memories', color: 'bg-violet-400' },
            { type: 'mood', label: 'Mood', color: 'bg-sky-400' },
            { type: 'achievement', label: 'Achievements', color: 'bg-amber-400' },
            { type: 'milestone', label: 'Milestones', color: 'bg-emerald-400' },
            { type: 'chat', label: 'Chat', color: 'bg-rose-400' },
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>

        {/* Selected day events */}
        {selectedDate && (
          <div className="glass-card p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-lg font-semibold text-white/80 mb-4">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            {dayEvents.length === 0 ? (
              <p className="text-white/30 text-sm">No events on this day.</p>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="text-xl flex-shrink-0">{ev.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 truncate">{ev.title}</p>
                      <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                        {ev.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month summary */}
        {!selectedDate && monthEvents.length > 0 && (
          <div className="glass-card p-4 md:p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white/50 mb-3">Month Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Memories', count: monthEvents.filter((e) => e.type === 'memory').length, icon: '🧠' },
                { label: 'Moods', count: monthEvents.filter((e) => e.type === 'mood').length, icon: '😊' },
                { label: 'Achievements', count: monthEvents.filter((e) => e.type === 'achievement').length, icon: '🏆' },
                { label: 'Milestones', count: monthEvents.filter((e) => e.type === 'milestone').length, icon: '🎯' },
              ].map(({ label, count, icon }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] text-center">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-lg font-bold text-white/80">{count}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keyframes injected via style */}
      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
