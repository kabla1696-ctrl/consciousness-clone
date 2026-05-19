'use client'

import { useMemo } from 'react';

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  title: string
  type: 'memory' | 'mood' | 'achievement' | 'milestone' | 'chat'
  icon?: string
}

interface CalendarGridProps {
  year: number
  month: number // 0-indexed
  events: CalendarEvent[]
  onDayClick?: (date: string) => void
  selectedDate?: string | null
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TYPE_COLORS: Record<string, string> = {
  memory: 'bg-violet-400',
  mood: 'bg-sky-400',
  achievement: 'bg-amber-400',
  milestone: 'bg-emerald-400',
  chat: 'bg-rose-400',
}

export default function CalendarGrid({ year, month, events, onDayClick, selectedDate }: CalendarGridProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Build event map: date string -> events[]
  const eventMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  // Build calendar grid
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay() // 0=Sun
    const totalDays = lastDay.getDate()

    const cells: (number | null)[] = []
    // Leading blanks
    for (let i = 0; i < startDow; i++) cells.push(null)
    // Days
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    // Trailing blanks to fill last row
    while (cells.length % 7 !== 0) cells.push(null)

    // Chunk into weeks
    const result: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7))
    }
    return result
  }, [year, month])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="w-full">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-white/30 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} className="aspect-square" />
          }

          const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const dayEvents = eventMap[dateStr] || []
          const hasEvents = dayEvents.length > 0

          // Unique types for dots
          const uniqueTypes = [...new Set(dayEvents.map((e) => e.type))]

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl
                transition-all duration-200 tap-feedback group
                ${isToday
                  ? 'bg-violet-500/20 ring-1 ring-violet-400/40 text-white font-bold'
                  : isSelected
                    ? 'bg-white/[0.08] ring-1 ring-white/20 text-white'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
                }
              `}
            >
              <span className={`text-sm md:text-base ${isToday ? 'text-violet-300' : ''}`}>{day}</span>
              {/* Event dots */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {uniqueTypes.slice(0, 4).map((t) => (
                    <span key={t} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${TYPE_COLORS[t] || 'bg-white/40'}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
