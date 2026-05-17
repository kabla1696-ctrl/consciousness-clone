'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface EmergencyContact {
  id: string
  name: string
  email: string
  phone: string
  message: string
}

interface SwitchConfig {
  status: 'active' | 'paused' | 'triggered'
  inactivityDays: number
  lastCheckIn: string
  contacts: EmergencyContact[]
}

const INACTIVITY_OPTIONS = [30, 60, 90, 180, 365]

const STORAGE_KEY = 'dead-mans-switch'

export default function DeadMansSwitch() {
  const [config, setConfig] = useState<SwitchConfig>({
    status: 'paused',
    inactivityDays: 90,
    lastCheckIn: new Date().toISOString(),
    contacts: [],
  })
  const [showAddContact, setShowAddContact] = useState(false)
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setConfig(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const saveConfig = (updated: SwitchConfig) => {
    setConfig(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const showNotification = (msg: string) => {
    setToast(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const checkIn = () => {
    saveConfig({
      ...config,
      lastCheckIn: new Date().toISOString(),
      status: config.status === 'triggered' ? 'active' : config.status,
    })
    showNotification('✅ Check-in recorded! Timer reset.')
  }

  const toggleStatus = () => {
    if (config.status === 'paused' && config.contacts.length === 0) {
      showNotification('⚠️ Add at least one emergency contact first!')
      return
    }
    const newStatus = config.status === 'active' ? 'paused' : 'active'
    saveConfig({ ...config, status: newStatus })
    showNotification(newStatus === 'active' ? '🟢 Switch activated! Monitoring started.' : '⏸️ Switch paused.')
  }

  const setInactivityDays = (days: number) => {
    saveConfig({ ...config, inactivityDays: days })
  }

  const addOrUpdateContact = () => {
    if (!contactName || !contactEmail) {
      showNotification('⚠️ Name and email are required!')
      return
    }

    let updatedContacts: EmergencyContact[]
    if (editingContact) {
      updatedContacts = config.contacts.map(c =>
        c.id === editingContact.id
          ? { ...c, name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage }
          : c
      )
    } else {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        message: contactMessage,
      }
      updatedContacts = [...config.contacts, newContact]
    }

    saveConfig({ ...config, contacts: updatedContacts })
    resetContactForm()
    showNotification(editingContact ? '✏️ Contact updated!' : '👤 Contact added!')
  }

  const deleteContact = (id: string) => {
    const updated = config.contacts.filter(c => c.id !== id)
    saveConfig({ ...config, contacts: updated })
    showNotification('🗑️ Contact removed.')
  }

  const editContact = (contact: EmergencyContact) => {
    setEditingContact(contact)
    setContactName(contact.name)
    setContactEmail(contact.email)
    setContactPhone(contact.phone)
    setContactMessage(contact.message)
    setShowAddContact(true)
  }

  const resetContactForm = () => {
    setEditingContact(null)
    setContactName('')
    setContactEmail('')
    setContactPhone('')
    setContactMessage('')
    setShowAddContact(false)
  }

  // Calculate days until trigger
  const getDaysUntilTrigger = () => {
    const lastCheck = new Date(config.lastCheckIn).getTime()
    const deadline = lastCheck + config.inactivityDays * 24 * 60 * 60 * 1000
    const remaining = Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000))
    return Math.max(0, remaining)
  }

  const daysRemaining = getDaysUntilTrigger()
  const progressPercent = Math.min(100, ((config.inactivityDays - daysRemaining) / config.inactivityDays) * 100)

  const getStatusColor = () => {
    if (config.status === 'paused') return 'text-gray-400'
    if (config.status === 'triggered') return 'text-red-400'
    if (daysRemaining <= 7) return 'text-red-400'
    if (daysRemaining <= 30) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusBg = () => {
    if (config.status === 'paused') return 'from-gray-500/20 to-gray-500/5'
    if (config.status === 'triggered') return 'from-red-500/20 to-red-500/5'
    if (daysRemaining <= 7) return 'from-red-500/20 to-red-500/5'
    if (daysRemaining <= 30) return 'from-yellow-500/20 to-yellow-500/5'
    return 'from-green-500/20 to-green-500/5'
  }

  const getStatusLabel = () => {
    if (config.status === 'triggered') return '⚠️ TRIGGERED'
    if (config.status === 'paused') return '⏸️ PAUSED'
    if (daysRemaining <= 7) return '🚨 WARNING'
    return '🟢 ACTIVE'
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen bg-[#050510] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-white font-semibold text-base">Dead Man&apos;s Switch</h1>
            <p className="text-gray-500 text-xs">Ensure your messages are delivered</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Status Card */}
        <div className={`bg-gradient-to-br ${getStatusBg()} rounded-2xl p-5 border border-white/5`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-xs">Status</p>
              <p className={`text-lg font-bold ${getStatusColor()}`}>{getStatusLabel()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Days Remaining</p>
              <p className={`text-3xl font-bold ${getStatusColor()}`}>
                {config.status === 'paused' ? '∞' : daysRemaining}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {config.status !== 'paused' && (
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  daysRemaining <= 7 ? 'bg-red-500' : daysRemaining <= 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {config.status === 'active' && daysRemaining <= 7 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-2">
              <p className="text-red-300 text-xs font-medium">🚨 {daysRemaining} days until auto-delivery! Check in now to reset.</p>
            </div>
          )}

          <p className="text-gray-500 text-[10px] mt-3">
            Last check-in: {new Date(config.lastCheckIn).toLocaleString()}
          </p>
        </div>

        {/* Check In Button */}
        <button
          onClick={checkIn}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-semibold text-base hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]"
        >
          ✋ I&apos;m Alive — Check In
        </button>

        {/* Inactivity Timer */}
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <h3 className="text-white text-sm font-semibold mb-3">⏱️ Inactivity Timer</h3>
          <div className="flex gap-2 flex-wrap">
            {INACTIVITY_OPTIONS.map(days => (
              <button
                key={days}
                onClick={() => setInactivityDays(days)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  config.inactivityDays === days
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={toggleStatus}
          className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all border ${
            config.status === 'active'
              ? 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20'
              : 'bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20'
          }`}
        >
          {config.status === 'active' ? '⏸️ Pause Switch' : '▶️ Activate Switch'}
        </button>

        {/* Emergency Contacts */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold">👥 Emergency Contacts</h3>
            <button
              onClick={() => { resetContactForm(); setShowAddContact(true) }}
              className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/30 transition-colors"
            >
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>

          {config.contacts.length === 0 ? (
            <div className="px-4 pb-6 text-center">
              <p className="text-gray-500 text-xs">No contacts added yet</p>
              <p className="text-gray-600 text-[10px] mt-1">Add people who should receive your final messages</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {config.contacts.map(contact => (
                <div key={contact.id} className="px-4 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{contact.name}</p>
                      <p className="text-gray-500 text-xs">{contact.email}</p>
                      {contact.phone && <p className="text-gray-500 text-xs">{contact.phone}</p>}
                      {contact.message && (
                        <p className="text-gray-400 text-xs mt-1 italic line-clamp-2">&ldquo;{contact.message}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex gap-1.5 ml-2">
                      <button
                        onClick={() => editContact(contact)}
                        className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => deleteContact(contact.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
          <p className="text-blue-300 text-xs font-medium mb-1">ℹ️ How it works</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            If you don&apos;t check in within the configured time period, your consciousness clone will automatically send your final messages to your emergency contacts. Check in regularly to keep the timer reset.
          </p>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={resetContactForm}>
          <div className="w-full max-w-lg bg-[#0a0a1a] rounded-t-3xl p-6 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <h2 className="text-white font-semibold text-lg mb-4">{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</h2>

            <div className="space-y-3">
              <div>
                <label className="text-gray-300 text-xs font-medium mb-1.5 block">Name *</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs font-medium mb-1.5 block">Email *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs font-medium mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-gray-300 text-xs font-medium mb-1.5 block">Final Message</label>
                <textarea
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="Write your final message to this person..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetContactForm} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-white/10 transition-all">
                Cancel
              </button>
              <button onClick={addOrUpdateContact} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20">
                {editingContact ? '💾 Update' : '➕ Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-white text-sm shadow-2xl">
          {toast}
        </div>
      )}
    </main>
  )
}
