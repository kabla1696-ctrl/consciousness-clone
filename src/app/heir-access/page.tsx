'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Heir {
  id: string; name: string; email: string; phone: string; relation: string
  accessLevel: 'full' | 'partial' | 'chat_only'; verificationMethod: string
  secretQuestion: string; secretAnswerHash: string; inviteCode: string
  accessRule: string; accessDays: number; canExport: boolean; canAddMemories: boolean
  verified: boolean; createdAt: string
}

const RELATIONS = [
  { key: 'spouse', label: 'Spouse', icon: '💑' }, { key: 'child', label: 'Child', icon: '👶' },
  { key: 'sibling', label: 'Sibling', icon: '👫' }, { key: 'parent', label: 'Parent', icon: '🧓' },
  { key: 'friend', label: 'Friend', icon: '🤝' }, { key: 'other', label: 'Other', icon: '👤' },
]
const ACCESS_LEVELS = [
  { key: 'full', label: 'Full Access', desc: 'Chat + Voice + Selected Memories', icon: '🔓' },
  { key: 'partial', label: 'Partial', desc: 'Chat + Voice only, no memories', icon: '🔑' },
  { key: 'chat_only', label: 'Chat Only', desc: 'Text chat only', icon: '💬' },
]
const ACCESS_RULES = [
  { key: 'immediately', label: 'Immediately' }, { key: 'inactivity', label: 'After Inactivity' },
  { key: 'date', label: 'After Specific Date' }, { key: 'manual', label: 'Manual Approval' },
]
const STORAGE_KEY = 'consciousness-heirs'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function HeirAccessPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [heirs, setHeirs] = useState<Heir[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState('')
  const [relation, setRelation] = useState('spouse'); const [accessLevel, setAccessLevel] = useState<Heir['accessLevel']>('full')
  const [verificationMethod, setVerificationMethod] = useState('secret_question')
  const [secretQuestion, setSecretQuestion] = useState(''); const [secretAnswer, setSecretAnswer] = useState('')
  const [accessRule, setAccessRule] = useState('inactivity'); const [accessDays, setAccessDays] = useState(90)
  const [canExport, setCanExport] = useState(true); const [canAddMemories, setCanAddMemories] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setHeirs(JSON.parse(stored)) } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const saveHeirs = (h: Heir[]) => { setHeirs(h); localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) }

  const addHeir = async () => {
    if (!name.trim()) return
    const answerHash = secretAnswer ? await sha256(secretAnswer.toLowerCase().trim()) : ''
    const heir: Heir = {
      id: editingId || Date.now().toString(), name: name.trim(), email, phone, relation, accessLevel,
      verificationMethod, secretQuestion, secretAnswerHash: answerHash,
      inviteCode: editingId ? (heirs.find(h => h.id === editingId)?.inviteCode || generateCode()) : generateCode(),
      accessRule, accessDays, canExport, canAddMemories, verified: false, createdAt: new Date().toISOString(),
    }
    const updated = editingId ? heirs.map(h => h.id === editingId ? heir : h) : [...heirs, heir]
    saveHeirs(updated); resetForm()
  }

  const deleteHeir = (id: string) => { if (!confirm('Remove this heir?')) return; saveHeirs(heirs.filter(h => h.id !== id)) }

  const resetForm = () => {
    setShowAdd(false); setEditingId(null); setName(''); setEmail(''); setPhone(''); setRelation('spouse')
    setAccessLevel('full'); setVerificationMethod('secret_question'); setSecretQuestion(''); setSecretAnswer('')
    setAccessRule('inactivity'); setAccessDays(90); setCanExport(true); setCanAddMemories(true)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] pb-24 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 -left-20 w-72 h-72 bg-amber-600/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 -right-32 w-80 h-80 bg-orange-500/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-amber-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-amber-500/30 transition-all duration-300 group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">🔑 Heir Access</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Intro */}
        <div className="bg-amber-500/[0.04] backdrop-blur-xl border border-amber-500/10 rounded-2xl p-5 shadow-lg shadow-amber-500/5">
          <h3 className="text-sm font-bold text-amber-400 mb-2">🔐 Digital Legacy</h3>
          <p className="text-xs text-white/35 leading-relaxed">Designate trusted heirs who can access your Consciousness Clone after you&apos;re gone. Set access levels, verification methods, and rules.</p>
        </div>

        {/* Add Button */}
        <button onClick={() => { resetForm(); setShowAdd(!showAdd) }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white font-semibold hover:shadow-xl hover:shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-white/10 to-amber-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative z-10">{showAdd ? '✕ Cancel' : '＋ Add Heir'}</span>
        </button>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-amber-500/15 p-5 space-y-5 shadow-xl shadow-black/10">
            <h3 className="text-sm font-bold text-amber-400">{editingId ? 'Edit Heir' : 'New Heir'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *" className="col-span-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all" />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all" />
            </div>
            <div>
              <label className="text-xs text-white/30 mb-2 block font-semibold uppercase tracking-wider">Relation</label>
              <div className="flex gap-2 flex-wrap">
                {RELATIONS.map(r => (
                  <button key={r.key} onClick={() => setRelation(r.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${relation === r.key ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5' : 'bg-white/[0.03] text-white/25 border border-white/[0.06] hover:bg-white/[0.06]'}`}>
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/30 mb-2 block font-semibold uppercase tracking-wider">Access Level</label>
              <div className="space-y-2.5">
                {ACCESS_LEVELS.map(al => (
                  <button key={al.key} onClick={() => setAccessLevel(al.key as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${accessLevel === al.key ? 'bg-amber-500/10 border border-amber-500/25 shadow-lg shadow-amber-500/5' : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05]'}`}>
                    <span className="text-xl">{al.icon}</span>
                    <div><div className="text-sm font-semibold text-white">{al.label}</div><div className="text-[10px] text-white/25">{al.desc}</div></div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/30 mb-2 block font-semibold uppercase tracking-wider">Verification Method</label>
              <select value={verificationMethod} onChange={e => setVerificationMethod(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all">
                <option value="secret_question">Secret Question</option><option value="shared_memory">Shared Memory</option><option value="invite_code">Invite Code</option>
              </select>
            </div>
            {verificationMethod === 'secret_question' && (
              <div className="space-y-2.5">
                <input value={secretQuestion} onChange={e => setSecretQuestion(e.target.value)} placeholder="Question only they would know" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all" />
                <input value={secretAnswer} onChange={e => setSecretAnswer(e.target.value)} placeholder="Answer (hashed, never stored)" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all" />
              </div>
            )}
            <div>
              <label className="text-xs text-white/30 mb-2 block font-semibold uppercase tracking-wider">When to Grant Access</label>
              <div className="flex gap-2 flex-wrap">
                {ACCESS_RULES.map(ar => (
                  <button key={ar.key} onClick={() => setAccessRule(ar.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${accessRule === ar.key ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5' : 'bg-white/[0.03] text-white/25 border border-white/[0.06] hover:bg-white/[0.06]'}`}>
                    {ar.label}
                  </button>
                ))}
              </div>
              {accessRule === 'inactivity' && (
                <select value={accessDays} onChange={e => setAccessDays(parseInt(e.target.value))}
                  className="mt-2.5 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/40 transition-all">
                  <option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option>
                  <option value={180}>180 days</option><option value={365}>365 days</option>
                </select>
              )}
            </div>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-sm text-white/40 cursor-pointer"><input type="checkbox" checked={canExport} onChange={e => setCanExport(e.target.checked)} className="rounded accent-amber-500" /> Can Export</label>
              <label className="flex items-center gap-2 text-sm text-white/40 cursor-pointer"><input type="checkbox" checked={canAddMemories} onChange={e => setCanAddMemories(e.target.checked)} className="rounded accent-amber-500" /> Can Add Memories</label>
            </div>
            <button onClick={addHeir} disabled={!name.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold disabled:opacity-30 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
              {editingId ? '💾 Update Heir' : '🔑 Save Heir'}
            </button>
          </div>
        )}

        {/* Heirs List */}
        {heirs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">🔑</div>
            <p className="text-white/30 text-base font-semibold">No heirs designated</p>
            <p className="text-white/15 text-xs mt-1">Add someone you trust</p>
          </div>
        ) : (
          <div className="space-y-3">
            {heirs.map(heir => {
              const rel = RELATIONS.find(r => r.key === heir.relation); const al = ACCESS_LEVELS.find(a => a.key === heir.accessLevel)
              return (
                <div key={heir.id} className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-amber-500/10 p-5 shadow-xl shadow-black/10 hover:border-amber-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-lg">{rel?.icon}</div>
                      <div>
                        <h3 className="text-white font-semibold">{heir.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/25 mt-0.5"><span>{rel?.label}</span><span>•</span><span>{al?.icon} {al?.label}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowAdd(true); setEditingId(heir.id); setName(heir.name); setEmail(heir.email); setPhone(heir.phone); setRelation(heir.relation); setAccessLevel(heir.accessLevel); setAccessRule(heir.accessRule); setAccessDays(heir.accessDays) }} className="text-white/15 hover:text-amber-400 text-xs transition-colors">✏️</button>
                      <button onClick={() => deleteHeir(heir.id)} className="text-white/15 hover:text-red-400 text-xs transition-colors">✕</button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono border border-amber-500/15">{heir.inviteCode}</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full ${heir.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-white/[0.03] text-white/15 border border-white/[0.04]'}`}>
                      {heir.verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
