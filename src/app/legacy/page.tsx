'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface LegacyLetter {
  id: string
  recipient_name: string
  recipient_email: string | null
  recipient_relation: string
  subject: string
  content: string
  deliver_condition: string
  deliver_date: string | null
  is_delivered: boolean
  created_at: string
}

const RELATIONS = [
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'friend', label: 'Friend', icon: '🤝' },
  { id: 'child', label: 'Child', icon: '👶' },
  { id: 'partner', label: 'Partner', icon: '💕' },
  { id: 'other', label: 'Other', icon: '🌟' },
]

const DELIVER_CONDITIONS = [
  { id: 'manual', label: 'Manual', desc: 'Send when you decide', icon: '✋' },
  { id: 'date', label: 'On a Date', desc: 'Auto-send on chosen date', icon: '📅' },
  { id: 'on_death', label: 'Legacy', desc: 'Delivered after you\'re gone', icon: '🕊️' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatus(letter: LegacyLetter) {
  if (letter.is_delivered) return { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '✅' }
  if (letter.deliver_condition === 'date' && letter.deliver_date && new Date(letter.deliver_date) > new Date()) {
    return { label: 'Scheduled', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '📅' }
  }
  return { label: 'Ready', color: 'text-violet-400', bg: 'bg-violet-500/10', icon: '📝' }
}

export default function LegacyLettersPage() {
  const [user, setUser] = useState<any>(null)
  const [letters, setLetters] = useState<LegacyLetter[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'delivered'>('all')

  // Form state
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [relation, setRelation] = useState('family')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [deliverCondition, setDeliverCondition] = useState('manual')
  const [deliverDate, setDeliverDate] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await loadLetters(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const loadLetters = async (userId: string) => {
    const { data } = await supabase
      .from('legacy_letters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setLetters(data)
  }

  const handleCreate = async () => {
    if (!recipientName.trim() || !subject.trim() || !content.trim() || !user) return
    setSaving(true)

    const { error } = await supabase.from('legacy_letters').insert({
      user_id: user.id,
      recipient_name: recipientName.trim(),
      recipient_email: recipientEmail.trim() || null,
      recipient_relation: relation,
      subject: subject.trim(),
      content: content.trim(),
      deliver_condition: deliverCondition,
      deliver_date: deliverCondition === 'date' && deliverDate ? new Date(deliverDate).toISOString() : null,
      is_delivered: false,
    })

    if (!error) {
      resetForm()
      setShowForm(false)
      await loadLetters(user.id)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    await supabase.from('legacy_letters').delete().eq('id', id)
    await loadLetters(user.id)
  }

  const handleMarkDelivered = async (id: string) => {
    if (!user) return
    await supabase.from('legacy_letters').update({ is_delivered: true }).eq('id', id)
    await loadLetters(user.id)
  }

  const resetForm = () => {
    setRecipientName('')
    setRecipientEmail('')
    setRelation('family')
    setSubject('')
    setContent('')
    setDeliverCondition('manual')
    setDeliverDate('')
  }

  const filteredLetters = letters.filter(l => {
    if (activeTab === 'ready') return !l.is_delivered
    if (activeTab === 'delivered') return l.is_delivered
    return true
  })

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
            <span className="text-xl">✉️</span>
            <h1 className="text-lg font-bold">Legacy Letters</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            className="bg-violet-500/20 text-violet-400 text-sm font-medium px-3 py-1.5 rounded-lg tap-feedback"
          >
            {showForm ? 'Cancel' : '+ New'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Intro */}
        {!showForm && letters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✉️</div>
            <h2 className="text-lg font-bold mb-2">Your Words, Delivered When It Matters</h2>
            <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">
              Write letters to the people you love. Deliver them now, on a special date, or leave them as a lasting legacy.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl tap-feedback"
            >
              Write Your First Letter
            </button>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 space-y-4">
            <h2 className="text-sm font-semibold text-violet-400">Write a Legacy Letter</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="Their name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Their Relation to You</label>
              <div className="flex gap-2 flex-wrap">
                {RELATIONS.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => setRelation(rel.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm tap-feedback ${
                      relation === rel.id
                        ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                        : 'bg-white/[0.02] border border-white/[0.06] text-white/50'
                    }`}
                  >
                    <span>{rel.icon}</span>
                    <span>{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="What is this letter about?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">When to Deliver</label>
              <div className="grid grid-cols-3 gap-2">
                {DELIVER_CONDITIONS.map(cond => (
                  <button
                    key={cond.id}
                    onClick={() => setDeliverCondition(cond.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-center tap-feedback ${
                      deliverCondition === cond.id
                        ? 'bg-violet-500/20 border border-violet-500/40'
                        : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}
                  >
                    <span className="text-lg">{cond.icon}</span>
                    <span className={`text-xs font-medium ${deliverCondition === cond.id ? 'text-violet-400' : 'text-white/50'}`}>{cond.label}</span>
                    <span className="text-[10px] text-white/20">{cond.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {deliverCondition === 'date' && (
              <div>
                <label className="text-xs text-white/40 mb-1 block">Delivery Date</label>
                <input
                  type="date"
                  value={deliverDate}
                  onChange={e => setDeliverDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 mb-1 block">Your Letter</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Pour your heart out..."
                rows={6}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
              />
              <div className="text-right text-[10px] text-white/20 mt-1">{content.length} characters</div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !recipientName.trim() || !subject.trim() || !content.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '💌 Seal This Letter'}
            </button>
          </div>
        )}

        {/* Tabs */}
        {letters.length > 0 && !showForm && (
          <>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'all' as const, label: 'All', count: letters.length },
                { id: 'ready' as const, label: 'Drafts', count: letters.filter(l => !l.is_delivered).length },
                { id: 'delivered' as const, label: 'Sent', count: letters.filter(l => l.is_delivered).length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm tap-feedback ${
                    activeTab === tab.id
                      ? 'bg-violet-500/20 text-violet-400 font-medium'
                      : 'text-white/40'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Letter List */}
            <div className="space-y-3">
              {filteredLetters.map(letter => {
                const status = getStatus(letter)
                const rel = RELATIONS.find(r => r.id === letter.recipient_relation)
                const isExpanded = expandedId === letter.id

                return (
                  <div
                    key={letter.id}
                    className={`rounded-xl border p-4 ${
                      letter.is_delivered
                        ? 'border-emerald-500/10 bg-emerald-500/[0.02]'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{rel?.icon || '✉️'}</span>
                        <div>
                          <div className="text-sm font-semibold">{letter.subject}</div>
                          <div className="text-xs text-white/30">
                            To {letter.recipient_name} · {rel?.label || letter.recipient_relation} · {formatDate(letter.created_at)}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : letter.id)}
                      className="w-full text-left tap-feedback mt-2"
                    >
                      <p className={`text-sm text-white/60 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {letter.content}
                      </p>
                      <span className="text-xs text-violet-400 mt-1 inline-block">
                        {isExpanded ? 'Show less' : 'Read more'}
                      </span>
                    </button>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                      <div className="text-[10px] text-white/20">
                        {letter.deliver_condition === 'on_death' && '🕊️ Legacy delivery'}
                        {letter.deliver_condition === 'date' && letter.deliver_date && `📅 ${formatDate(letter.deliver_date)}`}
                        {letter.deliver_condition === 'manual' && '✋ Manual delivery'}
                      </div>
                      <div className="flex gap-2">
                        {!letter.is_delivered && letter.deliver_condition === 'manual' && (
                          <button
                            onClick={() => handleMarkDelivered(letter.id)}
                            className="text-xs text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10 tap-feedback"
                          >
                            Send Now
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(letter.id)}
                          className="text-xs text-white/20 hover:text-red-400 px-2 py-1 tap-feedback"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredLetters.length === 0 && (
                <div className="text-center py-12 text-white/30 text-sm">
                  No {activeTab === 'delivered' ? 'sent' : activeTab === 'ready' ? 'draft' : ''} letters yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
