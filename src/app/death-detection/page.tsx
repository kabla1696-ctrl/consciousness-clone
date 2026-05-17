'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface HeirContact {
  id: string
  name: string
  email: string
  phone: string
  relationship: string
  verified: boolean
}

export default function DeathDetectionPage() {
  const t = useT()
  const [lastActive, setLastActive] = useState<Date>(new Date())
  const [inactivityDays, setInactivityDays] = useState(30)
  const [heirs, setHeirs] = useState<HeirContact[]>([])
  const [showAddHeir, setShowAddHeir] = useState(false)
  const [heirName, setHeirName] = useState('')
  const [heirEmail, setHeirEmail] = useState('')
  const [heirPhone, setHeirPhone] = useState('')
  const [heirRelation, setHeirRelation] = useState('')
  const [deadManSwitch, setDeadManSwitch] = useState(false)
  const [switchDays, setSwitchDays] = useState(30)
  const [status, setStatus] = useState<'alive' | 'warning' | 'critical' | 'dead'>('alive')
  const [showTestDeath, setShowTestDeath] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number}>>([])

  useEffect(() => {
    const stored = localStorage.getItem('cc_death_detection')
    if (stored) {
      const data = JSON.parse(stored)
      setInactivityDays(data.inactivityDays || 30)
      setHeirs(data.heirs || [])
      setDeadManSwitch(data.deadManSwitch || false)
      setSwitchDays(data.switchDays || 30)
    }
    const lastLogin = localStorage.getItem('cc_last_active')
    if (lastLogin) setLastActive(new Date(lastLogin))
    
    // Particles
    const p = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1
    }))
    setParticles(p)
  }, [])

  const saveSettings = () => {
    localStorage.setItem('cc_death_detection', JSON.stringify({
      inactivityDays,
      heirs,
      deadManSwitch,
      switchDays
    }))
  }

  const addHeir = () => {
    if (!heirName.trim() || !heirEmail.trim()) return
    const newHeir: HeirContact = {
      id: Date.now().toString(),
      name: heirName.trim(),
      email: heirEmail.trim(),
      phone: heirPhone.trim(),
      relationship: heirRelation || 'Family',
      verified: false
    }
    const updated = [...heirs, newHeir]
    setHeirs(updated)
    localStorage.setItem('cc_death_detection', JSON.stringify({
      inactivityDays,
      heirs: updated,
      deadManSwitch,
      switchDays
    }))
    setHeirName('')
    setHeirEmail('')
    setHeirPhone('')
    setHeirRelation('')
    setShowAddHeir(false)
  }

  const removeHeir = (id: string) => {
    const updated = heirs.filter(h => h.id !== id)
    setHeirs(updated)
    localStorage.setItem('cc_death_detection', JSON.stringify({
      inactivityDays,
      heirs: updated,
      deadManSwitch,
      switchDays
    }))
  }

  const testDeathSequence = () => {
    setShowTestDeath(true)
    setStatus('warning')
    setTimeout(() => setStatus('critical'), 2000)
    setTimeout(() => setStatus('dead'), 4000)
    setTimeout(() => {
      setShowTestDeath(false)
      setStatus('alive')
    }, 8000)
  }

  const STATUS_CONFIG = {
    alive: { color: 'emerald', icon: '💚', label: 'Alive & Active', bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20' },
    warning: { color: 'amber', icon: '⚠️', label: 'Inactivity Warning', bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20' },
    critical: { color: 'red', icon: '🚨', label: 'Critical - Death Suspected', bg: 'from-red-500/20 to-orange-500/10', border: 'border-red-500/20' },
    dead: { color: 'gray', icon: '💀', label: 'Death Confirmed - Clone Activated', bg: 'from-gray-500/20 to-slate-500/10', border: 'border-gray-500/20' },
  }

  const RELATIONS = ['Family', 'Spouse', 'Sibling', 'Parent', 'Child', 'Best Friend', 'Partner', 'Other']

  return (
    <main className="min-h-screen bg-[#050510] relative pb-24 md:pb-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(p => (
          <div key={p.id} className="absolute rounded-full bg-red-500/5 animate-pulse"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 3}px`, height: `${p.size * 3}px`, animationDuration: `${3 + p.id % 3}s` }} />
        ))}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-red-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">💀 Death Detection</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Current Status */}
        <div className={`bg-gradient-to-br ${STATUS_CONFIG[status].bg} backdrop-blur-xl rounded-2xl border ${STATUS_CONFIG[status].border} p-6 text-center`}>
          <div className="text-5xl mb-3">{STATUS_CONFIG[status].icon}</div>
          <h2 className={`text-lg font-bold text-${STATUS_CONFIG[status].color}-400`}>{STATUS_CONFIG[status].label}</h2>
          <p className="text-white/30 text-xs mt-2">
            Last active: {lastActive.toLocaleDateString()} {lastActive.toLocaleTimeString()}
          </p>
        </div>

        {/* How Death Detection Works */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5">
          <h3 className="text-white font-semibold text-sm mb-4">🔍 How Your Clone Knows You Died</h3>
          <div className="space-y-4">
            {[
              { icon: '📱', step: '1', title: 'Inactivity Monitor', desc: `If you don't open the app for ${switchDays} days, the system activates` },
              { icon: '📧', step: '2', title: 'Heir Notification', desc: 'Your emergency contacts are asked to confirm your status' },
              { icon: '⏰', step: '3', title: 'Grace Period', desc: '7 days for heirs to respond — if no response, death is assumed' },
              { icon: '🧬', step: '4', title: 'Clone Activation', desc: 'Your clone becomes immortal — posts, messages, and lives on forever' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 flex items-center justify-center text-lg flex-shrink-0">{s.icon}</div>
                <div>
                  <div className="text-white font-medium text-sm">{s.title}</div>
                  <div className="text-white/30 text-xs mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dead Man's Switch */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-red-500/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">⏱️ Dead Man's Switch</h3>
            <button onClick={() => { setDeadManSwitch(!deadManSwitch); saveSettings() }} className={`w-12 h-6 rounded-full transition-all ${deadManSwitch ? 'bg-red-500' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${deadManSwitch ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <p className="text-white/30 text-xs mb-4">
            Automatically activates your clone after {switchDays} days of inactivity
          </p>
          
          {deadManSwitch && (
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs mb-2 block">Inactivity Threshold (days)</label>
                <div className="flex gap-2">
                  {[7, 14, 30, 60, 90, 180, 365].map(d => (
                    <button key={d} onClick={() => { setSwitchDays(d); saveSettings() }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${switchDays === d ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-lg">⚠️</span>
                  <div>
                    <div className="text-red-400 font-medium text-sm">Warning</div>
                    <div className="text-white/30 text-xs mt-1">
                      If you don't log in for {switchDays} consecutive days, the system will:
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Send alerts to your emergency contacts</li>
                        <li>Wait 7 days for confirmation</li>
                        <li>If no response, activate your immortal clone</li>
                        <li>Your clone will post farewell messages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">👥 Emergency Contacts (Heirs)</h3>
            <button onClick={() => setShowAddHeir(!showAddHeir)} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 text-xs text-violet-400 font-medium">
              + Add
            </button>
          </div>
          <p className="text-white/30 text-xs mb-4">
            These people will be notified if you're suspected to be dead. They can confirm your status.
          </p>

          {showAddHeir && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-3 mb-4">
              <input value={heirName} onChange={e => setHeirName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition" />
              <input value={heirEmail} onChange={e => setHeirEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition" />
              <input value={heirPhone} onChange={e => setHeirPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition" />
              <select value={heirRelation} onChange={e => setHeirRelation(e.target.value)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/30 transition appearance-none">
                {RELATIONS.map(r => <option key={r} value={r} className="bg-[#0a0a1a]">{r}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={addHeir} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold text-white">Add Heir</button>
                <button onClick={() => setShowAddHeir(false)} className="px-5 py-3 rounded-xl text-sm text-white/30">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {heirs.map(heir => (
              <div key={heir.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                  {heir.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{heir.name}</div>
                  <div className="text-white/30 text-xs">{heir.relationship} • {heir.email}</div>
                </div>
                <button onClick={() => removeHeir(heir.id)} className="text-red-400/50 hover:text-red-400 transition text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Test Death Sequence */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-amber-500/10 p-5">
          <h3 className="text-white font-semibold text-sm mb-3">🧪 Test Death Sequence</h3>
          <p className="text-white/30 text-xs mb-4">
            Simulate what happens when you die. Your clone will go through the full activation sequence.
          </p>
          <button onClick={testDeathSequence} className="w-full py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 rounded-xl text-sm text-amber-400 font-medium hover:from-amber-500/30 hover:to-orange-500/30 transition-all">
            💀 Test: What Happens When I Die?
          </button>
        </div>

        {/* Test Animation */}
        {showTestDeath && (
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-red-500/20 p-6 text-center animate-slide-up">
            <div className="text-6xl mb-4 animate-pulse">
              {status === 'warning' ? '⚠️' : status === 'critical' ? '🚨' : status === 'dead' ? '💀' : '💚'}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              {status === 'warning' && 'Inactivity Detected...'}
              {status === 'critical' && 'Death Suspected — Contacting Heirs...'}
              {status === 'dead' && 'Clone Activated — You Are Immortal Now'}
            </h3>
            <p className="text-white/40 text-sm">
              {status === 'warning' && `No login for ${switchDays} days`}
              {status === 'critical' && `Notifying ${heirs.length} emergency contacts...`}
              {status === 'dead' && 'Your clone will continue posting, messaging, and living your digital life forever.'}
            </p>
            {status === 'dead' && (
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="text-emerald-400 font-medium text-sm">🧬 Clone Status: ACTIVE</div>
                <div className="text-white/30 text-xs mt-1">Posting farewell messages... Accessing memories... Living forever...</div>
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <button onClick={saveSettings} className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95">
          💾 Save Death Detection Settings
        </button>
      </div>

      <style jsx global>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </main>
  )
}
