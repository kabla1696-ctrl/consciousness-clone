'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('@/components/BarChart'), { ssr: false })
const LineChart = dynamic(() => import('@/components/LineChart'), { ssr: false })
const PieChart = dynamic(() => import('@/components/PieChart'), { ssr: false })
const HeatMap = dynamic(() => import('@/components/HeatMap'), { ssr: false })

// --- Helpers ---
function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

type DateRange = '7d' | '30d' | '90d' | '1y' | 'all'

const RANGE_MS: Record<DateRange, number> = {
  '7d': 7 * 86400000,
  '30d': 30 * 86400000,
  '90d': 90 * 86400000,
  '1y': 365 * 86400000,
  'all': Infinity,
}

// --- Types ---
interface MemoryEntry {
  id?: string
  content?: string
  text?: string
  timestamp?: number
  created_at?: string
  date?: string
  tags?: string[]
  category?: string
  mood?: string
}

interface MoodEntry {
  mood?: string
  value?: string
  timestamp?: number
  created_at?: string
  date?: string
  label?: string
}

const MOOD_COLORS: Record<string, string> = {
  happy: '#22c55e',
  sad: '#3b82f6',
  angry: '#ef4444',
  anxious: '#f59e0b',
  calm: '#06b6d4',
  excited: '#f97316',
  grateful: '#a855f7',
  hopeful: '#10b981',
  neutral: '#6b7280',
  reflective: '#8b5cf6',
  creative: '#ec4899',
  tired: '#64748b',
  love: '#f43f5e',
  inspired: '#14b8a6',
}

function getTimestamp(m: MemoryEntry | MoodEntry): number {
  if (m.timestamp) return m.timestamp
  if (m.created_at) return new Date(m.created_at).getTime()
  if (m.date) return new Date(m.date).getTime()
  return 0
}

// --- Glass Card ---
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// --- Stat Card ---
function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-white/40 text-xs">
        <span>{icon}</span> {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-[10px] text-white/30">{sub}</div>}
    </div>
  )
}

// --- Main ---
export default function InsightsPage() {
  const [range, setRange] = useState<DateRange>('all')
  const [mounted, setMounted] = useState(false)
  const [memories, setMemories] = useState<MemoryEntry[]>([])
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [chatMessages, setChatMessages] = useState<unknown[]>([])
  const [featuresUsed, setFeaturesUsed] = useState<Record<string, number> | string[]>({})
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setMounted(true)
    setMemories(safeParse<MemoryEntry[]>('cc_memories', []))
    setMoodEntries(safeParse<MoodEntry[]>('cc_mood_entries', []))
    setChatMessages(safeParse<unknown[]>('cc_chat_messages', []))
    setFeaturesUsed(safeParse<Record<string, number> | string[]>('cc_features_used', {}))
    setStreak(parseInt(localStorage.getItem('cc_streak') || '0', 10) || 0)
  }, [])

  // Filter by date range
  const cutoff = range === 'all' ? 0 : Date.now() - RANGE_MS[range]

  const filteredMemories = useMemo(() =>
    memories.filter(m => getTimestamp(m) >= cutoff), [memories, cutoff])

  const filteredMoods = useMemo(() =>
    moodEntries.filter(m => getTimestamp(m) >= cutoff), [moodEntries, cutoff])

  // --- Memory Trends (per month) ---
  const memoryTrends = useMemo(() => {
    const monthMap = new Map<string, number>()
    filteredMemories.forEach(m => {
      const ts = getTimestamp(m)
      if (!ts) return
      const d = new Date(ts)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, (monthMap.get(key) || 0) + 1)
    })
    const sorted = [...monthMap.entries()].sort()
    return sorted.map(([k, v]) => ({
      label: k.slice(5),
      value: v,
    }))
  }, [filteredMemories])

  // --- Mood Distribution ---
  const moodDistribution = useMemo(() => {
    const map = new Map<string, number>()
    filteredMoods.forEach(m => {
      const label = (m.mood || m.value || m.label || 'unknown').toLowerCase()
      map.set(label, (map.get(label) || 0) + 1)
    })
    filteredMemories.forEach(m => {
      if (m.mood) {
        const label = m.mood.toLowerCase()
        map.set(label, (map.get(label) || 0) + 1)
      }
    })
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
        color: MOOD_COLORS[label] || '#8b5cf6',
      }))
  }, [filteredMoods, filteredMemories])

  // --- Activity Heatmap ---
  const heatmapData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : range === '1y' ? 365 : 180
    const dayMap = new Map<string, number>()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const allTs = [
      ...memories.map(m => getTimestamp(m)),
      ...moodEntries.map(m => getTimestamp(m)),
    ]

    allTs.forEach(ts => {
      if (!ts || ts < startDate.getTime()) return
      const key = new Date(ts).toISOString().slice(0, 10)
      dayMap.set(key, (dayMap.get(key) || 0) + 1)
    })

    const result: { date: string; count: number }[] = []
    const cursor = new Date(startDate)
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10)
      result.push({ date: key, count: dayMap.get(key) || 0 })
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [memories, moodEntries, range])

  // --- Top Topics/Tags ---
  const topTopics = useMemo(() => {
    const map = new Map<string, number>()
    filteredMemories.forEach(m => {
      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach(t => map.set(t, (map.get(t) || 0) + 1))
      }
      if (m.category) {
        map.set(m.category, (map.get(m.category) || 0) + 1)
      }
    })
    if (map.size === 0) {
      filteredMemories.forEach(m => {
        const text = (m.content || m.text || '').toLowerCase()
        const words = text.split(/\s+/).filter(w => w.length > 4)
        words.forEach(w => {
          const clean = w.replace(/[^a-z]/g, '')
          if (clean.length > 4) map.set(clean, (map.get(clean) || 0) + 1)
        })
      })
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }))
  }, [filteredMemories])

  // --- Writing Stats ---
  const writingStats = useMemo(() => {
    const texts = filteredMemories.map(m => m.content || m.text || '')
    const totalWords = texts.join(' ').split(/\s+/).filter(Boolean).length
    const avgLength = filteredMemories.length > 0 ? Math.round(totalWords / filteredMemories.length) : 0

    let longestStreak = 0
    let currentStreak = 0
    const sortedDates = [...new Set(
      filteredMemories
        .map(m => {
          const ts = getTimestamp(m)
          return ts ? new Date(ts).toISOString().slice(0, 10) : null
        })
        .filter((d): d is string => d !== null)
    )].sort()

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) { currentStreak = 1; longestStreak = 1; continue }
      const prev = new Date(sortedDates[i - 1])
      const curr = new Date(sortedDates[i])
      const diff = (curr.getTime() - prev.getTime()) / 86400000
      if (diff <= 1) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    return { totalWords, avgLength, longestStreak }
  }, [filteredMemories])

  // --- Features Used ---
  const featuresTimeline = useMemo(() => {
    if (Array.isArray(featuresUsed)) {
      const map = new Map<string, number>()
      featuresUsed.forEach(f => map.set(f, (map.get(f) || 1) + 1))
      return [...map.entries()].slice(0, 10).map(([label, value]) => ({ label, value }))
    }
    if (typeof featuresUsed === 'object' && featuresUsed !== null) {
      return Object.entries(featuresUsed as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value }))
    }
    return []
  }, [featuresUsed])

  const dateRanges: { key: DateRange; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: '1y', label: '1Y' },
    { key: 'all', label: 'All' },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0a0a1a] pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📊</span> Your Consciousness Insights
            </h1>
            <p className="text-xs text-white/40 mt-0.5">Data-driven view of your inner world</p>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {dateRanges.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === r.key
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon="📝" label="Memories" value={filteredMemories.length} sub="total entries" />
          <StatCard icon="💬" label="Chat Messages" value={chatMessages.length} sub="conversations" />
          <StatCard icon="✍️" label="Total Words" value={writingStats.totalWords.toLocaleString()} sub="across memories" />
          <StatCard icon="🔥" label="Current Streak" value={`${streak}d`} sub={`longest: ${writingStats.longestStreak}d`} />
        </div>

        {/* Memory Trends + Mood Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <SectionTitle icon="📈" title="Memory Trends" subtitle="Memories recorded per month" />
            {memoryTrends.length > 0 ? (
              <LineChart data={memoryTrends} height={220} />
            ) : (
              <p className="text-white/20 text-sm text-center py-12">No memory data yet</p>
            )}
          </GlassCard>

          <GlassCard>
            <SectionTitle icon="🎭" title="Mood Distribution" subtitle="Your emotional landscape" />
            {moodDistribution.length > 0 ? (
              <PieChart data={moodDistribution} />
            ) : (
              <p className="text-white/20 text-sm text-center py-12">Track moods to see your distribution</p>
            )}
          </GlassCard>
        </div>

        {/* Activity Heatmap */}
        <GlassCard>
          <SectionTitle icon="🔥" title="Activity Heatmap" subtitle="Your daily consciousness activity" />
          {heatmapData.length > 0 ? (
            <HeatMap data={heatmapData} />
          ) : (
            <p className="text-white/20 text-sm text-center py-12">No activity data in this period</p>
          )}
        </GlassCard>

        {/* Top Topics + Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <SectionTitle icon="🏷️" title="Top Topics" subtitle="Most common tags & categories" />
            {topTopics.length > 0 ? (
              <BarChart data={topTopics} height={220} />
            ) : (
              <p className="text-white/20 text-sm text-center py-12">Add tags to your memories to see topics</p>
            )}
          </GlassCard>

          <GlassCard>
            <SectionTitle icon="⚡" title="Features Used" subtitle="Your most-used consciousness features" />
            {featuresTimeline.length > 0 ? (
              <BarChart
                data={featuresTimeline.map((f, i) => ({
                  ...f,
                  color: [
                    'linear-gradient(to top, #8b5cf6, #a78bfa)',
                    'linear-gradient(to top, #d946ef, #e879f9)',
                    'linear-gradient(to top, #06b6d4, #22d3ee)',
                    'linear-gradient(to top, #f97316, #fb923c)',
                    'linear-gradient(to top, #10b981, #34d399)',
                    'linear-gradient(to top, #3b82f6, #60a5fa)',
                    'linear-gradient(to top, #ec4899, #f472b6)',
                    'linear-gradient(to top, #eab308, #facc15)',
                    'linear-gradient(to top, #14b8a6, #2dd4bf)',
                    'linear-gradient(to top, #f43f5e, #fb7185)',
                  ][i % 10],
                }))}
                height={220}
              />
            ) : (
              <p className="text-white/20 text-sm text-center py-12">Use more features to see your stats</p>
            )}
          </GlassCard>
        </div>

        {/* Writing Stats */}
        <GlassCard>
          <SectionTitle icon="✍️" title="Writing Statistics" subtitle="Your writing patterns and habits" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {writingStats.totalWords.toLocaleString()}
              </div>
              <div className="text-xs text-white/40 mt-1">Total Words</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {writingStats.avgLength}
              </div>
              <div className="text-xs text-white/40 mt-1">Avg Words/Entry</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                {writingStats.longestStreak}d
              </div>
              <div className="text-xs text-white/40 mt-1">Longest Streak</div>
            </div>
          </div>
        </GlassCard>

        {/* Empty state */}
        {filteredMemories.length === 0 && filteredMoods.length === 0 && (
          <GlassCard className="text-center py-8">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="text-white/60 font-medium">Start Your Journey</h3>
            <p className="text-white/30 text-sm mt-1 max-w-md mx-auto">
              Add memories, track moods, and use features to see your consciousness insights come alive.
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
