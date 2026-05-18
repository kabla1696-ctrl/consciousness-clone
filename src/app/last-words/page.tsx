'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface LastMessage {
  id: string
  recipient: string
  content: string
  status: 'active' | 'delivered' | 'expired'
  createdAt: string
}

interface Contact {
  id: string
  name: string
  email: string
  relation: string
}

const LS_MESSAGES = 'cc_last_words_msgs'
const LS_CONTACTS = 'cc_last_words_contacts'
const LS_TIMER = 'cc_last_words_timer'
const LS_LAST_ACTIVE = 'cc_last_words_last_active'

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}
function saveJSON(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

const TIMER_OPTIONS = [
  { days: 30, label: '30 Days' },
  { days: 60, label: '60 Days' },
  { days: 90, label: '90 Days' },
]

export default function LastWords() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<LastMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [timerDays, setTimerDays] = useState<number>(() => loadJSON(LS_TIMER, 30))
  const [lastActive, setLastActive] = useState<string>(() => loadJSON(LS_LAST_ACTIVE, new Date().toISOString()))
  const [tab, setTab] = useState<'messages' | 'contacts' | 'settings'>('messages')

  const [showAddMsg, setShowAddMsg] = useState(false)
  const [msgRecipient, setMsgRecipient] = useState('')
  const [msgContent, setMsgContent] = useState('')

  const [showAddContact, setShowAddContact] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactRelation, setContactRelation] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setMessages(loadJSON(LS_MESSAGES, []))
      setContacts(loadJSON(LS_CONTACTS, []))
      const now = new Date().toISOString()
      setLastActive(now)
      saveJSON(LS_LAST_ACTIVE, now)
    }
    init()
  }, [])

  useEffect(() => { saveJSON(LS_TIMER, timerDays) }, [timerDays])

  const daysUntilTrigger = () => {
    const last = new Date(lastActive).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - last) / (1000 * 60 * 60 * 24))
    return Math.max(0, timerDays - elapsed)
  }

  const addMessage = () => {
    if (!msgRecipient.trim() || !msgContent.trim()) return
    const msg: LastMessage = {
      id: crypto.randomUUID(),
      recipient: msgRecipient.trim(),
      content: msgContent.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    const updated = [msg, ...messages]
    setMessages(updated)
    saveJSON(LS_MESSAGES, updated)
    setMsgRecipient('')
    setMsgContent('')
    setShowAddMsg(false)
  }

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id)
    setMessages(updated)
    saveJSON(LS_MESSAGES, updated)
  }

  const addContact = () => {
    if (!contactName.trim() || !contactEmail.trim()) return
    const c: Contact = {
      id: crypto.randomUUID(),
      name: contactName.trim(),
      email: contactEmail.trim(),
      relation: contactRelation.trim() || 'Other',
    }
    const updated = [c, ...contacts]
    setContacts(updated)
    saveJSON(LS_CONTACTS, updated)
    setContactName('')
    setContactEmail('')
    setContactRelation('')
    setShowAddContact(false)
  }

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id)
    setContacts(updated)
    saveJSON(LS_CONTACTS, updated)
  }

  const remaining = daysUntilTrigger()

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose-600/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-amber-600/[0.02] blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-xl">🕊️</span>
              <div className="absolute -inset-1 bg-rose-500/20 rounded-full blur-md" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-rose-200 to-white bg-clip-text text-transparent">{t('last words')}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* Timer Status */}
        <div className="rounded-2xl border border-white/[0.08] p-6 bg-white/[0.02] backdrop-blur-sm mb-6 shadow-lg shadow-black/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.04] to-violet-500/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Dead Man&apos;s Switch</h3>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                remaining > 7 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]' :
                remaining > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]' :
                'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
              }`}>
                {remaining > 0 ? 'ACTIVE' : 'TRIGGERED'}
              </span>
            </div>
            <div className="text-center py-4">
              <div className="relative inline-block">
                <div aria-hidden="true" className="text-6xl font-black bg-gradient-to-b from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{remaining}</div>
                <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-2xl scale-150" />
              </div>
              <div className="text-white/30 text-xs mt-2 uppercase tracking-wider">days until messages are delivered</div>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2.5 mt-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 transition-all duration-1000 shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                style={{ width: `${Math.max(5, (remaining / timerDays) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-white/20 mt-3 text-center uppercase tracking-wider">Log in regularly to reset the timer</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['messages', 'contacts', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === t
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
              }`}
            >
              {t === 'messages' ? '💌 Messages' : t === 'contacts' ? '👥 Contacts' : '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {tab === 'messages' && (
          <>
            <button
              onClick={() => setShowAddMsg(!showAddMsg)}
              className="w-full mb-5 px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 tap-feedback shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            >
              {showAddMsg ? '✕ Cancel' : '💌 ' + t('record')}
            </button>

            {showAddMsg && (
              <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm mb-5 space-y-4 shadow-lg shadow-black/10" style={{ animation: 'fadeInDown 0.3s ease both' }}>
                <input
                  type="text"
                  value={msgRecipient}
                  onChange={e => setMsgRecipient(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                  placeholder={t('recipient name')}
                />
                <textarea
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 resize-none text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                  rows={4}
                  placeholder={t('final message') + '...'}
                />
                <button
                  onClick={addMessage}
                  disabled={!msgRecipient.trim() || !msgContent.trim()}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-30 shadow-lg shadow-violet-500/20"
                >
                  Save Message
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-4">
                  <div aria-hidden="true" className="text-6xl">💌</div>
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl scale-150" />
                </div>
                <p className="text-white/40 text-lg font-medium">{t('last words')}</p>
                <p className="text-white/20 text-sm mt-1">{t('for the world')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={msg.id} className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm group hover:bg-white/[0.04] transition-all duration-300 shadow-lg shadow-black/10" style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-sm text-white/90">To: {msg.recipient}</h3>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full mt-1 inline-block font-semibold uppercase tracking-wider border ${
                          msg.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          msg.status === 'delivered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-300 p-1"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-white/20 mt-3 uppercase tracking-wider">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Contacts Tab */}
        {tab === 'contacts' && (
          <>
            <button
              onClick={() => setShowAddContact(!showAddContact)}
              className="w-full mb-5 px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 tap-feedback shadow-lg shadow-violet-500/20"
            >
              {showAddContact ? '✕ Cancel' : '👤 Add Emergency Contact'}
            </button>

            {showAddContact && (
              <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm mb-5 space-y-4 shadow-lg shadow-black/10" style={{ animation: 'fadeInDown 0.3s ease both' }}>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                  placeholder={t('name')}
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                  placeholder={t('email')}
                />
                <input
                  type="text"
                  value={contactRelation}
                  onChange={e => setContactRelation(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                  placeholder={t('relation example')}
                />
                <button
                  onClick={addContact}
                  disabled={!contactName.trim() || !contactEmail.trim()}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-30 shadow-lg shadow-violet-500/20"
                >
                  Add Contact
                </button>
              </div>
            )}

            {contacts.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-4">
                  <div aria-hidden="true" className="text-6xl">👥</div>
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl scale-150" />
                </div>
                <p className="text-white/40 text-lg font-medium">No emergency contacts</p>
                <p className="text-white/20 text-sm mt-1">Add people who should receive your messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((c, i) => (
                  <div key={c.id} className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-between group hover:bg-white/[0.04] transition-all duration-300 shadow-lg shadow-black/10" style={{ animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
                    <div>
                      <h3 className="font-semibold text-sm text-white/90">{c.name}</h3>
                      <p className="text-white/30 text-xs mt-0.5">{c.email}</p>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] text-white/40 mt-2 inline-block border border-white/[0.06]">{c.relation}</span>
                    </div>
                    <button
                      onClick={() => deleteContact(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-300 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm shadow-lg shadow-black/10">
              <h3 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">Inactivity Timer</h3>
              <p className="text-white/30 text-xs mb-5">How many days of inactivity before messages are delivered</p>
              <div className="grid grid-cols-3 gap-3">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.days}
                    onClick={() => setTimerDays(opt.days)}
                    className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      timerDays === opt.days
                        ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                        : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm shadow-lg shadow-black/10">
              <h3 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">How It Works</h3>
              <ul className="text-white/40 text-xs space-y-3">
                {[
                  'Write messages for your loved ones',
                  'Add emergency contacts with emails',
                  'Set your inactivity timer',
                  'Log in regularly to keep the timer reset',
                  `If you don't log in for ${timerDays} days, messages are delivered`,
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/20 p-5 bg-amber-500/[0.03] backdrop-blur-sm">
              <p className="text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">⚠️ Important</p>
              <p className="text-white/30 text-xs leading-relaxed">This is a local demo. In production, a server-side cron would monitor inactivity and trigger email delivery. Currently, the timer is client-side only.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
