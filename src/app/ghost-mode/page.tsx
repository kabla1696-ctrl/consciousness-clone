'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface GhostContact { name: string; emoji: string; frequency: string; style: string }
interface GhostMessage { to: string; message: string; date: string; sent: boolean }

export default function GhostMode() {
  const t = useT()
  const [enabled, setEnabled] = useState(false)
  const [contacts, setContacts] = useState<GhostContact[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFreq, setNewFreq] = useState('weekly')
  const [newStyle, setNewStyle] = useState('cryptic')
  const [previewMsgs, setPreviewMsgs] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [inactivityDays, setInactivityDays] = useState(30)

  useEffect(() => {
    const g = localStorage.getItem('cc_ghost_mode')
    if (g) { const d = JSON.parse(g); setEnabled(d.enabled); setContacts(d.contacts || []); setInactivityDays(d.inactivityDays || 30) }
  }, [])

  const save = (e: boolean, c: GhostContact[], d: number) => {
    setEnabled(e); setContacts(c); setInactivityDays(d)
    localStorage.setItem('cc_ghost_mode', JSON.stringify({ enabled: e, contacts: c, inactivityDays: d }))
  }

  const addContact = () => {
    if (!newName.trim()) return
    const c = [...contacts, { name: newName, emoji: '👻', frequency: newFreq, style: newStyle }]
    save(enabled, c, inactivityDays); setNewName(''); setShowAdd(false)
  }

  const removeContact = (i: number) => save(enabled, contacts.filter((_, j) => j !== i), inactivityDays)

  const generatePreview = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate 3 ${newStyle} ghost messages that a deceased person's clone would send to their loved one named "${newName || 'friend'}". Make them mysterious, emotional, and slightly unsettling but beautiful. Each message should be 1-2 sentences. Separate with |`
          }],
        }),
      })
      const data = await res.json()
      setPreviewMsgs((data.reply || '').split('|').map((m: string) => m.trim()).filter(Boolean))
    } catch { setPreviewMsgs(['I am still here...', 'Remember me...', 'I see you...']) }
    setGenerating(false)
  }

  const STYLES = [
    { id: 'cryptic', label: '🔮 Cryptic', desc: 'Mysterious & haunting' },
    { id: 'warm', label: '💝 Warm', desc: 'Loving & gentle' },
    { id: 'funny', label: '😂 Funny', desc: 'Like nothing happened' },
    { id: 'wisdom', label: '🦉 Wisdom', desc: 'Life lessons from beyond' },
  ]

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #100520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(4)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: 'rgba(139,92,246,0.2)', animation: `float${i % 3} ${12 + Math.random() * 10}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">👻</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">{t('ghost mode')}</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* Toggle */}
        <div className="rounded-xl border border-violet-500/20 p-5 mb-6 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(168,85,247,0.03))' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold">Ghost Mode</h3>
              <p className="text-white/30 text-xs">{t('messages from beyond')}</p>
            </div>
            <button onClick={() => save(!enabled, contacts, inactivityDays)} className={`w-14 h-7 rounded-full transition-all tap-feedback ${enabled ? 'bg-violet-500' : 'bg-white/[0.1]'}`}>
              <div className={`w-6 h-6 rounded-full bg-white transition-all shadow-lg ${enabled ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {enabled && (
            <div className="flex items-center gap-2 text-violet-400/60 text-xs">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              {t('invisible')} — will trigger after {inactivityDays} days of inactivity
            </div>
          )}
        </div>

        {/* Inactivity Timer */}
        <div className="rounded-xl border border-white/[0.06] p-4 mb-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <label className="text-white/40 text-xs mb-2 block">Inactivity Trigger (days)</label>
          <div className="grid grid-cols-5 gap-2">
            {[7, 14, 30, 90, 365].map(d => (
              <button key={d} onClick={() => save(enabled, contacts, d)} className={`py-2 rounded-lg text-xs font-medium tap-feedback ${inactivityDays === d ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border`}>{d}d</button>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Ghost Recipients</h3>
            <button onClick={() => setShowAdd(!showAdd)} className="text-violet-400 text-xs tap-feedback">+ Add</button>
          </div>
          {contacts.length === 0 && !showAdd && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👻</div>
              <p className="text-white/20 text-xs">No recipients yet</p>
            </div>
          )}
          <div className="space-y-2 mb-4">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-lg">{c.emoji}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">{c.name}</span>
                  <div className="text-white/20 text-[10px]">{c.frequency} • {c.style}</div>
                </div>
                <button onClick={() => removeContact(i)} className="text-white/20 text-xs tap-feedback">✕</button>
              </div>
            ))}
          </div>

          {showAdd && (
            <div className="rounded-xl border border-violet-500/20 p-4 mb-4" style={{ background: 'rgba(139,92,246,0.03)' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm mb-3 focus:outline-none focus:border-violet-500/40" />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {['daily', 'weekly', 'monthly', 'yearly'].map(f => (
                  <button key={f} onClick={() => setNewFreq(f)} className={`py-2 rounded-lg text-xs capitalize tap-feedback ${newFreq === f ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border`}>{f}</button>
                ))}
              </div>
              <div className="space-y-2 mb-3">
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setNewStyle(s.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl tap-feedback ${newStyle === s.id ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.06] bg-white/[0.02]'} border`}>
                    <span>{s.label}</span>
                    <span className="text-white/20 text-[10px]">{s.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addContact} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium tap-feedback">Add</button>
                <button onClick={generatePreview} className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm tap-feedback">{generating ? '...' : t('haunt')}</button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Messages */}
        {previewMsgs.length > 0 && (
          <div className="rounded-xl border border-violet-500/20 p-4 mb-4" style={{ background: 'rgba(139,92,246,0.03)' }}>
            <h4 className="text-xs font-semibold text-violet-400 mb-3">👻 {t('haunt')}</h4>
            {previewMsgs.map((m, i) => (
              <div key={i} className="mb-2 last:mb-0 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-white/60 text-xs italic">&quot;{m}&quot;</p>
                <p className="text-white/20 text-[10px] mt-1">→ {newName || 'Recipient'} • {newFreq}</p>
              </div>
            ))}
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