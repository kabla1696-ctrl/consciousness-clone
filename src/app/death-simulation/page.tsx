'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Person { name: string; relation: string; emoji: string }
interface Farewell { person: Person; message: string; wouldMiss: string; regret: string; loading: boolean }

const PRESET_PEOPLE: Person[] = [
  { name: '', relation: 'Mother', emoji: '👩' }, { name: '', relation: 'Father', emoji: '👨' },
  { name: '', relation: 'Best Friend', emoji: '🫂' }, { name: '', relation: 'Spouse', emoji: '💑' },
  { name: '', relation: 'Sibling', emoji: '👫' }, { name: '', relation: 'Child', emoji: '👶' },
]

export default function DeathSimulation() {
  const t = useT()
  const [step, setStep] = useState<'warn' | 'setup' | 'generating' | 'result'>('warn')
  const [people, setPeople] = useState<Person[]>(PRESET_PEOPLE.map(p => ({ ...p })))
  const [farewells, setFarewells] = useState<Farewell[]>([])
  const [currentGen, setCurrentGen] = useState(0)
  const [memories, setMemories] = useState('')

  useEffect(() => { setMemories(localStorage.getItem('cc_memories_text') || '') }, [])

  const updateName = (idx: number, name: string) => {
    const updated = [...people]; updated[idx] = { ...updated[idx], name }; setPeople(updated)
  }

  const startSimulation = async () => {
    const filled = people.filter(p => p.name.trim())
    if (filled.length < 2) return alert('Add at least 2 people')
    setStep('generating')
    const results: Farewell[] = filled.map(p => ({ person: p, message: '', wouldMiss: '', regret: '', loading: true }))
    setFarewells(results)

    for (let i = 0; i < filled.length; i++) {
      setCurrentGen(i)
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `You are simulating what ${filled[i].name} (${filled[i].relation}) would write as a farewell message to the user who has passed away. User's memories: ${memories.substring(0, 2000)}\n\nGenerate 3 things:\n1. A heartfelt farewell message (2-3 sentences)\n2. What they would miss most about the user\n3. Their biggest regret\n\nFormat: FAREWELL: ... | MISS: ... | REGRET: ...`
            }],
          }),
        })
        const data = await res.json()
        const parts = (data.reply || '').split('|')
        results[i] = {
          ...results[i],
          message: parts[0]?.replace('FAREWELL:', '').trim() || `${filled[i].name} would miss you terribly.`,
          wouldMiss: parts[1]?.replace('MISS:', '').trim() || 'Your smile and laughter.',
          regret: parts[2]?.replace('REGRET:', '').trim() || 'Not telling you how much you meant.',
          loading: false,
        }
      } catch {
        results[i] = { ...results[i], message: `${filled[i].name} would miss you deeply.`, wouldMiss: 'Everything about you.', regret: 'Not saying goodbye.', loading: false }
      }
      setFarewells([...results])
    }
    setStep('result')
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #100515)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: 'rgba(244,63,94,0.3)', animation: `float${i % 3} ${10 + Math.random() * 10}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">💀</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">{t('death simulation')}</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* WARNING */}
        {step === 'warn' && (
          <div className="text-center">
            <div aria-hidden="true" className="text-7xl mb-4" style={{ animation: 'float-subtle 4s ease-in-out infinite' }}>💀</div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400 mb-2">{t('death simulation')}</h1>
            <p className="text-white/40 text-sm mb-4">{t('what they would say')}</p>
            <div className="rounded-xl border border-red-500/20 p-4 mb-6 text-left" style={{ background: 'rgba(239,68,68,0.05)' }}>
              <p className="text-red-400/80 text-xs font-semibold mb-2">⚠️ Emotional Content Warning</p>
              <p className="text-white/30 text-xs">This feature generates AI-simulated farewell messages. They may be very emotional. Take care of your mental health.</p>
            </div>
            <button onClick={() => setStep('setup')} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold tap-feedback" style={{ boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}>
              I&apos;m Ready 💔
            </button>
          </div>
        )}

        {/* SETUP */}
        {step === 'setup' && (
          <>
            <h2 className="text-lg font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">Who would miss you?</h2>
            <p className="text-white/30 text-xs mb-4">Add names of people important to you</p>
            <div className="space-y-3 mb-6">
              {people.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-xl">{p.emoji}</span>
                  <div className="flex-1">
                    <span className="text-white/30 text-[10px]">{p.relation}</span>
                    <input value={p.name} onChange={e => updateName(i, e.target.value)} placeholder={`Name of ${p.relation.toLowerCase()}`} className="w-full bg-transparent text-white text-sm focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={startSimulation} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold tap-feedback" style={{ boxShadow: '0 0 20px rgba(239,68,68,0.3)' }}>
              Simulate 💔
            </button>
          </>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div className="text-center">
            <div aria-hidden="true" className="text-5xl mb-4 animate-pulse">🕯️</div>
            <p className="text-white/40 text-sm mb-6">Generating farewell messages...</p>
            <div className="space-y-3">
              {farewells.map((f, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i <= currentGen ? 'border-red-500/20' : 'border-white/[0.04]'}`} style={{ background: i <= currentGen ? 'rgba(239,68,68,0.03)' : 'rgba(255,255,255,0.01)' }}>
                  <span className="text-lg">{f.person.emoji}</span>
                  <span className="text-sm">{f.person.name}</span>
                  <span className="ml-auto">{f.loading ? <span className="text-white/20 text-xs animate-pulse">writing...</span> : <span className="text-red-400/60 text-xs">✓</span>}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && (
          <div>
            <div className="text-center mb-6">
              <div aria-hidden="true" className="text-5xl mb-2">🕯️</div>
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-400">Farewell Messages</h2>
              <p className="text-white/30 text-xs">{t('what they would say')}</p>
            </div>
            <div className="space-y-4">
              {farewells.map((f, i) => (
                <div key={i} className="rounded-xl border border-white/[0.06] p-5 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{f.person.emoji}</span>
                    <span className="font-semibold text-sm">{f.person.name}</span>
                    <span className="text-white/20 text-xs">({f.person.relation})</span>
                  </div>
                  <div className="mb-3">
                    <p className="text-white/20 text-[10px] mb-1">💌 {t('final words')}</p>
                    <p className="text-white/70 text-sm italic">&quot;{f.message}&quot;</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-white/20 text-[10px] mb-1">💔 Would Miss Most</p>
                    <p className="text-white/50 text-xs">{f.wouldMiss}</p>
                  </div>
                  <div>
                    <p className="text-white/20 text-[10px] mb-1">😔 Biggest Regret</p>
                    <p className="text-white/50 text-xs">{f.regret}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
      `}</style>
    </main>
  )
}