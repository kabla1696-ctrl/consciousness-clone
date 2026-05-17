'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

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
  const iv = crypto.getRandomValues(new Uint8Array(5))
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
  const t = useT()
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
  const [matrixChars, setMatrixChars] = useState<Array<{ id: number; x: number; delay: number; char: string }>>([])
  const [fingerprintScan, setFingerprintScan] = useState(false)
  const [vaultRotation, setVaultRotation] = useState(0)
  const [warningPulse, setWarningPulse] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Add form
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('secret')
  const [newMood, setNewMood] = useState('')
  const [newImportance, setNewImportance] = useState(3)

  const lockTimerRef = useRef<any>(null)
  const currentPinRef = useRef<string>('')

  // Generate matrix characters
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
    const m = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      char: chars[Math.floor(Math.random() * chars.length)],
    }))
    setMatrixChars(m)
  }, [])

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
        }, 5000) // Lock after 5 seconds of leaving
      } else {
        clearTimeout(lockTimerRef.current)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [phase])

  // Warning pulse for failed attempts
  useEffect(() => {
    if (attempts > 0 && attempts < MAX_ATTEMPTS) {
      setWarningPulse(true)
      const id = setTimeout(() => setWarningPulse(false), 2000)
      return () => clearTimeout(id)
    }
  }, [attempts])

  // Countdown for nuclear option
  useEffect(() => {
    if (countdown > 0) {
      const id = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(id)
    }
  }, [countdown])

  const setupPin = async () => {
    if (pin.length < 4 || pin.length > 6) return alert(t('pin must be 4-6 digits'))
    if (pin !== confirmPin) return alert(t('pins do not match'))
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
    setFingerprintScan(true)
    setVaultRotation(prev => prev + 360)
    await new Promise(r => setTimeout(r, 2000))
    setFingerprintScan(false)
    const storedHash = localStorage.getItem(VAULT_PIN_HASH)
    const inputHash = await sha256(pinInput)

    if (inputHash === storedHash) {
      setAnimState('granted')
      setAccessMsg('ACCESS GRANTED')
      await new Promise(r => setTimeout(r, 1200))
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
        setCountdown(5)
        await new Promise(r => setTimeout(r, 5000))
        localStorage.removeItem(VAULT_STORAGE)
        localStorage.removeItem(VAULT_PIN_HASH)
        localStorage.removeItem(VAULT_ATTEMPTS)
        setEntries([])
        setPhase('setup')
        setAttempts(0)
        setAccessMsg('')
        setAnimState('idle')
      } else {
        setAnimState('denied')
        setAccessMsg('ACCESS DENIED')
        await new Promise(r => setTimeout(r, 1200))
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
    if (!confirm(`⚠️ ${t('are you sure')}`)) return
    if (!confirm(t('last chance irreversible'))) return
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
      <main className="page-transition min-h-screen flex items-center justify-center bg-[#050510]">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center px-4 bg-[#050510] relative overflow-hidden">
        {/* Matrix rain background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {matrixChars.map(m => (
            <div
              key={m.id}
              className="absolute text-green-500/20 font-mono text-sm animate-[matrix-fall_8s_linear_infinite]"
              style={{ left: `${m.x}%`, animationDelay: `${m.delay}s` }}
            >
              {m.char}
            </div>
          ))}
        </div>
        <div className="w-full max-w-sm space-y-6 text-center relative z-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-2xl animate-pulse" />
            <div className="text-7xl mb-4 relative drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">🔐</div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Create Vault PIN</h1>
          <p className="text-white/40 text-sm">{t('choose a pin')}</p>
          <div className="space-y-3">
            <input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} placeholder={t('enter pin')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:border-red-500/40 focus:outline-none transition backdrop-blur-sm" />
            <input type="password" inputMode="numeric" maxLength={6} value={confirmPin} onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))} placeholder={t('confirm pin')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:border-red-500/40 focus:outline-none transition backdrop-blur-sm" />
            <button onClick={setupPin} disabled={pin.length < 4 || pin !== confirmPin} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium disabled:opacity-30 shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all active:scale-[0.98]">🔒 {t('create vault')}</button>
          </div>
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/50 transition inline-block">← {t('back to dashboard')}</Link>
        </div>
      </main>
    )
  }

  // LOCKED PHASE
  if (phase === 'locked') {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center px-4 bg-[#050510] relative overflow-hidden">
        {/* Matrix rain background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {matrixChars.map(m => (
            <div
              key={m.id}
              className="absolute text-green-500/15 font-mono text-sm animate-[matrix-fall_8s_linear_infinite]"
              style={{ left: `${m.x}%`, animationDelay: `${m.delay}s` }}
            >
              {m.char}
            </div>
          ))}
        </div>

        {/* Warning pulse overlay */}
        {warningPulse && (
          <div className="fixed inset-0 z-40 pointer-events-none animate-[warning-flash_0.5s_ease-out]" style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)',
          }} />
        )}

        <div className="w-full max-w-sm space-y-6 text-center relative z-10">
          {/* Vault door with rotating lock */}
          <div className="relative inline-block">
            <div className={`absolute inset-0 -m-8 rounded-full transition-all duration-1000 ${animState === 'scanning' ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30 blur-2xl animate-pulse' : ''}`} />
            <div
              className={`text-7xl transition-all duration-1000 ${animState === 'scanning' ? 'scale-110' : ''}`}
              style={{ transform: `scale(${animState === 'scanning' ? 1.1 : 1}) rotate(${vaultRotation}deg)` }}
            >
              🔒
            </div>
          </div>

          {/* Fingerprint scan animation */}
          {fingerprintScan && (
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-red-500/50 animate-pulse" />
                <div className="absolute inset-4 rounded-full border-2 border-red-500/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">👆</span>
                </div>
                {/* Scanning line */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-[scan-down_1.5s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {animState === 'idle' && (
            <>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Memory Vault</h1>
              <p className="text-white/40 text-sm">{t('enter pin to unlock')}</p>
              <input type="password" inputMode="numeric" maxLength={6} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && attemptUnlock()} placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:border-red-500/40 focus:outline-none transition backdrop-blur-sm" />
              <button onClick={attemptUnlock} disabled={pinInput.length < 4} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium disabled:opacity-30 shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all active:scale-[0.98]">🔓 {t('unlock')}</button>
              {attempts > 0 && (
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  <p className="text-amber-400 text-xs font-medium">⚠️ {MAX_ATTEMPTS - attempts} {t('attempts remaining before self-destruct')}</p>
                </div>
              )}
            </>
          )}
          {animState === 'scanning' && <p className="text-white/50 animate-pulse font-medium tracking-wider">{t('verifying identity')}</p>}
          {(animState === 'granted' || animState === 'denied') && (
            <div className={`text-3xl font-black tracking-wider ${animState === 'granted' ? 'text-emerald-400' : 'text-red-400'} animate-[glitch_0.3s_ease-in-out]`} style={{
              textShadow: animState === 'denied' ? '0 0 20px rgba(239,68,68,0.5), 2px 0 #00ffff, -2px 0 #ff00ff' : '0 0 20px rgba(52,211,153,0.5)',
            }}>
              {accessMsg}
            </div>
          )}
          <Link href="/dashboard" className="text-sm text-white/30 hover:text-white/50 transition inline-block">← {t('back')}</Link>
        </div>
      </main>
    )
  }

  // UNLOCKED PHASE
  return (
    <main className="page-transition min-h-screen pb-24 relative overflow-hidden">
      {/* Matrix rain background (subtle) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {matrixChars.slice(0, 15).map(m => (
          <div
            key={m.id}
            className="absolute text-green-500/5 font-mono text-xs animate-[matrix-fall_12s_linear_infinite]"
            style={{ left: `${m.x}%`, animationDelay: `${m.delay}s` }}
          >
            {m.char}
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-red-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white flex-1">🔐 Vault</h1>
          <button onClick={lockVault} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">Lock</button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Stats with glowing indicators */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-sm">
            <div className="text-xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">{stats.total}</div>
            <div className="text-[10px] text-white/30">{t('entries')}</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-sm">
            <div className="text-xl font-bold text-amber-400">{stats.topCategory || '—'}</div>
            <div className="text-[10px] text-white/30">{t('top category')}</div>
          </div>
          <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-sm relative">
            <div className="text-xl font-bold text-white/40">{attempts}</div>
            <div className="text-[10px] text-white/30">{t('failed attempts')}</div>
            {attempts > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
            )}
          </div>
        </div>

        {/* Add Button */}
        <button onClick={() => setShowAdd(!showAdd)} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-[0.98] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative">{showAdd ? `✕ ${t('cancel')}` : `＋ ${t('add vault memory')}`}</span>
        </button>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white/[0.03] rounded-xl border border-red-500/10 p-4 space-y-3 backdrop-blur-xl shadow-2xl shadow-red-500/5">
            <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder={t('secret placeholder')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm resize-none h-24 focus:border-red-500/40 focus:outline-none transition" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(cat => (
                <button key={cat.key} onClick={() => setNewCategory(cat.key)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${newCategory === cat.key ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/10' : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10'}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">{t('importance')}:</span>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setNewImportance(n)} className={`text-lg transition hover:scale-110 ${n <= newImportance ? 'opacity-100' : 'opacity-20'}`}>⭐</button>
              ))}
            </div>
            <input value={newMood} onChange={e => setNewMood(e.target.value)} placeholder={t('mood optional')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-red-500/40 focus:outline-none transition" />
            <button onClick={addEntry} disabled={!newContent.trim()} className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-30 shadow-lg shadow-red-500/20 hover:bg-red-500 transition active:scale-[0.98]">🔐 {t('encrypt & save')}</button>
          </div>
        )}

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <div className="text-5xl mb-3 drop-shadow-[0_0_30px_rgba(239,68,68,0.2)]">🔒</div>
            <p>{t('vault empty')}</p>
            <p className="text-xs mt-1">{t('add your first secret')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => {
              const cat = CATEGORIES.find(c => c.key === entry.category)
              return (
                <div key={entry.id} className="bg-white/[0.03] rounded-xl border border-red-500/10 p-4 backdrop-blur-sm hover:bg-white/[0.05] hover:border-red-500/20 transition-all duration-300 group" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat?.icon}</span>
                      <span className={`text-xs font-medium ${cat?.color}`}>{cat?.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: entry.importance }).map((_, i) => <span key={i} className="text-[10px]">⭐</span>)}
                      <button onClick={() => deleteEntry(entry.id)} className="ml-2 text-white/20 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition">✕</button>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{entry.content}</p>
                  <div className="text-[10px] text-white/20 mt-2">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Nuclear Option with dramatic countdown */}
        <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/[0.03] backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5" />
          <div className="relative">
            <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
              ☢️ Nuclear Option
              {countdown > 0 && (
                <span className="text-lg font-black text-red-500 animate-pulse">{countdown}</span>
              )}
            </h3>
            <p className="text-xs text-white/30 mb-3">{t('permanently destroy all vault data')}</p>
            <button onClick={nuclearWipe} className="w-full py-2.5 rounded-xl bg-red-900/50 text-red-300 text-sm font-medium border border-red-500/20 hover:bg-red-900/80 transition-all active:scale-[0.98] relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative">💀 {t('destroy everything')}</span>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-[10px] text-white/15 space-y-1 text-center">
          <p>AES-256-GCM encryption • PBKDF2 key derivation</p>
          <p>{MAX_ATTEMPTS - attempts} {t('attempts remaining')}</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
        }
        @keyframes scan-down {
          0% { top: 10%; }
          50% { top: 80%; }
          100% { top: 10%; }
        }
        @keyframes warning-flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </main>
  )
}
