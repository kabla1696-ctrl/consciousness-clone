'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface EmergencyContact {
  id: string
  name: string
  email: string
  message: string
}

interface SwitchSettings {
  enabled: boolean
  inactivityDays: number
  lastCheckIn: string
  contacts: EmergencyContact[]
  finalMessage: string
  checkInHistory: string[]
}

const DEFAULT_SETTINGS: SwitchSettings = {
  enabled: false, inactivityDays: 30, lastCheckIn: new Date().toISOString(),
  contacts: [], finalMessage: '', checkInHistory: [],
}

export default function DeadMansSwitch() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SwitchSettings>(DEFAULT_SETTINGS)
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', email: '', message: '' })
  const [toast, setToast] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState(false)

  const STORAGE_KEY = 'dead-mans-switch-settings'

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) { try { setSettings(JSON.parse(stored)) } catch {} }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, loading])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const checkIn = () => {
    const now = new Date().toISOString()
    setSettings(prev => ({
      ...prev, lastCheckIn: now, checkInHistory: [now, ...prev.checkInHistory].slice(0, 30),
    }))
    showToast('✅ Checked in successfully!')
  }

  const addContact = () => {
    if (!newContact.name || !newContact.email) return
    setSettings(prev => ({
      ...prev, contacts: [...prev.contacts, { id: Date.now().toString(), ...newContact }],
    }))
    setNewContact({ name: '', email: '', message: '' }); setShowAddContact(false)
    showToast('👤 Contact added!')
  }

  const removeContact = (id: string) => {
    setSettings(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }))
  }

  const daysSinceLastCheckIn = () => {
    const last = new Date(settings.lastCheckIn)
    return Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = () => Math.max(0, settings.inactivityDays - daysSinceLastCheckIn())
  const urgency = () => {
    const rem = daysRemaining()
    if (rem <= 3) return { color: 'text-red-400', bg: 'from-red-500/20 to-rose-500/20', border: 'border-red-500/30', label: 'Critical' }
    if (rem <= 7) return { color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', label: 'Warning' }
    return { color: 'text-emerald-400', bg: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', label: 'Safe' }
  }

  if (loading) return <main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="relative"><div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div></main>

  const u = urgency()

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb ambient-orb-violet" style={{ width: 280, height: 280, top: '10%', right: '-5%' }} />
        <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '20%', left: '-8%' }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="particle" style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 2 === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.3)', '--duration': `${6 + Math.random() * 8}s`, '--delay': `${Math.random() * 5}s` } as React.CSSProperties} />
        ))}
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-card rounded-xl px-4 py-2.5 text-sm text-white/90 shadow-lg animate-slide-up border border-white/10">{toast}</div>
      )}

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm shadow-lg shadow-red-500/20">⏰</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold gradient-text">{t('dead man switch')}</h1>
            <p className="text-[10px] text-red-400 flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full animate-pulse ${settings.enabled ? 'bg-red-400' : 'bg-white/20'}`} />{settings.enabled ? t('countdown') : t('inactive')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto w-full relative z-10 space-y-6">
        {/* Status Card */}
        <div className={`glass-card rounded-2xl p-6 text-center relative overflow-hidden border ${u.border}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${u.bg} opacity-30`} />
          <div className="relative z-10">
            <div className="text-5xl mb-3" aria-hidden="true">{settings.enabled ? (daysRemaining() <= 3 ? '🚨' : daysRemaining() <= 7 ? '⚠️' : '🛡️') : '⏸️'}</div>
            <h2 className={`text-2xl font-bold ${u.color} mb-1`}>{settings.enabled ? `${daysRemaining()} ${t('days')}` : t('inactive')}</h2>
            <p className="text-xs text-white/30">{settings.enabled ? `${t('countdown')} · ${u.label}` : t('inactive')}</p>
            {settings.enabled && (
              <div className="mt-4 w-full bg-white/5 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-1000 ${daysRemaining() <= 3 ? 'bg-gradient-to-r from-red-500 to-rose-500' : daysRemaining() <= 7 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
                  style={{ width: `${Math.max(5, (daysRemaining() / settings.inactivityDays) * 100)}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Check In Button */}
        {settings.enabled && (
          <button onClick={checkIn}
            className="w-full py-4 rounded-2xl glow-btn bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg">
            ✅ {t('countdown')}
          </button>
        )}

        {/* Toggle */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/80">{t('auto deliver')}</h3>
            <p className="text-xs text-white/30">{t('inactive')}</p>
          </div>
          <button onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`w-14 h-8 rounded-full transition-all duration-300 ${settings.enabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10'}`}>
            <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 mt-1 ${settings.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Inactivity Days */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80">Inactivity Threshold</h3>
            <span className="text-sm font-bold text-violet-400 font-mono">{settings.inactivityDays} days</span>
          </div>
          <input type="range" min={7} max={90} value={settings.inactivityDays}
            onChange={e => setSettings(prev => ({ ...prev, inactivityDays: Number(e.target.value) }))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30" />
          <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>7 days</span><span>90 days</span></div>
        </div>

        {/* Emergency Contacts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-medium">Emergency Contacts</h2>
            <button onClick={() => setShowAddContact(!showAddContact)} className="text-xs text-violet-400 hover:text-violet-300 transition">+ Add</button>
          </div>
          {showAddContact && (
            <div className="glass-card rounded-2xl p-4 mb-3 space-y-3 animate-slide-up">
              <input value={newContact.name} onChange={e => setNewContact(prev => ({ ...prev, name: e.target.value }))} placeholder={t('name')}
                className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition" />
              <input value={newContact.email} onChange={e => setNewContact(prev => ({ ...prev, email: e.target.value }))} placeholder={t('email')}
                className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition" />
              <textarea value={newContact.message} onChange={e => setNewContact(prev => ({ ...prev, message: e.target.value }))} placeholder={t('personal message optional')} rows={2}
                className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowAddContact(false)} className="flex-1 py-2.5 rounded-xl glass-card text-white/40 text-sm">Cancel</button>
                <button onClick={addContact} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold">Save</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {settings.contacts.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-center">
                <p className="text-white/20 text-sm">No contacts added yet</p>
              </div>
            ) : settings.contacts.map(c => (
              <div key={c.id} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-lift">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-sm">👤</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">{c.name}</p>
                  <p className="text-xs text-white/30 truncate">{c.email}</p>
                </div>
                <button onClick={() => removeContact(c.id)} className="text-white/20 hover:text-red-400 transition p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Final Message */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-medium">Final Message</h2>
            <button onClick={() => setEditingMessage(!editingMessage)} className="text-xs text-violet-400 hover:text-violet-300 transition">{editingMessage ? 'Done' : 'Edit'}</button>
          </div>
          {editingMessage ? (
            <textarea value={settings.finalMessage} onChange={e => setSettings(prev => ({ ...prev, finalMessage: e.target.value }))} rows={4}
              placeholder={t('dead mans switch message')}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition resize-none" />
          ) : (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm text-white/50 leading-relaxed">{settings.finalMessage || 'No message set. Tap Edit to write one.'}</p>
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        {settings.checkInHistory.length > 0 && (
          <div>
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-medium mb-3">Recent Check-ins</h2>
            <div className="glass-card rounded-2xl">
              {settings.checkInHistory.slice(0, 7).map((ci, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0 flex items-center gap-3">
                  <span className="text-emerald-400 text-xs">✓</span>
                  <span className="text-xs text-white/40">{new Date(ci).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
