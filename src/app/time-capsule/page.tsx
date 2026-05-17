'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  { id: 'message', label: 'Message', icon: '💌', color: 'text-pink-400' },
  { id: 'memory', label: 'Memory', icon: '🧠', color: 'text-violet-400' },
  { id: 'wish', label: 'Wish', icon: '⭐', color: 'text-amber-400' },
  { id: 'prediction', label: 'Prediction', icon: '🔮', color: 'text-cyan-400' },
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function TimeCapsulePage() {
  const [user, setUser] = useState<any>(null)
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [content, setContent] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [category, setCategory] = useState('message')

  // Countdown ticker
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

  // Update countdown every second
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

  // Check and unlock capsules whose date has passed
  useEffect(() => {
    if (!user) return
    const checkUnlocks = async () => {
      const now = new Date().toISOString()
      const lockedPast = capsules.filter(c => !c.is_unlocked && c.unlock_date <= now)
      if (lockedPast.length > 0) {
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
      setContent('')
      setRecipientName('')
      setRecipientEmail('')
      setUnlockDate('')
      setCategory('message')
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

  // Minimum date for the date picker (tomorrow)
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

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
            <span className="text-xl">⏳</span>
            <h1 className="text-lg font-bold">Time Capsule</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-500/20 text-violet-400 text-sm font-medium px-3 py-1.5 rounded-lg tap-feedback"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Create Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 space-y-4">
            <h2 className="text-sm font-semibold text-violet-400">Create a New Time Capsule</h2>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                placeholder="Who is this for?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Recipient Email (optional)</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Unlock Date</label>
              <input
                type="date"
                value={unlockDate}
                onChange={e => setUnlockDate(e.target.value)}
                min={minDateStr}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs tap-feedback ${
                      category === cat.id
                        ? 'bg-violet-500/20 border border-violet-500/40'
                        : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className={category === cat.id ? cat.color : 'text-white/40'}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Your Message</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your message to the future..."
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !content.trim() || !recipientName.trim() || !unlockDate}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Sealing...' : '🔒 Seal Time Capsule'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {capsules.length === 0 && !showForm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-lg font-bold mb-2">No Time Capsules Yet</h2>
            <p className="text-white/30 text-sm mb-6">Send a message to the future — to yourself or someone you love.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-violet-500/20 text-violet-400 font-medium px-6 py-3 rounded-xl tap-feedback"
            >
              Create Your First Capsule
            </button>
          </div>
        )}

        {/* Locked Capsules */}
        {lockedCapsules.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">🔒 Locked</h2>
            <div className="space-y-3">
              {lockedCapsules.map(capsule => {
                const timeLeft = getTimeRemaining(capsule.unlock_date)
                const cat = CATEGORIES.find(c => c.id === capsule.category)
                return (
                  <div
                    key={capsule.id}
                    className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat?.icon || '📦'}</span>
                        <div>
                          <div className="text-sm font-semibold">To: {capsule.recipient_name}</div>
                          <div className="text-xs text-white/30 capitalize">{cat?.label || capsule.category}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(capsule.id)}
                        className="text-white/20 hover:text-red-400 p-1 tap-feedback"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Countdown */}
                    {timeLeft ? (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[
                          { value: timeLeft.days, label: 'Days' },
                          { value: timeLeft.hours, label: 'Hrs' },
                          { value: timeLeft.minutes, label: 'Min' },
                          { value: timeLeft.seconds, label: 'Sec' },
                        ].map(item => (
                          <div key={item.label} className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <div className="text-lg font-bold text-violet-400 tabular-nums">{String(item.value).padStart(2, '0')}</div>
                            <div className="text-[10px] text-white/30">{item.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-amber-400 mb-2">Unlocking soon...</div>
                    )}

                    {/* Blurred content preview */}
                    <div className="relative">
                      <div className="text-sm text-white/10 blur-md select-none line-clamp-2">{capsule.content}</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-white/30 bg-[#050510]/60 px-3 py-1 rounded-full">Opens {formatDate(capsule.unlock_date)}</span>
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
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">📬 Unlocked</h2>
            <div className="space-y-3">
              {unlockedCapsules.map(capsule => {
                const cat = CATEGORIES.find(c => c.id === capsule.category)
                const isExpanded = expandedId === capsule.id
                return (
                  <div
                    key={capsule.id}
                    className="rounded-xl border border-amber-500/20 p-4 bg-amber-500/[0.03]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat?.icon || '📦'}</span>
                        <div>
                          <div className="text-sm font-semibold">To: {capsule.recipient_name}</div>
                          <div className="text-xs text-white/30">
                            <span className="capitalize">{cat?.label}</span> · Sealed {formatDate(capsule.created_at)} · Opened {formatDate(capsule.unlock_date)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(capsule.id)}
                        className="text-white/20 hover:text-red-400 p-1 tap-feedback"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : capsule.id)}
                      className="w-full text-left tap-feedback"
                    >
                      <p className={`text-sm text-white/70 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {capsule.content}
                      </p>
                      <span className="text-xs text-violet-400 mt-1 inline-block">
                        {isExpanded ? 'Show less' : 'Read more'}
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
