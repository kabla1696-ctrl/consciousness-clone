'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
function saveJSON(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data))
}

const TIMER_OPTIONS = [
  { days: 30, label: '30 Days' },
  { days: 60, label: '60 Days' },
  { days: 90, label: '90 Days' },
]

export default function LastWords() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<LastMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [timerDays, setTimerDays] = useState<number>(() => loadJSON(LS_TIMER, 30))
  const [lastActive, setLastActive] = useState<string>(() => loadJSON(LS_LAST_ACTIVE, new Date().toISOString()))
  const [tab, setTab] = useState<'messages' | 'contacts' | 'settings'>('messages')

  // Add message form
  const [showAddMsg, setShowAddMsg] = useState(false)
  const [msgRecipient, setMsgRecipient] = useState('')
  const [msgContent, setMsgContent] = useState('')

  // Add contact form
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
      // Update last active
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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕊️</span>
            <h1 className="text-base font-bold">Last Words</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Timer Status */}
        <div className="rounded-xl border border-white/[0.06] p-5 bg-white/[0.02] mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/60">Dead Man's Switch</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${remaining > 7 ? 'bg-emerald-500/20 text-emerald-400' : remaining > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              {remaining > 0 ? 'ACTIVE' : 'TRIGGERED'}
            </span>
          </div>
          <div className="text-center py-3">
            <div className="text-4xl font-bold text-violet-400 mb-1">{remaining}</div>
            <div className="text-white/30 text-xs">days until messages are delivered</div>
          </div>
          <div className="w-full bg-white/[0.04] rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
              style={{ width: `${Math.max(5, (remaining / timerDays) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/20 mt-2 text-center">Log in regularly to reset the timer</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['messages', 'contacts', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition ${tab === t ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.02]'}`}
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
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition tap-feedback"
            >
              {showAddMsg ? '✕ Cancel' : '💌 Write New Message'}
            </button>

            {showAddMsg && (
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] mb-4 space-y-3">
                <input
                  type="text"
                  value={msgRecipient}
                  onChange={e => setMsgRecipient(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                  placeholder="Recipient name..."
                />
                <textarea
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20 text-sm"
                  rows={4}
                  placeholder="Write your final message..."
                />
                <button
                  onClick={addMessage}
                  disabled={!msgRecipient.trim() || !msgContent.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30"
                >
                  Save Message
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">💌</div>
                <p className="text-white/30">No messages yet</p>
                <p className="text-white/20 text-sm mt-1">Write messages for your loved ones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">To: {msg.recipient}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${msg.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : msg.status === 'delivered' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                          {msg.status}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-[10px] text-white/20 mt-2">{new Date(msg.createdAt).toLocaleDateString()}</p>
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
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition tap-feedback"
            >
              {showAddContact ? '✕ Cancel' : '👤 Add Emergency Contact'}
            </button>

            {showAddContact && (
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] mb-4 space-y-3">
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                  placeholder="Name..."
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                  placeholder="Email..."
                />
                <input
                  type="text"
                  value={contactRelation}
                  onChange={e => setContactRelation(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                  placeholder="Relation (e.g. Spouse, Friend)..."
                />
                <button
                  onClick={addContact}
                  disabled={!contactName.trim() || !contactEmail.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30"
                >
                  Add Contact
                </button>
              </div>
            )}

            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-white/30">No emergency contacts</p>
                <p className="text-white/20 text-sm mt-1">Add people who should receive your messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map(c => (
                  <div key={c.id} className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] flex items-center justify-between group">
                    <div>
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <p className="text-white/30 text-xs">{c.email}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-white/40 mt-1 inline-block">{c.relation}</span>
                    </div>
                    <button
                      onClick={() => deleteContact(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition text-xs"
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
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <h3 className="text-sm font-semibold mb-3">Inactivity Timer</h3>
              <p className="text-white/30 text-xs mb-4">How many days of inactivity before messages are delivered</p>
              <div className="grid grid-cols-3 gap-2">
                {TIMER_OPTIONS.map(opt => (
                  <button
                    key={opt.days}
                    onClick={() => setTimerDays(opt.days)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition ${timerDays === opt.days ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.02]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
              <h3 className="text-sm font-semibold mb-2">How It Works</h3>
              <ul className="text-white/30 text-xs space-y-2">
                <li className="flex items-start gap-2"><span className="text-violet-400">1.</span> Write messages for your loved ones</li>
                <li className="flex items-start gap-2"><span className="text-violet-400">2.</span> Add emergency contacts with emails</li>
                <li className="flex items-start gap-2"><span className="text-violet-400">3.</span> Set your inactivity timer</li>
                <li className="flex items-start gap-2"><span className="text-violet-400">4.</span> Log in regularly to keep the timer reset</li>
                <li className="flex items-start gap-2"><span className="text-violet-400">5.</span> If you don't log in for {timerDays} days, messages are delivered</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/20 p-4 bg-amber-500/5">
              <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Important</p>
              <p className="text-white/30 text-xs">This is a local demo. In production, a server-side cron would monitor inactivity and trigger email delivery. Currently, the timer is client-side only.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
