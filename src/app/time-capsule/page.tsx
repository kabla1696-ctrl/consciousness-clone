'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface TimeCapsule {
  id: string
  content: string
  recipient_email: string | null
  recipient_name: string
  unlock_date: string
  is_unlocked: boolean
  category: string
  created_at: string
}

const CATEGORIES = [
  { id: 'message', label: 'Message', icon: '💌', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/30' },
  { id: 'memory', label: 'Memory', icon: '🧠', gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/30' },
  { id: 'wish', label: 'Wish', icon: '⭐', gradient: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/30' },
  { id: 'prediction', label: 'Prediction', icon: '🔮', gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/30' },
]

function getTimeRemaining(unlockDate: string) {
  const now = new Date().getTime()
  const unlock = new Date(unlockDate).getTime()
  const diff = unlock - now
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { days, hours, minutes, seconds }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function FlipDigit({ value }: { value: number }) {
  const str = String(value).padStart(2, '0')
  return (
    <div className="relative">
      <div className="flip-digit bg-gradient-to-b from-white/[0.08] to-white/[0.02] rounded-lg border border-white/[0.06] overflow-hidden">
        <div className="px-2 py-2 sm:px-3 sm:py-3">
          <span className="text-xl sm:text-2xl font-bold text-violet-400 tabular-nums font-mono">{str}</span>
        </div>
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.04]" />
      </div>
    </div>
  )
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${['rgba(139,92,246,0.4)', 'rgba(217,70,239,0.4)', 'rgba(245,158,11,0.3)'][i % 3]}, transparent)`,
            animationDuration: `${Math.random() * 6 + 4}s`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  )
}

function UnlockExplosion({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="explosion-ring" />
      <div className="explosion-ring" style={{ animationDelay: '0.2s' }} />
      <div className="explosion-ring" style={{ animationDelay: '0.4s' }} />
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 animate-particle"
          style={{
            transform: `rotate(${i * 30}deg)`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
      <div className="text-6xl animate-bounce-in">🔓</div>
    </div>
  )
}

export default function TimeCapsulePage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [unlockingId, setUnlockingId] = useState<string | null>(null)

  const [content, setContent] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [category, setCategory] = useState('message')

  const [tick, setTick] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await loadCapsules(user.id)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const loadCapsules = async (userId: string) => {
    const { data } = await supabase
      .from('time_capsules')
      .select('*')
      .eq('user_id', userId)
      .order('unlock_date', { ascending: true })
    if (data) setCapsules(data)
  }

  useEffect(() => {
    if (!user) return
    const checkUnlocks = async () => {
      const now = new Date().toISOString()
      const lockedPast = capsules.filter(c => !c.is_unlocked && c.unlock_date <= now)
      if (lockedPast.length > 0) {
        setUnlockingId(lockedPast[0].id)
        for (const cap of lockedPast) {
          await supabase.from('time_capsules').update({ is_unlocked: true }).eq('id', cap.id)
        }
        await loadCapsules(user.id)
      }
    }
    checkUnlocks()
  }, [tick, user, capsules])

  const handleCreate = async () => {
    if (!content.trim() || !recipientName.trim() || !unlockDate || !user) return
    setSaving(true)
    const { error } = await supabase.from('time_capsules').insert({
      user_id: user.id,
      content: content.trim(),
      recipient_name: recipientName.trim(),
      recipient_email: recipientEmail.trim() || null,
      unlock_date: new Date(unlockDate).toISOString(),
      category,
      is_unlocked: false,
    })
    if (!error) {
      setContent(''); setRecipientName(''); setRecipientEmail(''); setUnlockDate(''); setCategory('message')
      setShowForm(false)
      await loadCapsules(user.id)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    await supabase.from('time_capsules').delete().eq('id', id)
    await loadCapsules(user.id)
  }

  const lockedCapsules = capsules.filter(c => !c.is_unlocked)
  const unlockedCapsules = capsules.filter(c => c.is_unlocked)

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center text-xl">⏳</div>
        </div>
        <div className="mt-4 text-white/30 text-sm">{t('loading')}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; } 50% { transform: translateY(-20px) rotate(180deg); opacity: 1; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.4), 0 0 60px rgba(217,70,239,0.2); } }
        @keyframes chain-swing { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes explosion { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes particle-fly { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        @keyframes bounce-in { 0% { transform: scale(0); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-chain-swing { animation: chain-swing 3s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .explosion-ring { position: absolute; width: 100px; height: 100px; border-radius: 50%; border: 2px solid rgba(139,92,246,0.6); animation: explosion 1s ease-out forwards; }
        .animate-particle { animation: particle-fly 1s ease-out forwards; --tx: calc(cos(var(--angle)) * 150px); --ty: calc(sin(var(--angle)) * 150px); }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
        .capsule-locked { position: relative; overflow: hidden; }
        .capsule-locked::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,92,246,0.03) 10px, rgba(139,92,246,0.03) 20px); pointer-events: none; }
      `}</style>

      {unlockingId && <UnlockExplosion onComplete={() => setUnlockingId(null)} />}

      <FloatingParticles />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1 group">
            <svg className="w-6 h-6 text-white/60 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-xl">⏳</span>
              <div className="absolute -inset-1 bg-violet-500/20 rounded-full blur-md" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('time capsule')}</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowForm(!showForm)}
            className="relative overflow-hidden bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 text-sm font-medium px-4 py-2 rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition-all tap-feedback group"
          >
            <span className="relative z-10">{showForm ? t('cancel') : '+ New'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 transition-all" />
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 relative">
        {/* Create Form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-violet-500/20 p-5 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 backdrop-blur-xl space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse-glow">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-violet-400">{t('add')}</h2>
                <p className="text-[10px] text-white/30">Seal your words for the future</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">{t('name')}</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Who is this for?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">{t('email')}</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Unlock Date</label>
              <input
                type="date"
                value={unlockDate}
                onChange={e => setUnlockDate(e.target.value)}
                min={minDateStr}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block font-medium">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs tap-feedback transition-all ${
                      category === cat.id
                        ? `bg-gradient-to-b ${cat.gradient}/20 border border-violet-500/40 shadow-lg ${cat.glow}`
                        : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`text-xl ${category === cat.id ? 'drop-shadow-lg' : ''}`}>{cat.icon}</span>
                    <span className={category === cat.id ? 'text-violet-400 font-medium' : 'text-white/40'}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Your Message</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message to the future..."
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all resize-none"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !content.trim() || !recipientName.trim() || !unlockDate}
              className="w-full relative overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3.5 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all group"
            >
              <span className="relative z-10">{saving ? '⏳ Sealing...' : '🔒 Seal Time Capsule'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {capsules.length === 0 && !showForm && (
          <div className="text-center py-20 animate-slide-up">
            <div className="relative inline-block mb-6">
              <div className="text-7xl animate-float">⏳</div>
              <div className="absolute -inset-4 bg-violet-500/10 rounded-full blur-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('no data')}</h2>
            <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">{t('no data')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="relative overflow-hidden bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 font-medium px-8 py-4 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all tap-feedback"
            >
              {t('add')}
            </button>
          </div>
        )}

        {/* Locked Capsules */}
        {lockedCapsules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
              🔒 Locked
              <span className="w-8 h-px bg-gradient-to-l from-violet-500/50 to-transparent" />
            </h2>
            <div className="space-y-4">
              {lockedCapsules.map((capsule, idx) => {
                const timeLeft = getTimeRemaining(capsule.unlock_date)
                const cat = CATEGORIES.find(c => c.id === capsule.category)
                return (
                  <div
                    key={capsule.id}
                    className="capsule-locked rounded-2xl border border-white/[0.06] p-5 glass-card animate-slide-up hover:border-violet-500/20 transition-all group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat?.gradient || 'from-violet-500 to-fuchsia-500'} bg-opacity-20 flex items-center justify-center animate-pulse-glow border border-white/[0.08]`}>
                          <span className="text-xl">{cat?.icon || '📦'}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white/90">To: {capsule.recipient_name}</div>
                          <div className="text-xs text-white/30 flex items-center gap-1.5 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cat?.gradient || 'from-violet-500 to-fuchsia-500'}`} />
                            {cat?.label || capsule.category}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(capsule.id)} className="text-white/20 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all tap-feedback">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Chain & Lock Visual */}
                    <div className="flex justify-center mb-4">
                      <div className="animate-chain-swing origin-top">
                        <div className="flex flex-col items-center">
                          <div className="flex gap-1">
                            <div className="w-3 h-5 border-2 border-amber-500/40 rounded-full" />
                            <div className="w-3 h-5 border-2 border-amber-500/40 rounded-full -ml-1" />
                          </div>
                          <div className="w-6 h-7 border-2 border-amber-500/50 rounded-b-lg border-t-0 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500/60 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flip Clock Countdown */}
                    {timeLeft ? (
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                          { value: timeLeft.days, label: 'Days' },
                          { value: timeLeft.hours, label: 'Hours' },
                          { value: timeLeft.minutes, label: 'Min' },
                          { value: timeLeft.seconds, label: 'Sec' },
                        ].map(item => (
                          <div key={item.label} className="text-center">
                            <FlipDigit value={item.value} />
                            <div className="text-[10px] text-white/25 mt-1.5 uppercase tracking-wider">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-400 mb-3 text-center animate-pulse">✨ Unlocking soon...</div>
                    )}

                    {/* Blurred content */}
                    <div className="relative rounded-xl overflow-hidden bg-white/[0.02] p-4">
                      <div className="text-sm text-white/10 blur-lg select-none line-clamp-2">{capsule.content}</div>
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#050510]/80 to-transparent">
                        <span className="text-xs text-white/40 bg-violet-500/20 px-4 py-1.5 rounded-full border border-violet-500/20 backdrop-blur-sm">
                          🔒 Opens {formatDate(capsule.unlock_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Unlocked Capsules */}
        {unlockedCapsules.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-gradient-to-r from-amber-500/50 to-transparent" />
              📬 Unlocked
              <span className="w-8 h-px bg-gradient-to-l from-amber-500/50 to-transparent" />
            </h2>
            <div className="space-y-4">
              {unlockedCapsules.map((capsule, idx) => {
                const cat = CATEGORIES.find(c => c.id === capsule.category)
                const isExpanded = expandedId === capsule.id
                return (
                  <div
                    key={capsule.id}
                    className="rounded-2xl border border-amber-500/15 p-5 bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] hover:border-amber-500/30 transition-all animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/20">
                          <span className="text-xl">{cat?.icon || '📦'}</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white/90">To: {capsule.recipient_name}</div>
                          <div className="text-xs text-white/30 mt-0.5">
                            <span className="capitalize">{cat?.label}</span> · Sealed {formatDate(capsule.created_at)} · Opened {formatDate(capsule.unlock_date)}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(capsule.id)} className="text-white/20 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all tap-feedback">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <button onClick={() => setExpandedId(isExpanded ? null : capsule.id)} className="w-full text-left tap-feedback">
                      <div className="rounded-xl bg-white/[0.02] p-4 border border-white/[0.04]">
                        <p className={`text-sm text-white/70 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>{capsule.content}</p>
                      </div>
                      <span className="text-xs text-amber-400 mt-2 inline-flex items-center gap-1">
                        {isExpanded ? '↑ Show less' : '↓ Read more'}
                      </span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
