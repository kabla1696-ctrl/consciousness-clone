'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

const AURA_COLORS = [
  { name: 'Violet', color: '#8b5cf6', meaning: 'Spiritual awareness, intuition, higher consciousness', chakra: 'Crown' },
  { name: 'Indigo', color: '#6366f1', meaning: 'Deep intuition, perception, inner wisdom', chakra: 'Third Eye' },
  { name: 'Blue', color: '#3b82f6', meaning: 'Calm communication, truth, self-expression', chakra: 'Throat' },
  { name: 'Green', color: '#22c55e', meaning: 'Growth, healing, love, balance', chakra: 'Heart' },
  { name: 'Yellow', color: '#eab308', meaning: 'Confidence, joy, personal power', chakra: 'Solar Plexus' },
  { name: 'Orange', color: '#f97316', meaning: 'Creativity, passion, emotional energy', chakra: 'Sacral' },
  { name: 'Red', color: '#ef4444', meaning: 'Grounding, survival, physical energy', chakra: 'Root' },
  { name: 'White', color: '#f0f0f0', meaning: 'Purity, divine connection, enlightenment', chakra: 'Soul Star' },
  { name: 'Gold', color: '#d4a017', meaning: 'Wisdom, spiritual mastery, divine protection', chakra: 'Higher Crown' },
  { name: 'Rose', color: '#f472b6', meaning: 'Unconditional love, compassion, tenderness', chakra: 'Heart (Higher)' },
]

interface AuraReading { id: string; date: string; primary: string; secondary: string; energy: number; insight: string }

export default function CloneAuraPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [reading, setReading] = useState<AuraReading | null>(null)
  const [history, setHistory] = useState<AuraReading[]>([])
  const [pulsePhase, setPulsePhase] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try {
        const stored = localStorage.getItem('consciousness-aura')
        if (stored) {
          const data = JSON.parse(stored)
          setHistory(data.history || [])
          if (data.history?.length > 0) setReading(data.history[0])
        }
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setPulsePhase(p => (p + 1) % 360), 50)
    return () => clearInterval(interval)
  }, [])

  const scan = async () => {
    setScanning(true)
    setScanProgress(0)
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(r => setTimeout(r, 60))
      setScanProgress(i)
    }
    const memories = JSON.parse(localStorage.getItem('consciousness-memories') || '[]')
    const moods = JSON.parse(localStorage.getItem('consciousness-moods') || '[]')
    const personality = localStorage.getItem('consciousness-personality') || ''
    let aiInsight = ''
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Based on someone's memories (${memories.length} entries), moods, and personality traits, give a brief aura reading (2-3 sentences). Be mystical and poetic.` }],
          systemPrompt: 'You are a mystical aura reader. Give poetic, insightful aura readings. Be brief but profound.'
        })
      })
      const data = await res.json()
      aiInsight = data.choices?.[0]?.message?.content || 'Your aura shimmers with ancient light...'
    } catch { aiInsight = 'Your aura radiates with a complex tapestry of energies...' }

    const primary = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]
    let secondary = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]
    while (secondary.name === primary.name) secondary = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]
    const energy = 40 + Math.floor(Math.random() * 60)

    const newReading: AuraReading = {
      id: Date.now().toString(), date: new Date().toISOString(),
      primary: primary.name, secondary: secondary.name, energy, insight: aiInsight
    }
    const newHistory = [newReading, ...history]
    setHistory(newHistory)
    setReading(newReading)
    localStorage.setItem('consciousness-aura', JSON.stringify({ history: newHistory }))
    setScanning(false)
  }

  const primaryColor = AURA_COLORS.find(a => a.name === reading?.primary) || AURA_COLORS[0]
  const secondaryColor = AURA_COLORS.find(a => a.name === reading?.secondary) || AURA_COLORS[1]

  if (loading) return <main className="page-transition min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></main>

  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">🔮 Clone Aura</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Aura Visualization */}
        <div className="relative flex items-center justify-center py-8">
          <div className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${primaryColor.color}, ${secondaryColor.color})`, transform: `rotate(${pulsePhase}deg)` }} />
          <div className="absolute w-48 h-48 rounded-full opacity-30 blur-2xl" style={{ background: `radial-gradient(circle, ${secondaryColor.color}, transparent)`, transform: `rotate(${-pulsePhase * 1.5}deg)` }} />
          <div className="relative w-32 h-32 rounded-full border-2 flex items-center justify-center" style={{ borderColor: `${primaryColor.color}66`, background: `radial-gradient(circle, ${primaryColor.color}22, transparent)`, boxShadow: `0 0 60px ${primaryColor.color}33, inset 0 0 30px ${primaryColor.color}22` }}>
            <div className="text-center">
              <div className="text-3xl">🔮</div>
              {reading && <div className="text-xs font-medium mt-1" style={{ color: primaryColor.color }}>{reading.energy}%</div>}
            </div>
          </div>
        </div>

        {/* Scan Button */}
        <button onClick={scan} disabled={scanning} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium disabled:opacity-50">
          {scanning ? `Scanning... ${scanProgress}%` : '🔮 Scan Aura'}
        </button>
        {scanning && (
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
          </div>
        )}

        {/* Current Reading */}
        {reading && !scanning && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: `${primaryColor.color}11`, border: `1px solid ${primaryColor.color}22` }}>
                <div className="text-xs text-white/30 mb-1">Primary</div>
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: primaryColor.color, boxShadow: `0 0 20px ${primaryColor.color}66` }} />
                <div className="text-sm font-semibold" style={{ color: primaryColor.color }}>{reading.primary}</div>
                <div className="text-[10px] text-white/30 mt-1">{primaryColor.chakra} Chakra</div>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: `${secondaryColor.color}11`, border: `1px solid ${secondaryColor.color}22` }}>
                <div className="text-xs text-white/30 mb-1">Secondary</div>
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ background: secondaryColor.color, boxShadow: `0 0 20px ${secondaryColor.color}66` }} />
                <div className="text-sm font-semibold" style={{ color: secondaryColor.color }}>{reading.secondary}</div>
                <div className="text-[10px] text-white/30 mt-1">{secondaryColor.chakra} Chakra</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/5 p-4">
              <div className="text-xs text-white/30 mb-1">Meaning</div>
              <p className="text-sm text-white/60">{primaryColor.meaning}</p>
            </div>
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4">
              <div className="text-xs text-violet-400 mb-1">🌙 AI Aura Insight</div>
              <p className="text-sm text-white/60 italic">{reading.insight}</p>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/20">Energy Level</div>
              <div className="text-2xl font-bold" style={{ color: primaryColor.color }}>{reading.energy}%</div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-xs text-white/30 font-medium">Past Readings</h3>
            {history.slice(1, 6).map(h => {
              const pc = AURA_COLORS.find(a => a.name === h.primary) || AURA_COLORS[0]
              return (
                <div key={h.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full" style={{ background: pc.color, boxShadow: `0 0 10px ${pc.color}44` }} />
                  <div className="flex-1">
                    <div className="text-xs text-white/50">{h.primary} / {h.secondary}</div>
                    <div className="text-[10px] text-white/20">{new Date(h.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-xs font-medium" style={{ color: pc.color }}>{h.energy}%</div>
                </div>
              )
            })}
          </div>
        )}

        {/* All Aura Colors */}
        <div>
          <h3 className="text-xs text-white/30 font-medium mb-3">Aura Color Guide</h3>
          <div className="grid grid-cols-2 gap-2">
            {AURA_COLORS.map(a => (
              <div key={a.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}44` }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: a.color }}>{a.name}</div>
                  <div className="text-[10px] text-white/20">{a.chakra}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
