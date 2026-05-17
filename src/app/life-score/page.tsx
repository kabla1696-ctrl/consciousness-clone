'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface ScoreEntry {
  id: string
  scores: Record<string, number>
  total: number
  level: string
  date: string
}

const AREAS = [
  { key: 'health', label: 'Health', icon: '🏃', color: '#10b981', gradient: 'from-emerald-500 to-teal-400' },
  { key: 'career', label: 'Career', icon: '💼', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-400' },
  { key: 'relationships', label: 'Relationships', icon: '❤️', color: '#f43f5e', gradient: 'from-rose-500 to-pink-400' },
  { key: 'growth', label: 'Growth', icon: '🌱', color: '#f59e0b', gradient: 'from-amber-500 to-yellow-400' },
  { key: 'happiness', label: 'Happiness', icon: '✨', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-400' },
]

const LEVELS = [
  { min: 0, max: 20, name: 'Beginner', icon: '🌱', color: 'text-white/40', glow: 'rgba(255,255,255,0.05)' },
  { min: 21, max: 35, name: 'Explorer', icon: '🧭', color: 'text-blue-400', glow: 'rgba(59,130,246,0.3)' },
  { min: 36, max: 45, name: 'Achiever', icon: '⭐', color: 'text-amber-400', glow: 'rgba(245,158,11,0.3)' },
  { min: 46, max: 48, name: 'Master', icon: '🏆', color: 'text-violet-400', glow: 'rgba(139,92,246,0.3)' },
  { min: 49, max: 50, name: 'Legend', icon: '👑', color: 'text-yellow-300', glow: 'rgba(250,204,21,0.4)' },
]

const STORAGE_KEY = 'consciousness-life-score'

function getLevel(total: number) {
  return LEVELS.find(l => total >= l.min && total <= l.max) || LEVELS[0]
}

export default function LifeScorePage() {
  const t = useT()
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
      <main className="min-h-screen bg-[#06060e] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-fuchsia-500/10 border-b-fuchsia-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#06060e] pb-24 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-fuchsia-900/15 blur-[100px]" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-indigo-900/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#06060e]/60 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 group">
            <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('life score')}</h1>
        </div>
      </header>

      <div className="relative z-10 px-5 py-6 space-y-6">
        {/* Score Display - Hero Card */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent" />
          <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.02]" />
          <div className="absolute inset-0 rounded-3xl border border-white/[0.08]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="relative p-8 text-center">
            <div className="text-7xl mb-3 drop-shadow-lg">{level.icon}</div>
            <div className="text-6xl font-black text-white mb-1 tracking-tight">
              {total}<span className="text-3xl text-white/20 font-light">/50</span>
            </div>
            <div className={`text-xl font-semibold ${level.color} mb-5`} style={{ textShadow: `0 0 20px ${level.glow}` }}>
              {level.name}
            </div>
            <div className="w-full bg-white/[0.04] rounded-full h-2.5 max-w-xs mx-auto backdrop-blur-sm border border-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="text-xs text-white/25 mt-2 font-medium tracking-wide">{percentage}% of maximum</div>
          </div>
        </div>

        {/* Radar Chart */}
        {total > 0 && (
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.02]" />
            <div className="absolute inset-0 rounded-3xl border border-white/[0.06]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="relative p-5">
              <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto drop-shadow-lg">
                <defs>
                  <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(139,92,246,0.15)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                  </radialGradient>
                  <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(139,92,246,0.25)" />
                    <stop offset="100%" stopColor="rgba(217,70,239,0.15)" />
                  </linearGradient>
                </defs>
                <circle cx="150" cy="150" r="120" fill="url(#radarGlow)" />
                {gridPolygons.map((points, i) => (
                  <polygon key={i} points={points} fill="none" stroke="white" strokeOpacity={0.04} strokeWidth={1} />
                ))}
                <polygon points={polygonPoints} fill="url(#radarFill)" stroke="#8b5cf6" strokeWidth={2.5} strokeLinejoin="round" />
                <polygon points={polygonPoints} fill="none" stroke="#a78bfa" strokeWidth={1} strokeLinejoin="round" strokeOpacity={0.4} strokeDasharray="4 4" />
                {radarPoints.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r={6} fill={p.color} opacity={0.2} />
                    <circle cx={p.x} cy={p.y} r={4} fill={p.color} />
                    <circle cx={p.x} cy={p.y} r={2} fill="white" opacity={0.8} />
                    <text x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fill={p.color} fontSize={13} fontWeight={700}>
                      {p.icon}
                    </text>
                    <text x={p.labelX} y={p.labelY + 14} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.35)" fontSize={9} fontWeight={500}>
                      {t(p.key)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] px-1">{t('rate')}</h2>
          {AREAS.map(area => (
            <div key={area.key} className="relative rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.02]" />
              <div className="absolute inset-0 rounded-2xl border border-white/[0.06] group-hover:border-white/[0.1] transition-colors duration-300" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: `${area.color}15`, border: `1px solid ${area.color}30` }}>
                      {area.icon}
                    </div>
                    <span className="text-white font-semibold text-sm">{t(area.key)}</span>
                  </div>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-black" style={{ color: area.color, textShadow: `0 0 20px ${area.color}40` }}>{scores[area.key] || 0}</span>
                    <span className="text-xs text-white/20">/10</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={scores[area.key] || 1}
                  onChange={e => setScore(area.key, parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${area.color} ${((scores[area.key] || 1) - 1) * 11.1}%, rgba(255,255,255,0.06) ${((scores[area.key] || 1) - 1) * 11.1}%)`,
                    accentColor: area.color,
                  }}
                />
                <div className="flex justify-between text-[10px] text-white/15 mt-2 font-medium">
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save & AI Buttons */}
        <div className="flex gap-3">
          <button onClick={saveScore} disabled={total === 0} className="flex-1 py-3.5 rounded-2xl relative overflow-hidden group disabled:opacity-20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 rounded-2xl border border-white/10" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative text-white font-semibold text-sm drop-shadow-lg">💾 Save Score</span>
          </button>
          <button onClick={getAIAdvice} disabled={total === 0 || aiLoading} className="flex-1 py-3.5 rounded-2xl relative overflow-hidden disabled:opacity-20 transition-all duration-300 group">
            <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.04]" />
            <div className="absolute inset-0 rounded-2xl border border-white/[0.08] group-hover:border-white/[0.15] transition-colors duration-300" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
            <span className="relative text-white/80 font-semibold text-sm">{aiLoading ? '...' : '🤖 AI Advice'}</span>
          </button>
        </div>

        {/* AI Advice */}
        {aiAdvice && (
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-violet-600/5 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.01]" />
            <div className="absolute inset-0 rounded-2xl border border-violet-500/20" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
            <div className="relative p-5">
              <h3 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-xs">💡</span>
                AI Suggestions
              </h3>
              <p className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">{aiAdvice}</p>
            </div>
          </div>
        )}

        {/* Weakest Area Highlight */}
        {total > 0 && weakest && (
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 via-amber-600/5 to-transparent" />
            <div className="absolute inset-0 backdrop-blur-3xl bg-white/[0.01]" />
            <div className="absolute inset-0 rounded-2xl border border-amber-500/15" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="relative p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">🎯</span>
                {t('balance')}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Your <strong className="text-white/80">{t(weakest.key)}</strong> score is <strong style={{ color: weakest.color }}>{scores[weakest.key] || 0}/10</strong>. Consider making this your next growth priority.
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors font-medium tracking-wide uppercase">
              <span>📊 History ({history.length} entries)</span>
              <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showHistory && (
              <div className="mt-4 space-y-3">
                {history.map(entry => {
                  const entryLevel = getLevel(entry.total)
                  return (
                    <div key={entry.id} className="relative rounded-2xl overflow-hidden group">
                      <div className="absolute inset-0 backdrop-blur-xl bg-white/[0.015]" />
                      <div className="absolute inset-0 rounded-2xl border border-white/[0.05] group-hover:border-white/[0.1] transition-colors duration-300" />
                      <div className="relative p-4 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-white/25 font-medium">{new Date(entry.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-lg">{entryLevel.icon}</span>
                            <span className="text-white font-bold text-lg">{entry.total}<span className="text-xs text-white/20">/50</span></span>
                            <span className={`text-xs font-medium ${entryLevel.color}`}>{entry.level}</span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {AREAS.map(a => (
                            <div key={a.key} className="text-center">
                              <div className="text-xs">{a.icon}</div>
                              <div className="text-[10px] font-bold" style={{ color: a.color }}>{entry.scores[a.key] || 0}</div>
                            </div>
                          ))}
                        </div>
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
