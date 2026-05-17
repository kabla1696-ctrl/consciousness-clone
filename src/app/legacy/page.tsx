'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

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
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', bg: 'from-emerald-500/10 to-teal-500/5' },
  { id: 'friend', label: 'Friend', icon: '🤝', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/20', bg: 'from-blue-500/10 to-cyan-500/5' },
  { id: 'child', label: 'Child', icon: '👶', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/20', bg: 'from-pink-500/10 to-rose-500/5' },
  { id: 'partner', label: 'Partner', icon: '💕', gradient: 'from-red-500 to-pink-500', glow: 'shadow-red-500/20', bg: 'from-red-500/10 to-pink-500/5' },
  { id: 'other', label: 'Other', icon: '🌟', gradient: 'from-amber-500 to-yellow-500', glow: 'shadow-amber-500/20', bg: 'from-amber-500/10 to-yellow-500/5' },
]

const DELIVER_CONDITIONS = [
  { id: 'manual', label: 'Manual', desc: 'Send when you decide', icon: '✋' },
  { id: 'date', label: 'On a Date', desc: 'Auto-send on chosen date', icon: '📅' },
  { id: 'on_death', label: 'Legacy', desc: 'Delivered after you\'re gone', icon: '🕊️' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function getStatus(letter: LegacyLetter) {
  if (letter.is_delivered) return { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '✅' }
  if (letter.deliver_condition === 'date' && letter.deliver_date && new Date(letter.deliver_date) > new Date()) {
    return { label: 'Scheduled', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '📅' }
  }
  return { label: 'Ready', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: '📝' }
}

function WaxSeal({ relation }: { relation: string }) {
  const rel = RELATIONS.find(r => r.id === relation)
  return (
    <div className="wax-seal-container">
      <div className={`wax-seal w-14 h-14 rounded-full bg-gradient-to-br ${rel?.gradient || 'from-red-600 to-red-800'} flex items-center justify-center shadow-lg ${rel?.glow || 'shadow-red-500/30'} border border-white/10`}>
        <span className="text-xl drop-shadow-md">{rel?.icon || '✉️'}</span>
      </div>
      <div className="wax-drip absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-2 bg-gradient-to-b from-red-600 to-red-800 rounded-b-full opacity-80" />
    </div>
  )
}

function QuillAnimation() {
  return (
    <div className="flex items-center gap-2 text-violet-400">
      <svg className="w-5 h-5 animate-quill-write" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
        <line x1="16" y1="8" x2="2" y2="22" />
        <line x1="17.5" y1="15" x2="9" y2="15" />
      </svg>
      <span className="text-xs text-white/30">Writing...</span>
    </div>
  )
}

export default function LegacyLettersPage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [letters, setLetters] = useState<LegacyLetter[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'delivered'>('all')
  const [openingId, setOpeningId] = useState<string | null>(null)

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
      resetForm(); setShowForm(false)
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
    setOpeningId(id)
    await supabase.from('legacy_letters').update({ is_delivered: true }).eq('id', id)
    await loadLetters(user.id)
    setTimeout(() => setOpeningId(null), 1500)
  }

  const resetForm = () => {
    setRecipientName(''); setRecipientEmail(''); setRelation('family')
    setSubject(''); setContent(''); setDeliverCondition('manual'); setDeliverDate('')
  }

  const filteredLetters = letters.filter(l => {
    if (activeTab === 'ready') return !l.is_delivered
    if (activeTab === 'delivered') return l.is_delivered
    return true
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center text-xl">✉️</div>
        </div>
        <div className="mt-4 text-white/30 text-sm">{t('loading')}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      <style jsx global>{`
        @keyframes quill-write { 0%, 100% { transform: rotate(-5deg) translateX(0); } 25% { transform: rotate(2deg) translateX(3px); } 50% { transform: rotate(-3deg) translateX(-2px); } 75% { transform: rotate(4deg) translateX(2px); } }
        @keyframes letter-open { 0% { transform: scaleY(0) rotateX(90deg); opacity: 0; } 50% { transform: scaleY(0.5) rotateX(45deg); opacity: 0.5; } 100% { transform: scaleY(1) rotateX(0); opacity: 1; } }
        @keyframes seal-stamp { 0% { transform: scale(2) rotate(-20deg); opacity: 0; } 50% { transform: scale(0.9) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes parchment-unfurl { 0% { max-height: 0; opacity: 0; } 100% { max-height: 1000px; opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-quill-write { animation: quill-write 1s ease-in-out infinite; }
        .animate-letter-open { animation: letter-open 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-seal-stamp { animation: seal-stamp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-parchment { animation: parchment-unfurl 0.8s ease-out forwards; overflow: hidden; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .parchment-texture { background: linear-gradient(135deg, rgba(255,248,230,0.06) 0%, rgba(255,240,200,0.03) 50%, rgba(255,248,230,0.06) 100%); background-size: 200% 200%; position: relative; }
        .parchment-texture::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.02) 28px, rgba(255,255,255,0.02) 29px); pointer-events: none; }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1 group">
            <svg className="w-6 h-6 text-white/60 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">✉️</span>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('legacy letters')}</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            className="relative overflow-hidden bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 text-sm font-medium px-4 py-2 rounded-xl border border-violet-500/20 hover:border-violet-500/40 transition-all tap-feedback"
          >
            {showForm ? t('cancel') : '+ New'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Intro */}
        {!showForm && letters.length === 0 && (
          <div className="text-center py-16 animate-slide-up">
            <div className="relative inline-block mb-6">
              <div className="text-7xl" style={{ animation: 'float 4s ease-in-out infinite' }}>✉️</div>
              <div className="absolute -inset-4 bg-violet-500/10 rounded-full blur-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('legacy letters')}</h2>
            <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto">
              {t('legacy letters')}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="relative overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all tap-feedback group"
            >
              <span className="relative z-10">🪶 Write Your First Letter</span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-violet-500/20 p-5 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 backdrop-blur-xl space-y-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <span className="text-lg">🪶</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-violet-400">Write a Legacy Letter</h2>
                <p className="text-[10px] text-white/30">Your words, preserved for eternity</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">{t('name')}</label>
                <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Their name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">{t('email')}</label>
                <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="email@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block font-medium">Their Relation to You</label>
              <div className="flex gap-2 flex-wrap">
                {RELATIONS.map(rel => (
                  <button key={rel.id} onClick={() => setRelation(rel.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm tap-feedback transition-all ${
                      relation === rel.id
                        ? `bg-gradient-to-r ${rel.bg} border border-violet-500/40 text-violet-400 shadow-lg ${rel.glow}`
                        : 'bg-white/[0.02] border border-white/[0.06] text-white/50 hover:bg-white/[0.04]'
                    }`}>
                    <span>{rel.icon}</span><span>{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is this letter about?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all" />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block font-medium">When to Deliver</label>
              <div className="grid grid-cols-3 gap-2">
                {DELIVER_CONDITIONS.map(cond => (
                  <button key={cond.id} onClick={() => setDeliverCondition(cond.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center tap-feedback transition-all ${
                      deliverCondition === cond.id
                        ? 'bg-violet-500/15 border border-violet-500/40 shadow-lg shadow-violet-500/10'
                        : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
                    }`}>
                    <span className="text-lg">{cond.icon}</span>
                    <span className={`text-xs font-medium ${deliverCondition === cond.id ? 'text-violet-400' : 'text-white/50'}`}>{cond.label}</span>
                    <span className="text-[10px] text-white/20">{cond.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {deliverCondition === 'date' && (
              <div>
                <label className="text-xs text-white/40 mb-1.5 block font-medium">Delivery Date</label>
                <input type="date" value={deliverDate} onChange={e => setDeliverDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all [color-scheme:dark]" />
              </div>
            )}

            <div>
              <label className="text-xs text-white/40 mb-1.5 block font-medium">Your Letter</label>
              <div className="relative">
                <textarea
                  value={content} onChange={e => setContent(e.target.value)} placeholder="Pour your heart out..." rows={6}
                  className="w-full parchment-texture bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all resize-none leading-relaxed"
                />
                {saving && <div className="absolute bottom-3 right-3"><QuillAnimation /></div>}
              </div>
              <div className="text-right text-[10px] text-white/20 mt-1">{content.length} characters</div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving || !recipientName.trim() || !subject.trim() || !content.trim()}
              className="w-full relative overflow-hidden bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3.5 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all group"
            >
              <span className="relative z-10">{saving ? '🪶 Writing...' : '💌 Seal This Letter'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Tabs */}
        {letters.length > 0 && !showForm && (
          <>
            <div className="flex gap-2 mb-5">
              {[
                { id: 'all' as const, label: 'All', count: letters.length },
                { id: 'ready' as const, label: 'Drafts', count: letters.filter(l => !l.is_delivered).length },
                { id: 'delivered' as const, label: 'Sent', count: letters.filter(l => l.is_delivered).length },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm tap-feedback transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 font-medium border border-violet-500/20 shadow-lg shadow-violet-500/10'
                      : 'text-white/40 border border-transparent hover:bg-white/[0.02]'
                  }`}>
                  {tab.label} <span className="text-white/20 ml-1">({tab.count})</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredLetters.map((letter, idx) => {
                const status = getStatus(letter)
                const rel = RELATIONS.find(r => r.id === letter.recipient_relation)
                const isExpanded = expandedId === letter.id
                const isOpening = openingId === letter.id

                return (
                  <div
                    key={letter.id}
                    className={`rounded-2xl border p-5 transition-all animate-slide-up ${
                      letter.is_delivered
                        ? `border-emerald-500/10 bg-gradient-to-br ${rel?.bg || 'from-emerald-500/5 to-teal-500/5'}`
                        : 'border-white/[0.06] glass-card hover:border-violet-500/20'
                    } ${isOpening ? 'animate-letter-open' : ''}`}
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {!letter.is_delivered ? (
                          <WaxSeal relation={letter.recipient_relation} />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rel?.gradient || 'from-violet-500 to-fuchsia-500'} bg-opacity-20 flex items-center justify-center border border-white/[0.08]`}>
                            <span className="text-xl">{rel?.icon || '✉️'}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-semibold text-white/90">{letter.subject}</div>
                          <div className="text-xs text-white/30 mt-0.5">
                            To {letter.recipient_name} · {rel?.label || letter.recipient_relation} · {formatDate(letter.created_at)}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    <button onClick={() => setExpandedId(isExpanded ? null : letter.id)} className="w-full text-left tap-feedback mt-2">
                      <div className="parchment-texture rounded-xl p-4 border border-white/[0.04]">
                        <p className={`text-sm text-white/60 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>{letter.content}</p>
                      </div>
                      <span className="text-xs text-violet-400 mt-2 inline-flex items-center gap-1">
                        {isExpanded ? '↑ Show less' : '↓ Read more'}
                      </span>
                    </button>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
                      <div className="text-[10px] text-white/20">
                        {letter.deliver_condition === 'on_death' && '🕊️ Legacy delivery'}
                        {letter.deliver_condition === 'date' && letter.deliver_date && `📅 ${formatDate(letter.deliver_date)}`}
                        {letter.deliver_condition === 'manual' && '✋ Manual delivery'}
                      </div>
                      <div className="flex gap-2">
                        {!letter.is_delivered && letter.deliver_condition === 'manual' && (
                          <button onClick={() => handleMarkDelivered(letter.id)}
                            className="text-xs text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all tap-feedback">
                            Send Now
                          </button>
                        )}
                        <button onClick={() => handleDelete(letter.id)}
                          className="text-xs text-white/20 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all tap-feedback">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredLetters.length === 0 && (
                <div className="text-center py-16 text-white/30 text-sm">
                  <div className="text-4xl mb-3">📭</div>
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
