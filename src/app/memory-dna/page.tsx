'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Trait { name: string; percentage: number; description: string; color: string; icon: string }
interface DNAReport {
  traits: Trait[]
  coreValues: string[]
  lifeThemes: string[]
  strengths: string[]
  growthAreas: string[]
  identityStatement: string
  generatedAt: string
}

const TRAIT_COLORS: Record<string, string> = {
  Dreamer: '#a855f7', Fighter: '#ef4444', Lover: '#ec4899', Philosopher: '#3b82f6',
  Creator: '#f97316', Healer: '#10b981', Explorer: '#06b6d4', Leader: '#eab308',
  Nurturer: '#f472b6', Visionary: '#8b5cf6', Realist: '#6b7280', Adventurer: '#14b8a6',
}

const STORAGE_KEY = 'consciousness-memory-dna'

export default function MemoryDNAPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<DNAReport | null>(null)
  const [history, setHistory] = useState<DNAReport[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState('')

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
          if (data.latest) setReport(data.latest)
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const generateReport = async () => {
    setGenerating(true)
    setError('')
    try {
      const memories = JSON.parse(localStorage.getItem('consciousness-memories') || '[]')
      const memoryTexts = memories.map((m: any) => m.content || m.text || '').filter(Boolean).slice(0, 50)
      if (memoryTexts.length === 0) {
        setError('Add some memories first to generate your DNA report.')
        setGenerating(false)
        return
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Analyze these memories and create a Memory DNA report. Memories: ${JSON.stringify(memoryTexts)}\n\nReturn JSON only (no markdown):\n{"traits":[{"name":"Dreamer","percentage":25,"description":"one line"}],"coreValues":["value1","value2","value3"],"lifeThemes":["theme1","theme2","theme3"],"strengths":["s1","s2","s3"],"growthAreas":["g1","g2","g3"],"identityStatement":"You are primarily a X with strong Y tendencies"}\n\nTraits must total 100%. Use these names: Dreamer, Fighter, Lover, Philosopher, Creator, Healer, Explorer, Leader, Nurturer, Visionary. Pick 5-8.` }],
          systemPrompt: 'You are a personality analyst. Return only valid JSON, no markdown formatting.'
        })
      })
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse AI response')
      const parsed = JSON.parse(jsonMatch[0])
      const newReport: DNAReport = {
        traits: (parsed.traits || []).map((t: any) => ({
          ...t,
          color: TRAIT_COLORS[t.name] || '#8b5cf6',
          icon: ({ Dreamer: '🌙', Fighter: '⚔️', Lover: '💕', Philosopher: '🧠', Creator: '🎨', Healer: '💚', Explorer: '🧭', Leader: '👑', Nurturer: '🤗', Visionary: '🔮', Realist: '⚖️', Adventurer: '🏔️' } as Record<string, string>)[t.name] || '✨',
        })),
        coreValues: parsed.coreValues || [],
        lifeThemes: parsed.lifeThemes || [],
        strengths: parsed.strengths || [],
        growthAreas: parsed.growthAreas || [],
        identityStatement: parsed.identityStatement || '',
        generatedAt: new Date().toISOString(),
      }
      setReport(newReport)
      const newHistory = [newReport, ...history].slice(0, 10)
      setHistory(newHistory)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ latest: newReport, history: newHistory }))
    } catch (e: any) {
      setError('Failed to generate report. ' + (e.message || ''))
    }
    setGenerating(false)
  }

  const shareText = useMemo(() => {
    if (!report) return ''
    const top3 = report.traits.slice(0, 3).map(t => `${t.icon} ${t.name} ${t.percentage}%`).join(', ')
    return `🧬 My Memory DNA: ${top3}\n${report.identityStatement}\n#ConsciousnessClone`
  }, [report])

  const copyShare = () => navigator.clipboard.writeText(shareText)

  if (loading) {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center bg-[#030108] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] animate-pulse" />
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
          <div className="w-10 h-10 border-2 border-violet-500/60 border-t-transparent rounded-full animate-spin relative" />
        </div>
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24 bg-[#030108] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/8 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[60%] right-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/6 blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <header className="sticky top-0 z-50 bg-[#030108]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
            <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">🧬 Memory DNA</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {!report && !generating && (
          <div className="text-center py-12 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 text-7xl flex items-center justify-center blur-xl opacity-30 animate-pulse">🧬</div>
              <div className="relative text-7xl">🧬</div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">Memory DNA Report</h2>
              <p className="text-white/30 text-sm max-w-xs mx-auto mt-2 leading-relaxed">Discover who you truly are at your core. AI analyzes your memories to reveal your unique personality DNA.</p>
            </div>
            <button onClick={generateReport} className="relative px-8 py-3.5 rounded-xl font-medium overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 blur-xl" />
              <span className="relative z-10 text-white">✨ Generate My DNA</span>
            </button>
          </div>
        )}

        {generating && (
          <div className="text-center py-12 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
              </div>
              <div className="relative text-6xl animate-pulse">🧬</div>
            </div>
            <p className="text-white/40 tracking-wide">Analyzing your memories...</p>
            <div className="w-48 h-1 bg-white/[0.04] rounded-full mx-auto overflow-hidden border border-white/[0.04]">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-[loading_2s_ease-in-out_infinite] shadow-lg shadow-violet-500/40" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 text-sm bg-red-500/[0.06] border border-red-500/15 rounded-xl p-3 backdrop-blur-sm">
            {error}
          </div>
        )}

        {report && (
          <>
            {/* Identity Statement */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-60" />
              <div className="relative bg-gradient-to-br from-violet-500/[0.06] to-fuchsia-500/[0.06] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-6 text-center shadow-xl shadow-black/20">
                <div className="text-5xl mb-3">🧬</div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">Your Memory DNA</h2>
                <p className="text-white/50 text-sm italic leading-relaxed">{report.identityStatement}</p>
              </div>
            </div>

            {/* DNA Helix Visualization */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-indigo-500/10 rounded-2xl blur-xl opacity-40" />
              <div className="relative bg-white/[0.02] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-5 shadow-xl shadow-black/20">
                <h3 className="text-sm font-medium text-white/30 mb-4 text-center uppercase tracking-widest">Trait Helix</h3>
                <div className="relative h-64 flex items-end justify-center">
                  <div className="flex items-end gap-2 h-full pb-2">
                    {report.traits.map((trait, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="text-[10px] text-white/30 font-medium">{trait.percentage}%</div>
                        <div className="w-9 rounded-t-lg transition-all duration-1000 relative group" style={{ height: `${trait.percentage * 2}px`, background: `linear-gradient(to top, ${trait.color}20, ${trait.color}90)` }}>
                          <div className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${trait.color}40, ${trait.color})`, filter: `drop-shadow(0 0 8px ${trait.color}60)` }} />
                        </div>
                        <div className="text-lg drop-shadow-lg">{trait.icon}</div>
                        <div className="text-[9px] text-white/25 text-center leading-tight font-medium">{trait.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trait Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/25 uppercase tracking-widest">Trait Breakdown</h3>
              {report.traits.map((trait, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" style={{ background: `linear-gradient(135deg, ${trait.color}20, transparent)` }} />
                  <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-white/[0.05] p-4 hover:border-white/[0.1] transition-all duration-300 shadow-lg shadow-black/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg drop-shadow-lg">{trait.icon}</span>
                        <span className="font-semibold text-white/90">{trait.name}</span>
                      </div>
                      <span className="text-lg font-bold drop-shadow-lg" style={{ color: trait.color }}>{trait.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/[0.03] rounded-full h-2 mb-2 border border-white/[0.04]">
                      <div className="h-2 rounded-full transition-all duration-1000 shadow-md" style={{ width: `${trait.percentage}%`, backgroundColor: trait.color, boxShadow: `0 0 12px ${trait.color}40` }} />
                    </div>
                    <p className="text-xs text-white/35 leading-relaxed">{trait.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Life Map */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-violet-500/[0.08] p-4 hover:border-violet-500/[0.15] transition-all duration-300 shadow-lg shadow-black/10">
                  <h4 className="text-xs font-medium text-violet-400 mb-2.5">💎 Core Values</h4>
                  {report.coreValues.map((v, i) => <div key={i} className="text-xs text-white/40 py-0.5 leading-relaxed">• {v}</div>)}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-blue-500/[0.08] p-4 hover:border-blue-500/[0.15] transition-all duration-300 shadow-lg shadow-black/10">
                  <h4 className="text-xs font-medium text-blue-400 mb-2.5">🔮 Life Themes</h4>
                  {report.lifeThemes.map((t, i) => <div key={i} className="text-xs text-white/40 py-0.5 leading-relaxed">• {t}</div>)}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-emerald-500/[0.08] p-4 hover:border-emerald-500/[0.15] transition-all duration-300 shadow-lg shadow-black/10">
                  <h4 className="text-xs font-medium text-emerald-400 mb-2.5">🛡️ Strengths</h4>
                  {report.strengths.map((s, i) => <div key={i} className="text-xs text-white/40 py-0.5 leading-relaxed">• {s}</div>)}
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-amber-500/[0.08] p-4 hover:border-amber-500/[0.15] transition-all duration-300 shadow-lg shadow-black/10">
                  <h4 className="text-xs font-medium text-amber-400 mb-2.5">🌱 Growth Areas</h4>
                  {report.growthAreas.map((g, i) => <div key={i} className="text-xs text-white/40 py-0.5 leading-relaxed">• {g}</div>)}
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex gap-3">
              <button onClick={copyShare} className="flex-1 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] text-white/70 text-sm hover:bg-white/[0.06] hover:border-white/[0.1] hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
                📋 Copy DNA Card
              </button>
              <button onClick={generateReport} className="relative flex-1 py-3 rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 blur-xl" />
                <span className="relative z-10 text-white text-sm">🔄 Regenerate</span>
              </button>
            </div>

            {/* History */}
            {history.length > 1 && (
              <div>
                <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-white/25 hover:text-white/50 transition-colors duration-300">
                  📊 History ({history.length} reports) {showHistory ? '▲' : '▼'}
                </button>
                {showHistory && (
                  <div className="mt-3 space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="bg-white/[0.02] backdrop-blur-xl rounded-xl border border-white/[0.04] p-3 hover:border-white/[0.08] transition-all duration-300">
                        <div className="text-xs text-white/20">{new Date(h.generatedAt).toLocaleDateString()}</div>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {h.traits.slice(0, 3).map((t, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full backdrop-blur-sm border" style={{ backgroundColor: `${t.color}10`, color: t.color, borderColor: `${t.color}20` }}>{t.icon} {t.name} {t.percentage}%</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
