'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Confession { id: string; text: string; category: string; reactions: Record<string, number>; aiResponse: string; createdAt: string }

const CATEGORIES = [
  { id: 'love', icon: '❤️', label: 'Love' }, { id: 'regret', icon: '😔', label: 'Regret' },
  { id: 'secret', icon: '🤫', label: 'Secret' }, { id: 'achievement', icon: '🏆', label: 'Win' },
  { id: 'fear', icon: '😰', label: 'Fear' }, { id: 'dream', icon: '🌙', label: 'Dream' },
  { id: 'funny', icon: '😂', label: 'Funny' },
]

const REACTIONS = ['💔', '🤯', '😭', '😂', '🫂']

const SAMPLE_CONFESSIONS: Confession[] = [
  { id: '1', text: 'I still check their profile every night even though we broke up 2 years ago.', category: 'love', reactions: { '💔': 47, '😭': 23, '🫂': 31 }, aiResponse: 'Healing isn\'t linear. The heart remembers what the mind tries to forget.', createdAt: '2h ago' },
  { id: '2', text: 'I pretend to be strong in front of everyone but I cry myself to sleep most nights.', category: 'secret', reactions: { '💔': 89, '😭': 56, '🫂': 72 }, aiResponse: 'Strength isn\'t about never falling. It\'s about falling and still getting up.', createdAt: '4h ago' },
  { id: '3', text: 'I got promoted today but I have no one to celebrate with.', category: 'achievement', reactions: { '🏆': 34, '🫂': 45, '😭': 12 }, aiResponse: 'Your success doesn\'t need an audience. It needs YOU to be proud of it.', createdAt: '6h ago' },
  { id: '4', text: 'Sometimes I wonder if anyone would notice if I just disappeared.', category: 'fear', reactions: { '💔': 156, '🫂': 134, '😭': 89 }, aiResponse: 'You matter more than you know. Someone out there is grateful you exist.', createdAt: '8h ago' },
  { id: '5', text: 'I accidentally called my teacher "mom" in 5th grade and I still think about it at 3am.', category: 'funny', reactions: { '😂': 234, '🤯': 45 }, aiResponse: 'We\'ve all been there. That memory lives rent-free in your head forever.', createdAt: '12h ago' },
]

export default function CloneConfessions() {
  const t = useT();
  const [confessions, setConfessions] = useState<Confession[]>(SAMPLE_CONFESSIONS)
  const [showWrite, setShowWrite] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCat, setNewCat] = useState('secret')
  const [generating, setGenerating] = useState(false)
  const [selectedCat, setSelectedCat] = useState('all')

  useEffect(() => {
    const saved = localStorage.getItem('cc_confessions')
    if (saved) {
      const userConfessions = JSON.parse(saved)
      setConfessions([...userConfessions, ...SAMPLE_CONFESSIONS])
    }
  }, [])

  const submitConfession = async () => {
    if (!newText.trim()) return
    setGenerating(true)
    let aiResponse = ''
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Someone anonymously confessed: "${newText}"\n\nGive a short, poetic, philosophical response (1-2 sentences) that is empathetic and wise. Be like a wise friend, not a therapist.` }],
        }),
      })
      const data = await res.json()
      aiResponse = data.reply || 'Your truth sets you free.'
    } catch { aiResponse = 'Your truth sets you free.' }

    const confession: Confession = {
      id: Date.now().toString(), text: newText, category: newCat,
      reactions: {}, aiResponse, createdAt: 'just now',
    }
    const saved = localStorage.getItem('cc_confessions')
    const userConfessions = saved ? JSON.parse(saved) : []
    const updated = [confession, ...userConfessions]
    localStorage.setItem('cc_confessions', JSON.stringify(updated))
    setConfessions([confession, ...SAMPLE_CONFESSIONS])
    setNewText(''); setShowWrite(false); setGenerating(false)
  }

  const react = (id: string, emoji: string) => {
    setConfessions(confessions.map(c => c.id === id ? { ...c, reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 } } : c))
  }

  const filtered = selectedCat === 'all' ? confessions : confessions.filter(c => c.category === selectedCat)

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: 'rgba(139,92,246,0.2)', animation: `float${i % 3} ${10 + Math.random() * 10}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">🤫</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">{t('confessions')}</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2 scroll-container">
          <button onClick={() => setSelectedCat('all')} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap tap-feedback border ${selectedCat === 'all' ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'}`}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap tap-feedback border ${selectedCat === c.id ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'}`}>{c.icon} {c.label}</button>
          ))}
        </div>

        {/* Confession Feed */}
        <div className="space-y-4 mb-6">
          {filtered.map(c => {
            const cat = CATEGORIES.find(x => x.id === c.category)
            const totalReactions = Object.values(c.reactions).reduce((a, b) => a + b, 0)
            return (
              <div key={c.id} className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: 'rgba(139,92,246,0.1)' }}>
                    {cat?.icon || '💭'}
                  </div>
                  <span className="text-white/30 text-xs">{cat?.label}</span>
                  <span className="text-white/10 text-xs ml-auto">{c.createdAt}</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">&quot;{c.text}&quot;</p>
                <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(139,92,246,0.03)', borderLeft: '2px solid rgba(139,92,246,0.2)' }}>
                  <p className="text-violet-400/60 text-xs italic">✨ {c.aiResponse}</p>
                </div>
                <div className="flex items-center gap-1">
                  {REACTIONS.map(r => (
                    <button key={r} onClick={() => react(c.id, r)} className="px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.04] text-xs tap-feedback hover:border-violet-500/30 transition-all">
                      {r} <span className="text-white/20 ml-0.5">{c.reactions[r] || ''}</span>
                    </button>
                  ))}
                  <span className="text-white/10 text-[10px] ml-auto">{totalReactions} reactions</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Write Button */}
        <button onClick={() => setShowWrite(!showWrite)} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm tap-feedback" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
          🤫 {t('anonymous')}
        </button>

        {/* Write Form */}
        {showWrite && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-lg rounded-t-2xl border-t border-white/[0.06] p-4" style={{ background: 'linear-gradient(135deg, #0a0a1e, #050510)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm">{t('post confession')}</h3>
                <button onClick={() => setShowWrite(false)} className="text-white/40 tap-feedback">✕</button>
              </div>
              <textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="What's on your mind? No one will know it's you..." className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-28 focus:outline-none focus:border-violet-500/40 mb-3" />
              <div className="flex gap-2 mb-3 overflow-x-auto scroll-container">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setNewCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap tap-feedback border ${newCat === c.id ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'}`}>{c.icon} {c.label}</button>
                ))}
              </div>
              <button onClick={submitConfession} disabled={generating || !newText.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm tap-feedback disabled:opacity-30" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
                {generating ? '✨ Writing...' : `🤫 ${t('post confession')}`}
              </button>
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