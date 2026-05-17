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

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? 'rgba(139,92,246,0.4)' : i % 3 === 1 ? 'rgba(236,72,153,0.3)' : 'rgba(6,182,212,0.3)',
            '--duration': `${6 + Math.random() * 8}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

export default function PersonalitySnapshotsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [scores, setScores] = useState<Record<TraitKey, number>>({
    energy: 50, creativity: 50, social: 50, focus: 50, mood: 50,
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
    if (stored) { try { setSnapshots(JSON.parse(stored)) } catch {} }
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
      const recent = snapshots.slice(0, 7).map(s => ({ date: s.timestamp.split('T')[0], ...s.scores }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze these personality snapshot scores over time and provide a brief trend insight (2-3 sentences). Data: ${JSON.stringify(recent)}. Focus on notable changes, patterns, or advice.`,
        }),
      })
      const data = await res.json()
      setAiInsight(data.reply || data.content || 'Keep tracking daily to reveal more patterns!')
    } catch { setAiInsight('Could not generate insight. Try again later.') }
    setAiLoading(false)
  }

  const buildRadarPoints = (snap: Snapshot): string => {
    const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
    const angleStep = (2 * Math.PI) / keys.length
    return keys.map((key, i) => {
      const angle = angleStep * i - Math.PI / 2
      const value = snap.scores[key] / 100
      const r = value * 38
      return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
    }).join(' ')
  }

  const radarAxes = useMemo(() => {
    const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
    const angleStep = (2 * Math.PI) / keys.length
    return keys.map((key, i) => {
      const angle = angleStep * i - Math.PI / 2
      const x = 50 + 38 * Math.cos(angle)
      const y = 50 + 38 * Math.sin(angle)
      const labelX = 50 + 48 * Math.cos(angle)
      const labelY = 50 + 48 * Math.sin(angle)
      const trait = TRAITS.find(t => t.key === key)!
      return { x1: 50, y1: 50, x2: x, y2: y, labelX, labelY, trait }
    })
  }, [])

  const latestSnapshot = snapshots[0] || null
  const compareSnapshot = selectedSnapshot ? snapshots.find(s => s.id === selectedSnapshot) : (snapshots[1] || null)

  const stats = useMemo(() => {
    if (snapshots.length === 0) return null
    const latest = snapshots[0].scores
    const avg = snapshots.slice(0, 7).reduce((acc, s) => {
      Object.keys(s.scores).forEach(k => { acc[k as TraitKey] += s.scores[k as TraitKey] })
      return acc
    }, { energy: 0, creativity: 0, social: 0, focus: 0, mood: 0 })
    const count = Math.min(snapshots.length, 7)
    Object.keys(avg).forEach(k => { avg[k as TraitKey] = Math.round(avg[k as TraitKey] / count) })
    return { latest, avg, count }
  }, [snapshots])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition">
      <FloatingParticles />

      {/* Ambient orbs */}
      <div className="ambient-orb ambient-orb-violet" style={{ width: 300, height: 300, top: '10%', right: '-5%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '20%', left: '-5%' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <h1 className="text-lg font-bold gradient-text">Personality Snapshots</h1>
          </div>
          <div className="flex-1" />
          <span className="text-xs text-white/30 glass-card px-2 py-1">{snapshots.length} snapshots</span>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 relative z-10">
        {/* Today's Check-in */}
        {hasToday && !showCheckIn ? (
          <div className="glass-card glow-pulse-hover rounded-2xl border border-emerald-500/20 p-5 mb-6 bg-emerald-500/[0.03]">
            <div className="text-xs text-emerald-400 mb-3 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Today&apos;s snapshot taken
            </div>
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
            className="w-full rounded-2xl border border-dashed border-violet-500/20 p-5 mb-6 glass-card hover-lift group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">📸</div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white/90">Take today&apos;s snapshot</div>
                <div className="text-xs text-white/40">Rate yourself on 5 traits</div>
              </div>
            </div>
          </button>
        ) : null}

        {/* Check-in Form */}
        {showCheckIn && (
          <div className="gradient-border-card rounded-2xl p-5 mb-6 space-y-5 bg-violet-500/5">
            <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
              <span className="text-lg">✨</span> How are you today?
            </h3>
            {TRAITS.map(trait => (
              <div key={trait.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-white/50 font-medium">{trait.emoji} {trait.label}</label>
                  <span className="text-sm font-bold font-mono" style={{ color: trait.color }}>{scores[trait.key]}</span>
                </div>
                <input
                  type="range" min={0} max={100} value={scores[trait.key]}
                  onChange={e => setScores(prev => ({ ...prev, [trait.key]: Number(e.target.value) }))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${trait.color}60 ${scores[trait.key]}%, rgba(255,255,255,0.1) ${scores[trait.key]}%)`,
                    // @ts-ignore
                    '--thumb-color': trait.color,
                  }}
                />
                <style jsx>{`input[type="range"]::-webkit-slider-thumb { background: ${trait.color}; box-shadow: 0 0 10px ${trait.color}60; }`}</style>
              </div>
            ))}
            <button onClick={handleSave} className="w-full glow-btn bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-500/20">
              ✨ Save Snapshot
            </button>
          </div>
        )}

        {/* Radar Chart */}
        {latestSnapshot && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-violet-500 to-transparent" />
              {compareSnapshot && compareSnapshot.id !== latestSnapshot.id ? 'Compare Snapshots' : 'Latest Snapshot'}
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-white/5" />
            </h2>
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              {/* Subtle glow behind chart */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
              </div>
              <svg viewBox="0 0 100 100" className="w-full max-w-[280px] mx-auto relative z-10" style={{ aspectRatio: '1' }}>
                {[0.2, 0.4, 0.6, 0.8, 1].map(scale => {
                  const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
                  const angleStep = (2 * Math.PI) / keys.length
                  const points = keys.map((_, i) => {
                    const angle = angleStep * i - Math.PI / 2
                    const r = scale * 38
                    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`
                  }).join(' ')
                  return <polygon key={scale} points={points} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                })}
                {radarAxes.map(ax => (
                  <g key={ax.trait.key}>
                    <line x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                    <text x={ax.labelX} y={ax.labelY} textAnchor="middle" dominantBaseline="middle" fill={ax.trait.color} fontSize="4.5" fontWeight="600">{ax.trait.label}</text>
                  </g>
                ))}
                {compareSnapshot && compareSnapshot.id !== latestSnapshot.id && (
                  <polygon points={buildRadarPoints(compareSnapshot)} fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="3,2" />
                )}
                <polygon points={buildRadarPoints(latestSnapshot)} fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="1.5" />
                {TRAITS.map((trait, i) => {
                  const keys: TraitKey[] = ['energy', 'creativity', 'social', 'focus', 'mood']
                  const angleStep = (2 * Math.PI) / keys.length
                  const angle = angleStep * i - Math.PI / 2
                  const value = latestSnapshot.scores[trait.key] / 100
                  const r = value * 38
                  return <circle key={trait.key} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r="2.5" fill={trait.color} stroke="#050510" strokeWidth="1" style={{ filter: `drop-shadow(0 0 4px ${trait.color}60)` }} />
                })}
              </svg>
              <div className="flex justify-center gap-4 mt-4 relative z-10">
                {TRAITS.map(trait => (
                  <div key={trait.key} className="text-center">
                    <div className="text-lg">{trait.emoji}</div>
                    <div className="text-xs font-bold font-mono" style={{ color: trait.color }}>{latestSnapshot.scores[trait.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insight */}
        {snapshots.length >= 2 && (
          <div className="mb-6">
            <button onClick={handleAiInsight} disabled={aiLoading}
              className="w-full glow-btn bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 font-semibold py-3.5 rounded-xl border border-amber-500/20 mb-3 disabled:opacity-40">
              {aiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                  Analyzing trends...
                </span>
              ) : '🤖 Get AI Trend Insight'}
            </button>
            {aiInsight && (
              <div className="glass-card rounded-2xl border border-amber-500/10 p-4 bg-amber-500/[0.03] animate-slide-up">
                <div className="text-[10px] text-amber-400 mb-1 font-medium">AI Analysis</div>
                <p className="text-sm text-white/60 leading-relaxed">{aiInsight}</p>
              </div>
            )}
          </div>
        )}

        {/* Snapshot History */}
        {snapshots.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-violet-500 to-transparent" />
              History
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-white/5" />
            </h2>
            <div className="space-y-2 stagger-children">
              {snapshots.slice(0, 14).map(snap => {
                const isSelected = selectedSnapshot === snap.id
                const date = new Date(snap.timestamp)
                const isLatest = snap.id === latestSnapshot?.id
                return (
                  <button key={snap.id} onClick={() => setSelectedSnapshot(isSelected ? null : snap.id)}
                    className={`w-full text-left rounded-2xl p-4 transition-all duration-300 ${
                      isSelected ? 'glass-card border-violet-500/30 bg-violet-500/[0.05] shadow-lg shadow-violet-500/5' : 'glass-card hover-lift'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isLatest && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/30 to-fuchsia-500/30 text-violet-300 font-medium">Latest</span>}
                        <span className="text-xs text-white/40">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <span className="text-[10px] text-white/20">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex gap-2">
                      {TRAITS.map(trait => (
                        <div key={trait.key} className="flex-1 text-center">
                          <div className="text-xs">{trait.emoji}</div>
                          <div className="text-[10px] font-bold font-mono" style={{ color: trait.color }}>{snap.scores[trait.key]}</div>
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
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="relative text-7xl">📸</div>
            </div>
            <h2 className="text-xl font-bold gradient-text mb-2">Track Your Personality</h2>
            <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Take daily snapshots of your personality traits. Over time, discover patterns and trends in how you feel and think.
            </p>
            <button onClick={() => setShowCheckIn(true)} className="glow-btn bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-500/20">
              📸 Take First Snapshot
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
