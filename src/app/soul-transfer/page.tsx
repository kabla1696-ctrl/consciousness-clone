'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface SoulBond {
  id: string
  friendName: string
  friendEmail: string
  bondLevel: number
  sharedMemories: number
  status: 'pending' | 'active' | 'declined'
  createdAt: string
}

export default function SoulTransferPage() {
  const t = useT()
  const [bonds, setBonds] = useState<SoulBond[]>([])
  const [showForm, setShowForm] = useState(false)
  const [friendName, setFriendName] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  const [selectedMemories, setSelectedMemories] = useState<string[]>([])
  const [availableMemories, setAvailableMemories] = useState<{id: string; title: string; category: string; [key: string]: unknown}[]>([])
  const [showMemoryPicker, setShowMemoryPicker] = useState(false)
  const [activeBond, setActiveBond] = useState<SoulBond | null>(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferProgress, setTransferProgress] = useState(0)
  const [transferring, setTransferring] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, color: string}>>([])

  useEffect(() => {
    const stored = localStorage.getItem('cc_soul_bonds')
    if (stored) setBonds(JSON.parse(stored))
    
    const memories = localStorage.getItem('cc_memories')
    if (memories) {
      const parsed = JSON.parse(memories)
      setAvailableMemories(parsed.length > 0 ? parsed : [
        { id: '1', title: 'First Memory', content: 'My first stored memory', category: 'milestone' },
        { id: '2', title: 'Childhood Home', content: 'The house I grew up in', category: 'childhood' },
        { id: '3', title: 'Best Friend', content: 'My best friend from school', category: 'friendship' },
        { id: '4', title: 'First Love', content: 'The day I fell in love', category: 'love' },
        { id: '5', title: 'Dream Job', content: 'When I got my dream job', category: 'career' },
      ])
    }

    // Floating particles
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: ['violet', 'fuchsia', 'pink', 'blue', 'cyan'][Math.floor(Math.random() * 5)]
    }))
    setParticles(p)
  }, [])

  const saveBonds = (newBonds: SoulBond[]) => {
    setBonds(newBonds)
    localStorage.setItem('cc_soul_bonds', JSON.stringify(newBonds))
  }

  const createBond = () => {
    if (!friendName.trim() || !friendEmail.trim()) return
    const newBond: SoulBond = {
      id: Date.now().toString(),
      friendName: friendName.trim(),
      friendEmail: friendEmail.trim(),
      bondLevel: 0,
      sharedMemories: selectedMemories.length,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    saveBonds([...bonds, newBond])
    setFriendName('')
    setFriendEmail('')
    setSelectedMemories([])
    setShowForm(false)
  }

  const acceptBond = (id: string) => {
    saveBonds(bonds.map(b => b.id === id ? { ...b, status: 'active', bondLevel: 1 } : b))
  }

  const startTransfer = (bond: SoulBond) => {
    setActiveBond(bond)
    setShowTransfer(true)
    setTransferProgress(0)
    setTransferring(true)
    
    // Simulate transfer
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        setTransferring(false)
        clearInterval(interval)
        saveBonds(bonds.map(b => b.id === bond.id ? { ...b, sharedMemories: selectedMemories.length, bondLevel: Math.min(b.bondLevel + 1, 5) } : b))
      }
      setTransferProgress(Math.min(progress, 100))
    }, 300)
  }

  const BOND_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']
  const BOND_LABELS = ['Stranger', 'Acquaintance', 'Friend', 'Soulmate', 'Twin Soul']

  return (
    <main className="min-h-screen bg-[#050510] relative pb-24 md:pb-8">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map(p => (
          <div key={p.id} className={`absolute rounded-full bg-${p.color}-500/10 animate-pulse`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size * 4}px`, height: `${p.size * 4}px`, animationDuration: `${2 + p.id % 3}s` }} />
        ))}
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-fuchsia-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">🧬 Soul Transfer</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 text-xs text-violet-400 font-medium tap-feedback">
            + New Bond
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Hero */}
        <div className="text-center mb-6">
          <div aria-hidden="true" className="text-6xl mb-4" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>🧬</div>
          <h2 className="text-xl font-bold text-white mb-2">Share Your Soul</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">Create a soul bond with someone special. Share your memories, personality, and essence with your clone.</p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🤝', title: 'Bond', desc: 'Connect with a friend' },
            { icon: '🧠', title: 'Share', desc: 'Select memories to transfer' },
            { icon: '✨', title: 'Transfer', desc: 'Clones share your essence' },
          ].map((step, i) => (
            <div key={i} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 text-center">
              <div className="text-2xl mb-2">{step.icon}</div>
              <div className="text-white font-semibold text-xs">{step.title}</div>
              <div className="text-white/30 text-[10px] mt-1">{step.desc}</div>
            </div>
          ))}
        </div>

        {/* Create Bond Form */}
        {showForm && (
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-violet-500/10 p-6 space-y-4">
            <h3 className="text-sm font-bold text-violet-400 uppercase tracking-wider">Create Soul Bond</h3>
            <input
              value={friendName}
              onChange={e => setFriendName(e.target.value)}
              placeholder={t('friend name')}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition"
            />
            <input
              value={friendEmail}
              onChange={e => setFriendEmail(e.target.value)}
              placeholder={t('friend email')}
              type="email"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition"
            />
            
            {/* Memory Picker */}
            <div>
              <button onClick={() => setShowMemoryPicker(!showMemoryPicker)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/50 text-left flex items-center justify-between">
                <span>{selectedMemories.length > 0 ? `${selectedMemories.length} memories selected` : 'Select memories to share'}</span>
                <span>{showMemoryPicker ? '▲' : '▼'}</span>
              </button>
              
              {showMemoryPicker && (
                <div className="mt-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {availableMemories.map(mem => (
                    <label key={mem.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={selectedMemories.includes(mem.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedMemories([...selectedMemories, mem.id])
                          else setSelectedMemories(selectedMemories.filter(id => id !== mem.id))
                        }}
                        className="accent-violet-500"
                      />
                      <div>
                        <div className="text-white text-sm">{mem.title}</div>
                        <div className="text-white/30 text-xs">{mem.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={createBond} disabled={!friendName.trim() || !friendEmail.trim()} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold text-white disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95">
                🤝 Create Bond
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl text-sm text-white/30 hover:text-white/50 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Transfer Animation */}
        {showTransfer && activeBond && (
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-violet-500/10 p-6">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🧬</div>
              <h3 className="text-white font-bold">Transferring to {activeBond.friendName}</h3>
              <p className="text-white/30 text-xs mt-1">{selectedMemories.length} memories being shared</p>
            </div>
            
            {/* Progress */}
            <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-300"
                style={{ width: `${transferProgress}%` }} />
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-violet-400">{Math.round(transferProgress)}%</span>
              {transferring && <span className="text-white/30 text-xs ml-2 animate-pulse">Transferring...</span>}
              {!transferring && <span className="text-emerald-400 text-xs ml-2">✓ Transfer Complete!</span>}
            </div>

            {!transferring && (
              <button onClick={() => setShowTransfer(false)} className="w-full mt-4 py-3 bg-white/5 rounded-xl text-sm text-white/50 hover:text-white/70 transition">Close</button>
            )}
          </div>
        )}

        {/* Soul Bonds */}
        {bonds.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Your Soul Bonds</h3>
            {bonds.map((bond, i) => (
              <div key={bond.id} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                    {bond.friendName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{bond.friendName}</h4>
                    <p className="text-white/30 text-xs">{bond.friendEmail}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      bond.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      bond.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {bond.status === 'active' ? '🟢 Active' : bond.status === 'pending' ? '🟡 Pending' : '🔴 Declined'}
                    </div>
                  </div>
                </div>

                {/* Bond Level */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-white/30 text-xs">Bond Level:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(l => (
                      <div key={l} className={`w-6 h-1.5 rounded-full ${l <= bond.bondLevel ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: BOND_COLORS[bond.bondLevel] }}>{BOND_LABELS[bond.bondLevel]}</span>
                </div>

                {/* Stats */}
                <div className="mt-3 flex gap-4 text-xs text-white/30">
                  <span>🧠 {bond.sharedMemories} memories shared</span>
                  <span>📅 {new Date(bond.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Actions */}
                {bond.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => acceptBond(bond.id)} className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
                      ✓ Accept Bond
                    </button>
                    <button onClick={() => saveBonds(bonds.map(b => b.id === bond.id ? { ...b, status: 'declined' } : b))} className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
                      ✕ Decline
                    </button>
                  </div>
                )}

                {bond.status === 'active' && (
                  <button onClick={() => startTransfer(bond)} className="w-full mt-4 py-2.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 rounded-xl text-xs text-violet-400 font-medium hover:from-violet-500/30 hover:to-fuchsia-500/30 transition-all">
                    🧬 Transfer Memories
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {bonds.length === 0 && !showForm && (
          <div className="text-center py-12">
            <div aria-hidden="true" className="text-6xl mb-4 opacity-50">🤝</div>
            <h3 className="text-white/50 font-semibold mb-2">No Soul Bonds Yet</h3>
            <p className="text-white/30 text-sm mb-6">Create your first soul bond to share your essence with someone special</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold text-white hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95">
              🤝 Create First Bond
            </button>
          </div>
        )}

        {/* Info */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.04] p-5">
          <h3 className="text-white font-semibold text-sm mb-3">How Soul Transfer Works</h3>
          <div className="space-y-3 text-xs text-white/40">
            <div className="flex gap-3">
              <span className="text-violet-400">1.</span>
              <span>Create a soul bond with someone you trust</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400">2.</span>
              <span>Select which memories you want to share</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400">3.</span>
              <span>Transfer happens securely between your clones</span>
            </div>
            <div className="flex gap-3">
              <span className="text-violet-400">4.</span>
              <span>Their clone will experience your shared memories</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  )
}
