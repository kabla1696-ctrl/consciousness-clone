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
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">🧬 Memory DNA</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {!report && !generating && (
          <div className="text-center py-12 space-y-4">
            <div className="text-7xl mb-4">🧬</div>
            <h2 className="text-2xl font-bold text-white">Memory DNA Report</h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto">Discover who you truly are at your core. AI analyzes your memories to reveal your unique personality DNA.</p>
            <button onClick={generateReport} className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all">
              ✨ Generate My DNA
            </button>
          </div>
        )}

        {generating && (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl animate-pulse">🧬</div>
            <p className="text-white/50">Analyzing your memories...</p>
            <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {error && <div className="text-center text-red-400 text-sm bg-red-500/10 rounded-xl p-3">{error}</div>}

        {report && (
          <>
            {/* Identity Statement */}
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl border border-violet-500/20 p-6 text-center">
              <div className="text-5xl mb-3">🧬</div>
              <h2 className="text-lg font-bold text-white mb-2">Your Memory DNA</h2>
              <p className="text-white/60 text-sm italic">{report.identityStatement}</p>
            </div>

            {/* DNA Helix Visualization */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-medium text-white/50 mb-4 text-center">Trait Helix</h3>
              <div className="relative h-64 flex items-center justify-center">
                <div className="flex items-end gap-1 h-full">
                  {report.traits.map((trait, i) => (
                    <div key={i} className="flex flex-col items-center gap-1" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="text-xs text-white/40">{trait.percentage}%</div>
                      <div className="w-8 rounded-t-lg transition-all duration-1000" style={{ height: `${trait.percentage * 2}px`, background: `linear-gradient(to top, ${trait.color}40, ${trait.color})`, animationDelay: `${i * 150}ms` }} />
                      <div className="text-lg">{trait.icon}</div>
                      <div className="text-[9px] text-white/30 text-center leading-tight">{trait.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trait Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">Trait Breakdown</h3>
              {report.traits.map((trait, i) => (
                <div key={i} className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{trait.icon}</span>
                      <span className="font-semibold text-white">{trait.name}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: trait.color }}>{trait.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${trait.percentage}%`, backgroundColor: trait.color }} />
                  </div>
                  <p className="text-xs text-white/40">{trait.description}</p>
                </div>
              ))}
            </div>

            {/* Life Map */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl border border-violet-500/10 p-4">
                <h4 className="text-xs font-medium text-violet-400 mb-2">💎 Core Values</h4>
                {report.coreValues.map((v, i) => <div key={i} className="text-xs text-white/50 py-0.5">• {v}</div>)}
              </div>
              <div className="bg-white/5 rounded-xl border border-blue-500/10 p-4">
                <h4 className="text-xs font-medium text-blue-400 mb-2">🔮 Life Themes</h4>
                {report.lifeThemes.map((t, i) => <div key={i} className="text-xs text-white/50 py-0.5">• {t}</div>)}
              </div>
              <div className="bg-white/5 rounded-xl border border-emerald-500/10 p-4">
                <h4 className="text-xs font-medium text-emerald-400 mb-2">🛡️ Strengths</h4>
                {report.strengths.map((s, i) => <div key={i} className="text-xs text-white/50 py-0.5">• {s}</div>)}
              </div>
              <div className="bg-white/5 rounded-xl border border-amber-500/10 p-4">
                <h4 className="text-xs font-medium text-amber-400 mb-2">🌱 Growth Areas</h4>
                {report.growthAreas.map((g, i) => <div key={i} className="text-xs text-white/50 py-0.5">• {g}</div>)}
              </div>
            </div>

            {/* Share */}
            <div className="flex gap-3">
              <button onClick={copyShare} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors">📋 Copy DNA Card</button>
              <button onClick={generateReport} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all">🔄 Regenerate</button>
            </div>

            {/* History */}
            {history.length > 1 && (
              <div>
                <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-white/40 hover:text-white/60">
                  📊 History ({history.length} reports) {showHistory ? '▲' : '▼'}
                </button>
                {showHistory && (
                  <div className="mt-3 space-y-2">
                    {history.map((h, i) => (
                      <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-3">
                        <div className="text-xs text-white/30">{new Date(h.generatedAt).toLocaleDateString()}</div>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {h.traits.slice(0, 3).map((t, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${t.color}20`, color: t.color }}>{t.icon} {t.name} {t.percentage}%</span>
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
