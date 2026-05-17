'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'

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

    // Generate connection lines
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

    // Simulate processing stages
    const totalSteps = MEMORY_CATEGORIES.length
    for (let i = 0; i < totalSteps; i++) {
      await new Promise(r => setTimeout(r, 400))
      setProcessProgress(Math.round(((i + 1) / totalSteps) * 80))
    }

    // Send to AI for pattern analysis
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
        // Try to parse AI response as JSON
        let parsed = data.reply || data.content || ''
        // Extract JSON if wrapped in markdown
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

        // Add sample connections if AI didn't return enough
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
        // Fallback to sample data
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
      // Offline fallback
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
            <span className="text-xl">🌙</span>
            <h1 className="text-lg font-bold">Dream Mode</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Brain Visualization */}
        <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden mb-6" style={{ height: 260 }}>
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
                  values="0.05;0.3;0.05"
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
                    values="0.2;0.6;0.2"
                    dur={`${2 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Glow */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size / 2}
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.1)"
                  strokeWidth="0.3"
                >
                  <animate
                    attributeName="r"
                    values={`${node.size / 3};${node.size / 1.5};${node.size / 3}`}
                    dur={`${3 + node.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Pulse wave traveling along a line */}
            {pulseWaves.slice(0, 3).map(wave => (
              <circle key={`pulse-${wave.id}`} r="1.5" fill="rgba(139, 92, 246, 0.6)">
                <animateMotion
                  dur={`${2 + wave.delay}s`}
                  repeatCount="indefinite"
                  path={`M${wave.startX},${wave.startY} L${wave.endX},${wave.endY}`}
                />
                <animate
                  attributeName="opacity"
                  values="0;0.8;0"
                  dur={`${2 + wave.delay}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </svg>

          {/* Center brain icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="text-6xl mb-3" style={{ animation: 'pulse 3s ease-in-out infinite' }}>🧠</div>
            {isProcessing ? (
              <div className="text-center">
                <div className="text-sm text-violet-400 font-semibold mb-1">Processing memories...</div>
                <div className="text-xs text-white/30">{processProgress}% complete</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-sm text-white/40">Your clone is dreaming</div>
                <div className="text-xs text-white/20 mt-1">Finding patterns in your memories</div>
              </div>
            )}
          </div>

          {/* Processing progress bar */}
          {isProcessing && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06]">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${processProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold py-3.5 rounded-xl tap-feedback disabled:opacity-40 mb-6"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              Dreaming...
            </span>
          ) : (
            '✨ Begin Dream Processing'
          )}
        </button>

        {/* Memory Connections Found */}
        {connections.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              🔗 Memory Connections Found
            </h2>
            <div className="space-y-2">
              {connections.map(conn => (
                <div
                  key={conn.id}
                  className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">{conn.from}</span>
                    <svg className="w-4 h-4 text-violet-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400">{conn.to}</span>
                  </div>
                  <p className="text-xs text-white/50">{conn.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              💡 Insights
            </h2>
            <div className="space-y-2">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className="rounded-xl border border-amber-500/20 p-4 bg-amber-500/[0.03]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">💡</span>
                    <div className="flex-1">
                      <p className="text-sm text-white/70">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{insight.category}</span>
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
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            🧩 Memory Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {MEMORY_CATEGORIES.map((cat, i) => (
              <span
                key={cat}
                className="text-xs px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/30"
                style={{
                  animation: isProcessing ? `fadeInUp 0.3s ease ${i * 0.1}s both` : undefined,
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {connections.length === 0 && insights.length === 0 && !isProcessing && (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm max-w-sm mx-auto">
              Press the button above to let your clone process memories and discover hidden patterns in your thoughts and experiences.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
