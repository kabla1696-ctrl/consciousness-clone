'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface DreamInsight {
  id: string
  insight: string
  connections: number
  memories_used: string[]
  created_at: string
  duration_seconds: number
}

interface Memory {
  id: string
  content: string
  category: string
  created_at: string
}

export default function AstronautMode() {
  const [user, setUser] = useState<any>(null)
  const [isDreaming, setIsDreaming] = useState(false)
  const [isFaceDown, setIsFaceDown] = useState(false)
  const [dreamInsight, setDreamInsight] = useState('')
  const [dreamConnections, setDreamConnections] = useState(0)
  const [dreamHistory, setDreamHistory] = useState<DreamInsight[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dreamStartTime, setDreamStartTime] = useState<number>(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([])
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([])

  const dreamTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Generate floating particles
  useEffect(() => {
    const p = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 15 + Math.random() * 30,
      delay: Math.random() * 10,
    }))
    setParticles(p)

    const s = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.6,
    }))
    setStars(s)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data } = await supabase
        .from('memories')
        .select('id, content, category, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setMemories(data)

      const stored = localStorage.getItem('astronaut-dreams')
      if (stored) setDreamHistory(JSON.parse(stored))
    }
    init()
  }, [])

  // DeviceOrientation listener
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const beta = e.beta // front-back tilt: -180 to 180
      if (beta !== null) {
        // Phone face-down: beta ≈ 180 or -180
        const faceDown = beta > 150 || beta < -150
        setIsFaceDown(faceDown)
      }
    }

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation)
      return () => window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  // Start dreaming when face-down
  useEffect(() => {
    if (isFaceDown && !isDreaming) {
      startDreaming()
    }
  }, [isFaceDown])

  const generateInsight = async () => {
    if (generating || memories.length === 0) return
    setGenerating(true)
    setDreamInsight('')
    setDreamConnections(0)

    try {
      const memoryTexts = memories.slice(0, 20).map(m => `- ${m.content} [${m.category}]`).join('\n')

      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are analyzing a person's memories while they sleep, looking for hidden connections, patterns, and insights they might not see themselves.\n\nHere are their recent memories:\n${memoryTexts}\n\nPlease:\n1. Find 2-3 surprising connections between different memories\n2. Identify an emotional pattern or recurring theme\n3. Generate one profound insight or "dream wisdom" — written poetically, like something you'd realize in a dream\n4. Estimate how many connections you found\n\nFormat your response as:\nCONNECTIONS: [number]\n\n[Your dream insight in 2-4 beautiful paragraphs]`
          }],
          memories: '',
          systemPrompt: 'You are the dream state of a consciousness clone. When the human sleeps, you analyze their memories to find hidden connections and profound insights. Be poetic, insightful, and slightly surreal — like actual dreams. Be genuine and touching.',
        }),
      })

      const data = await response.json()
      const reply = data.reply || 'The dreams were too deep to recall...'

      // Parse connections count
      const connMatch = reply.match(/CONNECTIONS:\s*(\d+)/)
      const connections = connMatch ? parseInt(connMatch[1]) : Math.floor(Math.random() * 5) + 1
      const insightText = reply.replace(/CONNECTIONS:\s*\d+\n*/g, '').trim()

      setDreamInsight(insightText)
      setDreamConnections(connections)

      const duration = Math.floor((Date.now() - dreamStartTime) / 1000)

      const dream: DreamInsight = {
        id: Date.now().toString(),
        insight: insightText,
        connections,
        memories_used: memories.slice(0, 20).map(m => m.content.slice(0, 50)),
        created_at: new Date().toISOString(),
        duration_seconds: duration,
      }

      const updated = [dream, ...dreamHistory]
      setDreamHistory(updated)
      localStorage.setItem('astronaut-dreams', JSON.stringify(updated))
    } catch (err) {
      setDreamInsight('The dreamscape was clouded... try again when the stars align.')
      setDreamConnections(0)
    }

    setGenerating(false)
  }

  const startDreaming = () => {
    setIsDreaming(true)
    setDreamStartTime(Date.now())
    setDreamInsight('')
    setDreamConnections(0)

    // Auto-generate after a "dream period"
    dreamTimerRef.current = setTimeout(() => {
      generateInsight()
    }, 3000)
  }

  const stopDreaming = () => {
    setIsDreaming(false)
    if (dreamTimerRef.current) clearTimeout(dreamTimerRef.current)
  }

  const deleteDream = (id: string) => {
    const updated = dreamHistory.filter(d => d.id !== id)
    setDreamHistory(updated)
    localStorage.setItem('astronaut-dreams', JSON.stringify(updated))
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Entering orbit...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm">🌌</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Astronaut Mode</h1>
            <p className="text-[10px] text-indigo-400 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isDreaming ? 'bg-violet-400 animate-pulse' : 'bg-white/20'}`} />
              {isDreaming ? 'Clone is dreaming...' : 'Night Mode'}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/40 hover:text-indigo-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Dream Overlay — Space Background */}
      {isDreaming && (
        <div className="fixed inset-0 z-40 bg-[#050510] overflow-hidden">
          {/* Stars */}
          {stars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}

          {/* Neural Network Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
            {particles.slice(0, 15).map((p, i) => {
              const p2 = particles[(i + 3) % particles.length]
              return (
                <line
                  key={`line-${i}`}
                  x1={`${p.x}%`}
                  y1={`${p.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="#8b5cf6"
                  strokeWidth="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              )
            })}
          </svg>

          {/* Floating Particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-violet-500/30"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `float-particle ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}

          {/* Central Dream Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <div className="animate-pulse mb-6">
              <span className="text-6xl">🌙</span>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent mb-2">
              Clone is dreaming...
            </h2>
            <p className="text-white/30 text-sm mb-8">Analyzing memories, finding hidden connections</p>

            {generating && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            )}

            {dreamInsight && !generating && (
              <div className="max-w-md mx-auto space-y-4 animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-violet-400">✨</span>
                  <span className="text-sm text-violet-300 font-medium">
                    Found {dreamConnections} new connection{dreamConnections !== 1 ? 's' : ''} while you slept
                  </span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">{dreamInsight}</p>
                <button
                  onClick={stopDreaming}
                  className="mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 active:scale-[0.98] transition"
                >
                  Wake Up ✨
                </button>
              </div>
            )}
          </div>

          {/* Bottom: Stop button if no insight yet */}
          {!dreamInsight && !generating && (
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <button
                onClick={stopDreaming}
                className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/40 text-sm"
              >
                Wake Up Early
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Dream History Panel */}
        {showHistory && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Dream Journal</h3>
              <span className="text-xs text-white/30">{dreamHistory.length} dreams</span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {dreamHistory.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No dreams recorded yet</p>
              ) : (
                dreamHistory.map(d => (
                  <div key={d.id} className="px-4 py-3 border-b border-white/[0.03] group hover:bg-white/[0.02] transition">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-violet-400">✨ {d.connections} connections</span>
                        {d.duration_seconds > 0 && (
                          <span className="text-[10px] text-white/20">· {formatDuration(d.duration_seconds)}</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteDream(d.id)}
                        className="text-white/10 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed line-clamp-3">{d.insight}</p>
                    <p className="text-[10px] text-white/15 mt-1">
                      {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isDreaming && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-violet-500/10 animate-pulse" />
                <span className="text-4xl relative z-10">🌌</span>
              </div>
              <h2 className="text-lg font-bold text-white/90 mb-1">Astronaut Mode</h2>
              <p className="text-white/30 text-sm max-w-xs mx-auto">
                Place your phone face-down to enter dream mode. Your clone will analyze memories and find hidden connections.
              </p>
            </div>

            {/* Status Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                  <span className="text-lg">📱</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Orientation Detection</p>
                  <p className="text-xs text-white/30">
                    {typeof DeviceOrientationEvent !== 'undefined'
                      ? 'Supported — flip phone face-down to dream'
                      : 'Not supported — use manual button below'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isFaceDown ? 'bg-green-400' : 'bg-white/20'}`} />
                <span className="text-white/40">{isFaceDown ? 'Phone is face-down' : 'Phone is upright'}</span>
              </div>
            </div>

            {/* Manual Dream Button */}
            <button
              onClick={startDreaming}
              disabled={memories.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/20 active:scale-[0.98] transition disabled:opacity-30 disabled:shadow-none"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-lg">🌙</span>
                Enter Dream Mode
              </span>
              <span className="block text-xs text-white/50 mt-1">
                {memories.length > 0
                  ? `Analyzing ${memories.length} memories`
                  : 'No memories to analyze'}
              </span>
            </button>

            {/* Memory Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
                <p className="text-lg font-bold text-violet-300">{memories.length}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Memories</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
                <p className="text-lg font-bold text-indigo-300">{dreamHistory.length}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Dreams</p>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
                <p className="text-lg font-bold text-blue-300">{dreamHistory.reduce((a, d) => a + d.connections, 0)}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Connections</p>
              </div>
            </div>

            {/* Recent Dream Preview */}
            {dreamHistory.length > 0 && (
              <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">✨</span>
                  <p className="text-xs font-medium text-violet-300">Last Dream Insight</p>
                </div>
                <p className="text-sm text-white/50 leading-relaxed line-clamp-3">{dreamHistory[0].insight}</p>
                <p className="text-[10px] text-white/20 mt-2">
                  {new Date(dreamHistory[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

            {/* How It Works */}
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">How It Works</h3>
              {[
                { icon: '📱', title: 'Flip your phone', desc: 'Place it face-down on a surface' },
                { icon: '🧠', title: 'Clone enters dream state', desc: 'AI analyzes your stored memories' },
                { icon: '🔗', title: 'Connections found', desc: 'Hidden patterns and themes emerge' },
                { icon: '💡', title: 'Dream insights', desc: 'Poetic wisdom from your subconscious' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-base mt-0.5">{step.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-white/60">{step.title}</p>
                    <p className="text-[10px] text-white/25">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  )
}
