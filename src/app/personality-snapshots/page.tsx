'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Snapshot {
  id: string
  scores: { energy: number; creativity: number; social: number; focus: number; mood: number }
  timestamp: string
}

const TRAITS = [
  { key: 'energy', label: 'Energy', emoji: '⚡', color: '#f59e0b' },
  { key: 'creativity', label: 'Creativity', emoji: '🎨', color: '#ec4899' },
  { key: 'social', label: 'Social', emoji: '👥', color: '#06b6d4' },
  { key: 'focus', label: 'Focus', emoji: '🎯', color: '#8b5cf6' },
  { key: 'mood', label: 'Mood', emoji: '😊', color: '#10b981' },
] as const

type TraitKey = typeof TRAITS[number]['key']

const STORAGE_KEY = 'consciousness-personality-snapshots'

export default function PersonalitySnapshotsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [scores, setScores] = useState<Record<TraitKey, number>>({
    energy: 50,
    creativity: 50,
    social: 50,
    focus: 50,
    mood: 50,
  })
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null)

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
      try { setSnapshots(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
  }, [snapshots, loading])

  const todayKey = new Date().toISOString().split('T')[0]
  const hasToday = snapshots.some(s => s.timestamp.startsWith(todayKey))

  const handleSave = () => {
    const newSnapshot: Snapshot = {
      id: Date.now().toString(),
      scores: { ...scores },
      timestamp: new Date().toISOString(),
    }
    setSnapshots(prev => [newSnapshot, ...prev])
    setShowCheckIn(false)
    setScores({ energy: 50, creativity: 50, social: 50, focus: 50, mood: 50 })
  }

  const handleAiInsight = async () => {
    if (snapshots.length < 2) return
    setAiLoading(true)
    try {
      const recent = snapshots.slice(0, 7).map(s => ({
        date: s.timestamp.split('T')[0],
        ...s.scores,
      }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze these personality snapshot scores over time and provide a brief trend insight (2-3 sentences). Data: ${JSON.stringify(recent)}. Focus on notable changes, patterns, or advice.`,
        }),
      })
      const data = await res.json()
      setAiInsight(data.reply || data.content || 'Keep tracking daily to reveal more patterns!')
    } catch {
      setAiInsight('Could not generate insight. Try again later.')
    }
    setAiLoading(false)
  }

  // Build radar chart points
  const buildRadarPoints = (snap: Snapshot, scale: number = 100): string => {
    const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
    const angleStep = (2 * Math.PI) / keys.length
    const centerX = 50
    const centerY = 50
    const maxRadius = 38

    return keys.map((key, i) => {
      const angle = angleStep * i - Math.PI / 2
      const value = snap.scores[key] / 100
      const r = value * maxRadius
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')
  }

  // Build axis lines for radar
  const radarAxes = useMemo(() => {
    const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
    const angleStep = (2 * Math.PI) / keys.length
    const centerX = 50
    const centerY = 50
    const maxRadius = 38

    return keys.map((key, i) => {
      const angle = angleStep * i - Math.PI / 2
      const x = centerX + maxRadius * Math.cos(angle)
      const y = centerY + maxRadius * Math.sin(angle)
      const labelX = centerX + (maxRadius + 10) * Math.cos(angle)
      const labelY = centerY + (maxRadius + 10) * Math.sin(angle)
      const trait = TRAITS.find(t => t.key === key)!
      return { x1: centerX, y1: centerY, x2: x, y2: y, labelX, labelY, trait }
    })
  }, [])

  const latestSnapshot = snapshots[0] || null
  const compareSnapshot = selectedSnapshot ? snapshots.find(s => s.id === selectedSnapshot) : (snapshots[1] || null)

  // Stats
  const stats = useMemo(() => {
    if (snapshots.length === 0) return null
    const latest = snapshots[0].scores
    const avg = snapshots.slice(0, 7).reduce(
      (acc, s) => {
        Object.keys(s.scores).forEach(k => {
          acc[k as TraitKey] += s.scores[k as TraitKey]
        })
        return acc
      },
      { energy: 0, creativity: 0, social: 0, focus: 0, mood: 0 }
    )
    const count = Math.min(snapshots.length, 7)
    Object.keys(avg).forEach(k => { avg[k as TraitKey] = Math.round(avg[k as TraitKey] / count) })

    return { latest, avg, count }
  }, [snapshots])

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
            <span className="text-xl">📸</span>
            <h1 className="text-lg font-bold">Personality Snapshots</h1>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-white/30">{snapshots.length} snapshots</span>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Today's Check-in */}
        {hasToday && !showCheckIn ? (
          <div className="rounded-xl border border-emerald-500/20 p-4 bg-emerald-500/[0.03] mb-6">
            <div className="text-xs text-emerald-400 mb-2">Today&apos;s snapshot taken ✓</div>
            <div className="flex gap-3">
              {TRAITS.map(trait => (
                <div key={trait.key} className="flex-1 text-center">
                  <div className="text-lg">{trait.emoji}</div>
                  <div className="text-xs font-semibold text-white/60">{latestSnapshot?.scores[trait.key]}</div>
                </div>
              ))}
            </div>
          </div>
        ) : !showCheckIn ? (
          <button
            onClick={() => setShowCheckIn(true)}
            className="w-full rounded-xl border border-dashed border-white/[0.1] p-4 mb-6 tap-feedback bg-white/[0.01]"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📸</span>
              <div className="text-left">
                <div className="text-sm font-semibold">Take today&apos;s snapshot</div>
                <div className="text-xs text-white/30">Rate yourself on 5 traits</div>
              </div>
            </div>
          </button>
        ) : null}

        {/* Check-in Form */}
        {showCheckIn && (
          <div className="rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 mb-6 space-y-5">
            <h3 className="text-sm font-semibold text-violet-400">How are you today?</h3>

            {TRAITS.map(trait => (
              <div key={trait.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/40">
                    {trait.emoji} {trait.label}
                  </label>
                  <span className="text-sm font-bold" style={{ color: trait.color }}>
                    {scores[trait.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scores[trait.key]}
                  onChange={e => setScores(prev => ({ ...prev, [trait.key]: Number(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${trait.color}60 ${scores[trait.key]}%, rgba(255,255,255,0.1) ${scores[trait.key]}%)`,
                    // @ts-ignore
                    '--thumb-color': trait.color,
                  }}
                />
                <style jsx>{`
                  input[type="range"]::-webkit-slider-thumb {
                    background: ${trait.color};
                  }
                `}</style>
              </div>
            ))}

            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback"
            >
              ✨ Save Snapshot
            </button>
          </div>
        )}

        {/* Radar Chart */}
        {latestSnapshot && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              {compareSnapshot && compareSnapshot.id !== latestSnapshot.id
                ? '📊 Compare Snapshots'
                : '📊 Latest Snapshot'}
            </h2>
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <svg viewBox="0 0 100 100" className="w-full max-w-[280px] mx-auto" style={{ aspectRatio: '1' }}>
                {/* Grid rings */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
                  const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
                  const angleStep = (2 * Math.PI) / keys.length
                  const maxRadius = 38
                  const points = keys.map((_, i) => {
                    const angle = angleStep * i - Math.PI / 2
                    const r = scale * maxRadius
                    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
                  }).join(' ')
                  return (
                    <polygon
                      key={scale}
                      points={points}
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="0.5"
                    />
                  )
                })}

                {/* Axes */}
                {radarAxes.map(ax => (
                  <g key={ax.trait.key}>
                    <line
                      x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={ax.labelX}
                      y={ax.labelY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={ax.trait.color}
                      fontSize="5"
                      fontWeight="600"
                    >
                      {ax.trait.label}
                    </text>
                  </g>
                ))}

                {/* Compare polygon (faded) */}
                {compareSnapshot && compareSnapshot.id !== latestSnapshot.id && (
                  <polygon
                    points={buildRadarPoints(compareSnapshot)}
                    fill="rgba(139, 92, 246, 0.05)"
                    stroke="rgba(139, 92, 246, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                  />
                )}

                {/* Latest polygon */}
                <polygon
                  points={buildRadarPoints(latestSnapshot)}
                  fill="rgba(139, 92, 246, 0.1)"
                  stroke="#8b5cf6"
                  strokeWidth="1.5"
                />

                {/* Data points */}
                {TRAITS.map((trait, i) => {
                  const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
                  const angleStep = (2 * Math.PI) / keys.length
                  const angle = angleStep * i - Math.PI / 2
                  const value = latestSnapshot.scores[trait.key] / 100
                  const r = value * 38
                  const x = 50 + r * Math.cos(angle)
                  const y = 50 + r * Math.sin(angle)
                  return (
                    <circle
                      key={trait.key}
                      cx={x} cy={y} r="2"
                      fill={trait.color}
                      stroke="#050510"
                      strokeWidth="1"
                    />
                  )
                })}
              </svg>

              {/* Score labels below chart */}
              <div className="flex justify-center gap-3 mt-3">
                {TRAITS.map(trait => (
                  <div key={trait.key} className="text-center">
                    <div className="text-lg">{trait.emoji}</div>
                    <div className="text-xs font-bold" style={{ color: trait.color }}>
                      {latestSnapshot.scores[trait.key]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {snapshots.length >= 2 && (
          <div className="mb-6">
            <button
              onClick={handleAiInsight}
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40 border border-amber-500/20 mb-3"
            >
              {aiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber-400/40 border-t-transparent rounded-full animate-spin" />
                  Analyzing trends...
                </span>
              ) : (
                '🤖 Get AI Trend Insight'
              )}
            </button>
            {aiInsight && (
              <div className="rounded-xl border border-amber-500/20 p-4 bg-amber-500/[0.03]">
                <div className="text-[10px] text-amber-400 mb-1">AI Analysis</div>
                <p className="text-sm text-white/60">{aiInsight}</p>
              </div>
            )}
          </div>
        )}

        {/* Snapshot History */}
        {snapshots.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              📅 History
            </h2>
            <div className="space-y-2">
              {snapshots.slice(0, 14).map(snap => {
                const isSelected = selectedSnapshot === snap.id
                const date = new Date(snap.timestamp)
                const isLatest = snap.id === latestSnapshot?.id
                return (
                  <button
                    key={snap.id}
                    onClick={() => setSelectedSnapshot(isSelected ? null : snap.id)}
                    className={`w-full text-left rounded-xl border p-3 tap-feedback transition-all ${
                      isSelected
                        ? 'border-violet-500/30 bg-violet-500/[0.05]'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isLatest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">Latest</span>}
                        <span className="text-xs text-white/40">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/20">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {TRAITS.map(trait => (
                        <div key={trait.key} className="flex-1">
                          <div className="text-center">
                            <div className="text-xs">{trait.emoji}</div>
                            <div className="text-[10px] font-bold" style={{ color: trait.color }}>
                              {snap.scores[trait.key]}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {snapshots.length === 0 && !showCheckIn && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-lg font-bold mb-2">Track Your Personality</h2>
            <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">
              Take daily snapshots of your personality traits. Over time, discover patterns and trends in how you feel and think.
            </p>
            <button
              onClick={() => setShowCheckIn(true)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl tap-feedback"
            >
              📸 Take First Snapshot
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
