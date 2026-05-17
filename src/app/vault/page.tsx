'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface VaultEntry {
  id: string
  encrypted: string
  iv: string
  category: string
  importance: number
  createdAt: string
}

interface DecryptedEntry {
  id: string
  content: string
  category: string
  importance: number
  mood: string
  createdAt: string
}

const CATEGORIES = [
  { key: 'secret', label: 'Secret', icon: '🤫', color: 'text-violet-400' },
  { key: 'confession', label: 'Confession', icon: '💔', color: 'text-rose-400' },
  { key: 'fear', label: 'Fear', icon: '😰', color: 'text-blue-400' },
  { key: 'regret', label: 'Regret', icon: '😞', color: 'text-amber-400' },
  { key: 'dark_truth', label: 'Dark Truth', icon: '🌑', color: 'text-slate-400' },
]

const DUMMY_ENTRIES: DecryptedEntry[] = [
  { id: 'd1', content: 'I sometimes eat cereal for dinner and tell no one.', category: 'secret', importance: 1, mood: '😂', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { id: 'd2', content: 'I once pretended to be sick to skip a family gathering.', category: 'confession', importance: 2, mood: '😬', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: 'd3', content: 'I am afraid of butterflies. Don\'t ask.', category: 'fear', importance: 3, mood: '😰', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
]

const VAULT_STORAGE = 'consciousness-vault-entries'
const VAULT_PIN_HASH = 'consciousness-vault-pin'
const VAULT_ATTEMPTS = 'consciousness-vault-attempts'
const MAX_ATTEMPTS = 5

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(pin) as BufferSource, 'PBKDF2', false, ['deriveKey'])
  const derived = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  return derived as CryptoKey
}

async function encryptData(text: string, pin: string): Promise<{ encrypted: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(pin, salt)
  const encoder = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text))
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  }
}

async function decryptData(encryptedStr: string, ivStr: string, saltStr: string, pin: string): Promise<string | null> {
  try {
    const encrypted = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0))
    const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0))
    const key = await deriveKey(pin, salt)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

export default function VaultPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'locked' | 'setup' | 'unlocked' | 'denied'>('locked')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [entries, setEntries] = useState<DecryptedEntry[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [accessMsg, setAccessMsg] = useState('')
  const [animState, setAnimState] = useState<'idle' | 'scanning' | 'granted' | 'denied'>('idle')

  // Add form
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('secret')
  const [newMood, setNewMood] = useState('')
  const [newImportance, setNewImportance] = useState(3)

  const lockTimerRef = useRef<any>(null)
  const currentPinRef = useRef<string>('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const storedAttempts = localStorage.getItem(VAULT_ATTEMPTS)
      if (storedAttempts) setAttempts(parseInt(storedAttempts))
      const hasPin = localStorage.getItem(VAULT_PIN_HASH)
      setPhase(hasPin ? 'locked' : 'setup')
      setLoading(false)
    }
    init()
  }, [])

  // Auto-lock on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'unlocked') {
        lockTimerRef.current = setTimeout(() => {
          setPhase('locked')
          setEntries([])
          currentPinRef.current = ''
          setPinInput('')
        }, 30000)
      } else {
        clearTimeout(lockTimerRef.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [phase])

  const setupPin = async () => {
    if (pin.length < 4 || pin.length > 6) return alert('PIN must be 4-6 digits')
    if (pin !== confirmPin) return alert('PINs do not match')
    const hash = await sha256(pin)
    localStorage.setItem(VAULT_PIN_HASH, hash)
    localStorage.setItem(VAULT_ATTEMPTS, '0')
    currentPinRef.current = pin
    setAttempts(0)
    setPhase('unlocked')
    setPin('')
    setConfirmPin('')
  }

  const attemptUnlock = async () => {
    setAnimState('scanning')
    await new Promise(r => setTimeout(r, 1200))
    const storedHash = localStorage.getItem(VAULT_PIN_HASH)
    const inputHash = await sha256(pinInput)

    if (inputHash === storedHash) {
      setAnimState('granted')
      setAccessMsg('ACCESS GRANTED')
      await new Promise(r => setTimeout(r, 1000))
      currentPinRef.current = pinInput
      setAttempts(0)
      localStorage.setItem(VAULT_ATTEMPTS, '0')
      setPhase('unlocked')
      setPinInput('')
      setAccessMsg('')
      setAnimState('idle')
      await loadEntries(pinInput)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem(VAULT_ATTEMPTS, newAttempts.toString())

      if (newAttempts >= MAX_ATTEMPTS) {
        setAnimState('denied')
        setAccessMsg('SELF-DESTRUCT ACTIVATED')
        await new Promise(r => setTimeout(r, 1500))
        localStorage.removeItem(VAULT_STORAGE)
        localStorage.removeItem(VAULT_PIN_HASH)
        localStorage.removeItem(VAULT_ATTEMPTS)
        setEntries([])
        setPhase('setup')
        setAttempts(0)
        setAccessMsg('')
        setAnimState('idle')
      } else {
        // Decoy mode
        setAnimState('denied')
        setAccessMsg('ACCESS DENIED')
        await new Promise(r => setTimeout(r, 1000))
        setEntries(DUMMY_ENTRIES)
        setPhase('unlocked')
        currentPinRef.current = ''
        setPinInput('')
        setAccessMsg('')
        setAnimState('idle')
      }
    }
  }

  const loadEntries = async (pin: string) => {
    try {
      const stored = localStorage.getItem(VAULT_STORAGE)
      if (!stored) { setEntries([]); return }
      const raw: VaultEntry[] = JSON.parse(stored)
      const decrypted: DecryptedEntry[] = []
      for (const entry of raw) {
        const content = await decryptData(entry.encrypted, entry.iv, entry.iv, pin)
        if (content) {
          decrypted.push({ id: entry.id, content, category: entry.category, importance: entry.importance, mood: '', createdAt: entry.createdAt })
        }
      }
      setEntries(decrypted)
    } catch { setEntries([]) }
  }

  const addEntry = async () => {
    if (!newContent.trim() || !currentPinRef.current) return
    const enc = await encryptData(newContent, currentPinRef.current)
    const raw: VaultEntry[] = JSON.parse(localStorage.getItem(VAULT_STORAGE) || '[]')
    raw.push({ id: Date.now().toString(), encrypted: enc.encrypted, iv: enc.iv, category: newCategory, importance: newImportance, createdAt: new Date().toISOString() })
    localStorage.setItem(VAULT_STORAGE, JSON.stringify(raw))
    setEntries(prev => [...prev, { id: Date.now().toString(), content: newContent, category: newCategory, importance: newImportance, mood: newMood, createdAt: new Date().toISOString() }])
    setNewContent('')
    setNewMood('')
    setShowAdd(false)
  }

  const deleteEntry = (id: string) => {
    const raw: VaultEntry[] = JSON.parse(localStorage.getItem(VAULT_STORAGE) || '[]')
    localStorage.setItem(VAULT_STORAGE, JSON.stringify(raw.filter(e => e.id !== id)))
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const nuclearWipe = () => {
    if (!confirm('⚠️ This will permanently destroy ALL vault data. Continue?')) return
    if (!confirm('Last chance. This is IRREVERSIBLE.')) return
    localStorage.removeItem(VAULT_STORAGE)
    localStorage.removeItem(VAULT_PIN_HASH)
    localStorage.removeItem(VAULT_ATTEMPTS)
    setEntries([])
    currentPinRef.current = ''
    setPhase('setup')
  }

  const lockVault = () => {
    setPhase('locked')
    setEntries([])
    currentPinRef.current = ''
    setPinInput('')
  }

  const stats = {
    total: entries.length,
    oldest: entries.length > 0 ? entries.reduce((a: DecryptedEntry, b: DecryptedEntry) => a.createdAt < b.createdAt ? a : b).createdAt : null,
    topCategory: entries.length > 0 ? (() => {
      const counts: Record<string, number> = {}
      entries.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1 })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
      return CATEGORIES.find(c => c.key === top)?.label || null
    })() : null,
  }

  if (loading) {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white">Create Vault PIN</h1>
          <p className="text-white/40 text-sm">Choose a 4-6 digit PIN to protect your vault. This cannot be recovered.</p>
          <div className="space-y-3">
            <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} placeholder="Enter PIN" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em]" />
            <input type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder="Confirm PIN" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em]" />
            <button onClick={setupPin} disabled={pin.length < 4 || pin !== confirmPin} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium disabled:opacity-30">🔒 Create Vault</button>
          </div>
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/50">← Back to Dashboard</Link>
        </div>
      </main>
    )
  }

  // LOCKED PHASE
  if (phase === 'locked') {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className={`text-7xl transition-transform ${animState === 'scanning' ? 'animate-pulse scale-110' : ''}`}>🔒</div>
          {animState === 'idle' && (
            <>
              <h1 className="text-2xl font-bold text-white">Memory Vault</h1>
              <p className="text-white/40 text-sm">Enter your PIN to unlock</p>
              <input type="password" inputMode="numeric" maxLength={6} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && attemptUnlock()} placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em]" />
              <button onClick={attemptUnlock} disabled={pinInput.length < 4} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium disabled:opacity-30">🔓 Unlock</button>
              {attempts > 0 && <p className="text-amber-400 text-xs">⚠️ {MAX_ATTEMPTS - attempts} attempts remaining before self-destruct</p>}
            </>
          )}
          {animState === 'scanning' && <p className="text-white/50 animate-pulse">Verifying...</p>}
          {(animState === 'granted' || animState === 'denied') && (
            <div className={`text-2xl font-bold tracking-wider ${animState === 'granted' ? 'text-emerald-400' : 'text-red-400'}`}>
              {accessMsg}
            </div>
          )}
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/50">← Back</Link>
        </div>
      </main>
    )
  }

  // UNLOCKED PHASE
  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-red-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white flex-1">🔐 Vault</h1>
          <button onClick={lockVault} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">Lock</button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-xl font-bold text-red-400">{stats.total}</div>
            <div className="text-[10px] text-white/30">Entries</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-xl font-bold text-amber-400">{stats.topCategory || '—'}</div>
            <div className="text-[10px] text-white/30">Top Category</div>
          </div>
          <div className="bg-white/5 rounded-xl border border-white/10 p-3 text-center">
            <div className="text-xl font-bold text-white/40">{attempts}</div>
            <div className="text-[10px] text-white/30">Failed Attempts</div>
          </div>
        </div>

        {/* Add Button */}
        <button onClick={() => setShowAdd(!showAdd)} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/20 transition-all">
          {showAdd ? '✕ Cancel' : '＋ Add Vault Memory'}
        </button>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white/5 rounded-xl border border-red-500/10 p-4 space-y-3">
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Your secret is safe here..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none h-24" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setNewCategory(cat.key)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${newCategory === cat.key ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Importance:</span>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setNewImportance(n)} className={`text-lg ${n <= newImportance ? 'opacity-100' : 'opacity-20'}`}>⭐</button>
              ))}
            </div>
            <input value={newMood} onChange={e => setNewMood(e.target.value)} placeholder="Mood (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
            <button onClick={addEntry} disabled={!newContent.trim()} className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-30">🔐 Encrypt & Save</button>
          </div>
        )}

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <div className="text-5xl mb-3">🔒</div>
            <p>Your vault is empty</p>
            <p className="text-xs mt-1">Add your first secret</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(entry => {
              const cat = CATEGORIES.find(c => c.key === entry.category)
              return (
                <div key={entry.id} className="bg-white/5 rounded-xl border border-red-500/10 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{cat?.icon}</span>
                      <span className={`text-xs font-medium ${cat?.color}`}>{cat?.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: entry.importance }).map((_, i) => <span key={i} className="text-[10px]">⭐</span>)}
                      <button onClick={() => deleteEntry(entry.id)} className="ml-2 text-white/20 hover:text-red-400 text-xs">✕</button>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{entry.content}</p>
                  <div className="text-[10px] text-white/20 mt-2">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Nuclear Option */}
        <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
          <h3 className="text-sm font-medium text-red-400 mb-2">☢️ Nuclear Option</h3>
          <p className="text-xs text-white/30 mb-3">Permanently destroy all vault data. This cannot be undone.</p>
          <button onClick={nuclearWipe} className="w-full py-2.5 rounded-xl bg-red-900/50 text-red-300 text-sm font-medium border border-red-500/20 hover:bg-red-900/80 transition-colors">
            💀 Destroy Everything
          </button>
        </div>

        {/* Info */}
        <div className="text-[10px] text-white/15 space-y-1 text-center">
          <p>AES-256-GCM encryption • PBKDF2 key derivation</p>
          <p>{MAX_ATTEMPTS - attempts} attempts remaining • Auto-locks after 30s inactivity</p>
        </div>
      </div>
    </main>
  )
}
