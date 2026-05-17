'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface ScoreEntry {
  id: string
  scores: Record<string, number>
  total: number
  level: string
  date: string
}

const AREAS = [
  { key: 'health', label: 'Health', icon: '🏃', color: '#10b981' },
  { key: 'career', label: 'Career', icon: '💼', color: '#3b82f6' },
  { key: 'relationships', label: 'Relationships', icon: '❤️', color: '#f43f5e' },
  { key: 'growth', label: 'Growth', icon: '🌱', color: '#f59e0b' },
  { key: 'happiness', label: 'Happiness', icon: '✨', color: '#8b5cf6' },
]

const LEVELS = [
  { min: 0, max: 20, name: 'Beginner', icon: '🌱', color: 'text-white/40' },
  { min: 21, max: 35, name: 'Explorer', icon: '🧭', color: 'text-blue-400' },
  { min: 36, max: 45, name: 'Achiever', icon: '⭐', color: 'text-amber-400' },
  { min: 46, max: 48, name: 'Master', icon: '🏆', color: 'text-violet-400' },
  { min: 49, max: 50, name: 'Legend', icon: '👑', color: 'text-yellow-300' },
]

const STORAGE_KEY = 'consciousness-life-score'

function getLevel(total: number) {
  return LEVELS.find(l => total >= l.min && total <= l.max) || LEVELS[0]
}

export default function LifeScorePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<ScoreEntry[]>([])
  const [aiAdvice, setAiAdvice] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const data = JSON.parse(stored)
          setHistory(data.history || [])
          if (data.lastScores) setScores(data.lastScores)
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const saveData = (newScores: Record<string, number>, newHistory: ScoreEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lastScores: newScores, history: newHistory }))
  }

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores])
  const level = useMemo(() => getLevel(total), [total])
  const percentage = useMemo(() => Math.round((total / 50) * 100), [total])

  const setScore = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const saveScore = () => {
    const entry: ScoreEntry = {
      id: Date.now().toString(),
      scores: { ...scores },
      total,
      level: level.name,
      date: new Date().toISOString(),
    }
    const newHistory = [entry, ...history].slice(0, 50)
    setHistory(newHistory)
    saveData(scores, newHistory)
  }

  const getAIAdvice = async () => {
    if (total === 0) return
    setAiLoading(true)
    setAiAdvice('')
    try {
      const scoreText = AREAS.map(a => `${a.label}: ${scores[a.key] || 0}/10`).join(', ')
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `My life scores: ${scoreText}. Total: ${total}/50. Level: ${level.name}. Give me 3-4 specific, actionable improvement suggestions for my weakest areas. Be encouraging but honest. Keep it concise.`
          }],
          systemPrompt: 'You are a life coach. Give practical, specific advice based on the user\'s self-assessed life scores. Be warm but direct.'
        })
      })
      const data = await res.json()
      setAiAdvice(data.choices?.[0]?.message?.content || 'Unable to generate advice.')
    } catch {
      setAiAdvice('Failed to get AI advice. Please try again.')
    }
    setAiLoading(false)
  }

  // Radar chart points
  const radarPoints = useMemo(() => {
    const cx = 150, cy = 150, r = 110
    const angleStep = (2 * Math.PI) / AREAS.length
    return AREAS.map((area, i) => {
      const angle = -Math.PI / 2 + i * angleStep
      const val = (scores[area.key] || 0) / 10
      return {
        x: cx + r * val * Math.cos(angle),
        y: cy + r * val * Math.sin(angle),
        labelX: cx + (r + 30) * Math.cos(angle),
        labelY: cy + (r + 30) * Math.sin(angle),
        ...area,
        value: scores[area.key] || 0,
      }
    })
  }, [scores])

  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Grid lines
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridPolygons = gridLevels.map(level => {
    const angleStep = (2 * Math.PI) / AREAS.length
    return AREAS.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep
      const cx = 150, cy = 150, r = 110 * level
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(' ')
  })

  const weakest = useMemo(() => {
    return [...AREAS].sort((a, b) => (scores[a.key] || 0) - (scores[b.key] || 0))[0]
  }, [scores])

  if (loading) {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">Life Score</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className={`text-6xl mb-2`}>{level.icon}</div>
          <div className="text-5xl font-bold text-white mb-1">{total}<span className="text-2xl text-white/30">/50</span></div>
          <div className={`text-lg font-medium ${level.color}`}>{level.name}</div>
          <div className="w-full bg-white/5 rounded-full h-2 mt-4 max-w-xs mx-auto">
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
          <div className="text-xs text-white/30 mt-1">{percentage}% of maximum</div>
        </div>

        {/* Radar Chart */}
        {total > 0 && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
            <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
              {gridPolygons.map((points, i) => (
                <polygon key={i} points={points} fill="none" stroke="white" strokeOpacity={0.05} strokeWidth={1} />
              ))}
              <polygon points={polygonPoints} fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth={2} />
              {radarPoints.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={4} fill={p.color} />
                  <text x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fill={p.color} fontSize={12} fontWeight={600}>
                    {p.icon}
                  </text>
                  <text x={p.labelX} y={p.labelY + 14} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize={9}>
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Rate Your Life</h2>
          {AREAS.map(area => (
            <div key={area.key} className="bg-white/5 rounded-xl border border-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{area.icon}</span>
                  <span className="text-white font-medium">{area.label}</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: area.color }}>{scores[area.key] || 0}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={scores[area.key] || 1}
                onChange={e => setScore(area.key, parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${area.color} ${((scores[area.key] || 1) - 1) * 11.1}%, rgba(255,255,255,0.1) ${((scores[area.key] || 1) - 1) * 11.1}%)`,
                  accentColor: area.color,
                }}
              />
              <div className="flex justify-between text-[10px] text-white/20 mt-1">
                <span>1</span><span>5</span><span>10</span>
              </div>
            </div>
          ))}
        </div>

        {/* Save & AI Buttons */}
        <div className="flex gap-3">
          <button onClick={saveScore} disabled={total === 0} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
            💾 Save Score
          </button>
          <button onClick={getAIAdvice} disabled={total === 0 || aiLoading} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium disabled:opacity-30 hover:bg-white/10 transition-colors">
            {aiLoading ? '...' : '🤖 AI Advice'}
          </button>
        </div>

        {/* AI Advice */}
        {aiAdvice && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
            <h3 className="text-sm font-medium text-violet-400 mb-2">💡 AI Suggestions</h3>
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{aiAdvice}</p>
          </div>
        )}

        {/* Weakest Area Highlight */}
        {total > 0 && weakest && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <h3 className="text-sm font-medium text-amber-400 mb-1">🎯 Focus Area</h3>
            <p className="text-white/60 text-sm">
              Your <strong className="text-white">{weakest.label}</strong> score is {scores[weakest.key] || 0}/10. Consider making this your next growth priority.
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
              <span>📊 History ({history.length} entries)</span>
              <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {history.map(entry => {
                  const entryLevel = getLevel(entry.total)
                  return (
                    <div key={entry.id} className="bg-white/5 rounded-xl border border-white/5 p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white/50">{new Date(entry.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span>{entryLevel.icon}</span>
                          <span className="text-white font-semibold">{entry.total}/50</span>
                          <span className={`text-xs ${entryLevel.color}`}>{entry.level}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {AREAS.map(a => (
                          <div key={a.key} className="text-center">
                            <div className="text-[10px]" style={{ color: a.color }}>{a.icon}</div>
                            <div className="text-[10px] text-white/30">{entry.scores[a.key] || 0}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
