'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Connection {
  id: string
  from: string
  to: string
  insight: string
}

interface Insight {
  id: string
  text: string
  category: string
  timestamp: string
}

const STORAGE_KEY = 'consciousness-dream-insights'

const SAMPLE_CONNECTIONS: Connection[] = [
  { id: '1', from: 'Childhood memories', to: 'Family values', insight: 'Your strongest childhood memories revolve around family gatherings and traditions' },
  { id: '2', from: 'Career goals', to: 'Education', insight: 'Your professional ambitions are deeply connected to continuous learning' },
  { id: '3', from: 'Travel experiences', to: 'Personal growth', insight: 'You tend to grow the most during solo travel experiences' },
  { id: '4', from: 'Relationships', to: 'Music preferences', insight: 'Certain songs trigger strong relationship memories' },
  { id: '5', from: 'Fear patterns', to: 'Childhood events', insight: 'Some current anxieties trace back to early life experiences' },
  { id: '6', from: 'Creative ideas', to: 'Dreams', insight: 'Your most creative ideas emerge from dream-like states' },
]

const MEMORY_CATEGORIES = [
  'Childhood', 'Family', 'Relationships', 'Career', 'Education',
  'Travel', 'Achievements', 'Fears', 'Dreams', 'Values',
  'Hobbies', 'Health', 'Friends', 'Life Lessons', 'Favorites',
]

export default function DreamModePage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [connections, setConnections] = useState<Connection[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [neurons, setNeurons] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([])
  const [pulseWaves, setPulseWaves] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number; delay: number }[]>([])

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
      try {
        const parsed = JSON.parse(stored)
        if (parsed.insights) setInsights(parsed.insights)
        if (parsed.connections) setConnections(parsed.connections)
      } catch {}
    }
  }, [])

  // Generate neural network nodes
  useEffect(() => {
    const nodes = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 3,
    }))
    setNeurons(nodes)

    const waves = Array.from({ length: 8 }, (_, i) => {
      const a = nodes[Math.floor(Math.random() * nodes.length)]
      const b = nodes[Math.floor(Math.random() * nodes.length)]
      return {
        id: i,
        startX: a.x,
        startY: a.y,
        endX: b.x,
        endY: b.y,
        delay: Math.random() * 4,
      }
    })
    setPulseWaves(waves)
  }, [])

  const saveInsights = useCallback((newInsights: Insight[], newConnections: Connection[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ insights: newInsights, connections: newConnections }))
  }, [])

  const handleProcess = async () => {
    setIsProcessing(true)
    setProcessProgress(0)

    const totalSteps = MEMORY_CATEGORIES.length
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(r => setTimeout(r, 400))
      setProcessProgress(Math.round(((i + 1) / totalSteps) * 80))
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze these memory categories and find interesting connections and patterns: ${MEMORY_CATEGORIES.join(', ')}. Return a JSON object with two arrays: "connections" (objects with "from", "to", "insight" fields - 4 items) and "insights" (objects with "text" and "category" fields - 3 items). Only return valid JSON, no markdown.`,
        }),
      })
      const data = await res.json()

      setProcessProgress(95)
      await new Promise(r => setTimeout(r, 500))

      try {
        let parsed = data.reply || data.content || ''
        const jsonMatch = parsed.match(/\{[\s\S]*\}/)
        if (jsonMatch) parsed = jsonMatch[0]

        const result = JSON.parse(parsed)

        const newConnections: Connection[] = (result.connections || []).map((c: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          from: c.from || 'Memory A',
          to: c.to || 'Memory B',
          insight: c.insight || 'Interesting pattern detected',
        }))

        const newInsights: Insight[] = (result.insights || []).map((ins: any, i: number) => ({
          id: `ins-${Date.now()}-${i}`,
          text: ins.text || 'Pattern found',
          category: ins.category || 'General',
          timestamp: new Date().toISOString(),
        }))

        const allConnections = newConnections.length > 0
          ? [...newConnections, ...SAMPLE_CONNECTIONS.slice(0, 2)]
          : SAMPLE_CONNECTIONS

        const allInsights = newInsights.length > 0
          ? [...newInsights, ...insights.slice(0, 3)]
          : [
              { id: '1', text: 'You talk about family most when discussing childhood', category: 'Pattern', timestamp: new Date().toISOString() },
              { id: '2', text: 'Career thoughts peak during Sunday evenings', category: 'Behavior', timestamp: new Date().toISOString() },
              { id: '3', text: 'Your happiest memories involve outdoor activities', category: 'Emotion', timestamp: new Date().toISOString() },
            ]

        setConnections(allConnections)
        setInsights(allInsights)
        saveInsights(allInsights, allConnections)
      } catch {
        const fallbackInsights: Insight[] = [
          { id: '1', text: 'You talk about family most when discussing childhood', category: 'Pattern', timestamp: new Date().toISOString() },
          { id: '2', text: 'Career thoughts peak during Sunday evenings', category: 'Behavior', timestamp: new Date().toISOString() },
          { id: '3', text: 'Your happiest memories involve outdoor activities', category: 'Emotion', timestamp: new Date().toISOString() },
        ]
        setConnections(SAMPLE_CONNECTIONS)
        setInsights([...fallbackInsights, ...insights.slice(0, 3)])
        saveInsights([...fallbackInsights, ...insights.slice(0, 3)], SAMPLE_CONNECTIONS)
      }
    } catch {
      const fallbackInsights: Insight[] = [
        { id: '1', text: 'You talk about family most when discussing childhood', category: 'Pattern', timestamp: new Date().toISOString() },
        { id: '2', text: 'Career thoughts peak during Sunday evenings', category: 'Behavior', timestamp: new Date().toISOString() },
        { id: '3', text: 'Your happiest memories involve outdoor activities', category: 'Emotion', timestamp: new Date().toISOString() },
      ]
      setConnections(SAMPLE_CONNECTIONS)
      setInsights([...fallbackInsights, ...insights.slice(0, 3)])
      saveInsights([...fallbackInsights, ...insights.slice(0, 3)], SAMPLE_CONNECTIONS)
    }

    setProcessProgress(100)
    await new Promise(r => setTimeout(r, 800))
    setIsProcessing(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/60 border-t-transparent animate-spin shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-600/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a1a]/70 border-b border-white/[0.06] shadow-[0_1px_30px_rgba(0,0,0,0.4)]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 -ml-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <span className="text-base">🌙</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">{t('dream mode')}</h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 py-5 pb-24 space-y-6">
        {/* Brain Visualization */}
        <div className="relative rounded-2xl" style={{ height: 280 }}>
          {/* Glassmorphism card */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.08] via-white/[0.02] to-fuchsia-500/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-transparent rounded-2xl" />

          {/* Neural Network Animation */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Connection lines */}
            {pulseWaves.map(wave => (
              <line
                key={wave.id}
                x1={wave.startX}
                y1={wave.startY}
                x2={wave.endX}
                y2={wave.endY}
                stroke="rgba(139, 92, 246, 0.15)"
                strokeWidth="0.3"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.05;0.35;0.05"
                  dur={`${3 + wave.delay}s`}
                  repeatCount="indefinite"
                />
              </line>
            ))}

            {/* Neurons */}
            {neurons.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 4}
                  fill="rgba(139, 92, 246, 0.3)"
                >
                  <animate
                    attributeName="r"
                    values={`${node.size / 5};${node.size / 3};${node.size / 5}`}
                    dur={`${2 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values="0.2;0.7;0.2"
                    dur={`${2 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Glow ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.08)"
                  strokeWidth="0.4"
                >
                  <animate
                    attributeName="r"
                    values={`${node.size / 3};${node.size / 1.2};${node.size / 3}`}
                    dur={`${3 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.05;0.2;0.05"
                    dur={`${3 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Pulse wave traveling along a line */}
            {pulseWaves.slice(0, 3).map(wave => (
              <circle key={`pulse-${wave.id}`} r="1.5" fill="rgba(167, 139, 250, 0.7)">
                <animateMotion
                  dur={`${2 + wave.delay}s`}
                  repeatCount="indefinite"
                  path={`M${wave.startX},${wave.startY} L${wave.endX},${wave.endY}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0"
                  dur={`${2 + wave.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>

          {/* Center brain icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="relative">
              <div className="absolute inset-0 text-6xl blur-xl opacity-30" style={{ animation: 'pulse 3s ease-in-out infinite' }}>🧠</div>
              <div className="text-6xl relative" style={{ animation: 'pulse 3s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))' }}>🧠</div>
            </div>
            {isProcessing ? (
              <div className="text-center mt-4">
                <div className="text-sm font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">{t('processing')} memories...</div>
                <div className="text-xs text-white/40">{processProgress}% complete</div>
              </div>
            ) : (
              <div className="text-center mt-4">
                <div className="text-sm text-white/50 font-medium">Your clone is {t('sleep').toLowerCase()}ing</div>
                <div className="text-xs text-white/25 mt-1">Finding patterns in your memories</div>
              </div>
            )}
          </div>

          {/* Processing progress bar */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-all duration-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                style={{ width: `${processProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full relative group overflow-hidden rounded-xl disabled:opacity-40 mb-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite] transition-all" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-[1px] rounded-[11px] bg-gradient-to-r from-violet-600/90 to-indigo-600/90 group-hover:from-violet-500/90 group-hover:to-indigo-500/90 transition-all" />
          <div className="relative text-white font-semibold py-3.5 flex items-center justify-center gap-2">
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <span>{t('sleep').charAt(0).toUpperCase() + t('sleep').slice(1)}ing...</span>
              </>
            ) : (
              <span className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">✨ {t('processing')} Dreams</span>
            )}
          </div>
        </button>

        {/* Memory Connections Found */}
        {connections.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
              Memory Connections Found
            </h2>
            <div className="space-y-2.5">
              {connections.map(conn => (
                <div
                  key={conn.id}
                  className="group rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:border-violet-500/20 hover:bg-white/[0.05] transition-all duration-300 shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-500/15 to-violet-500/10 text-violet-300 border border-violet-500/15 font-medium">{conn.from}</span>
                    <svg className="w-4 h-4 text-violet-500/50 group-hover:text-violet-400/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-gradient-to-r from-fuchsia-500/15 to-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/15 font-medium">{conn.to}</span>
                  </div>
                  <p className="text-xs text-white/45 leading-relaxed">{conn.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              Insights
            </h2>
            <div className="space-y-2.5">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className="rounded-xl backdrop-blur-xl bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] border border-amber-500/[0.12] p-4 shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:border-amber-500/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm">💡</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 leading-relaxed">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300/80 border border-amber-500/10 font-medium">{insight.category}</span>
                        <span className="text-[10px] text-white/20">
                          {new Date(insight.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Categories Being Processed */}
        <div>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
            Memory Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {MEMORY_CATEGORIES.map((cat, i) => (
              <span
                key={cat}
                className="text-xs px-3 py-1.5 rounded-lg backdrop-blur-md bg-white/[0.03] border border-white/[0.07] text-white/35 hover:text-white/50 hover:border-white/[0.12] transition-all cursor-default"
                style={{
                  animation: isProcessing ? `fadeInUp 0.3s ease ${i * 0.1}s both` : undefined,
                  boxShadow: isProcessing ? '0 0 8px rgba(139, 92, 246, 0.1)' : undefined,
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {connections.length === 0 && insights.length === 0 && !isProcessing && (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/10 flex items-center justify-center">
              <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.3))' }}>🧠</span>
            </div>
            <p className="text-white/30 text-sm max-w-sm mx-auto leading-relaxed">
              Press the button above to let your clone process memories and discover hidden patterns in your thoughts and experiences.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  )
}
