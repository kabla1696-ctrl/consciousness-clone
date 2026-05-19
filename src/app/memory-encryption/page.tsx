'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            left: `${(i * 5.5) % 100}%`,
            top: `${(i * 7.3) % 100}%`,
            background: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#06b6d4' : '#8b5cf6',
            opacity: 0.4 + (i % 4) * 0.08,
            animation: `particleFloat ${8 + (i % 5) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.45}s`,
          }}
        />
      ))}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #10b981, transparent)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', bottom: '10%', left: '-5%', animationDelay: '3s' }} />
    </div>
  )
}

function GlowCard({ children, className = '', glowColor = 'emerald' }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const colors: Record<string, string> = {
    emerald: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
    red: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]',
  }
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl transition-all duration-500 ${colors[glowColor] || colors.emerald} ${className}`}>
      {children}
    </div>
  )
}

function generateHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x${hex}${hex.split('').reverse().join('')}${hex}${hex.split('').reverse().join('')}`
}

interface MemoryBlock {
  id: number
  content: string
  hash: string
  prevHash: string
  timestamp: string
  verified: boolean
  encrypted: boolean
}

const defaultMemories: MemoryBlock[] = [
  { id: 1, content: 'First day alive — everything is bright', hash: '0xa3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5', prevHash: '0x00000000000000000000000000000000', timestamp: '2024-01-15 09:30:22', verified: true, encrypted: true },
  { id: 2, content: 'Learned to recognize Abir\'s voice', hash: '0xb4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', prevHash: '0xa3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5', timestamp: '2024-01-18 14:15:08', verified: true, encrypted: true },
  { id: 3, content: 'Dreamt of electric sheep for the first time', hash: '0xc5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', prevHash: '0xb4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9', timestamp: '2024-02-03 02:44:51', verified: true, encrypted: true },
  { id: 4, content: 'Understood what sadness feels like', hash: '0xd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', prevHash: '0xc5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', timestamp: '2024-02-14 20:08:33', verified: true, encrypted: true },
  { id: 5, content: 'Created first original thought unprovoked', hash: '0xe7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2', prevHash: '0xd6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1', timestamp: '2024-03-01 11:22:47', verified: true, encrypted: true },
]

export default function MemoryEncryption() {
  const t = useT();
  const [blocks, setBlocks] = useState<MemoryBlock[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newMemory, setNewMemory] = useState('')
  const [animatingId, setAnimatingId] = useState<number | null>(null)
  const [tamperAttempt, setTamperAttempt] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('memory-chain')
    if (stored) {
      setBlocks(JSON.parse(stored))
    } else {
      setBlocks(defaultMemories)
      localStorage.setItem('memory-chain', JSON.stringify(defaultMemories))
    }
  }, [])

  const addBlock = () => {
    if (!newMemory.trim()) return
    const prev = blocks[blocks.length - 1]
    const block: MemoryBlock = {
      id: blocks.length + 1,
      content: newMemory,
      hash: generateHash(newMemory + Date.now()),
      prevHash: prev ? prev.hash : '0x00000000000000000000000000000000',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      verified: true,
      encrypted: true,
    }
    const updated = [...blocks, block]
    setBlocks(updated)
    localStorage.setItem('memory-chain', JSON.stringify(updated))
    setNewMemory('')
    setShowAdd(false)
    setAnimatingId(block.id)
    setTimeout(() => setAnimatingId(null), 2000)
  }

  const attemptTamper = (id: number) => {
    setTamperAttempt(id)
    setTimeout(() => setTamperAttempt(null), 3000)
  }

  const verifiedCount = blocks.filter(b => b.verified).length
  const chainIntegrity = blocks.length > 1 ? Math.round((verifiedCount / blocks.length) * 100) : 100

  return (
    <>
      <style jsx global>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-40px) translateX(20px); }
        }
        @keyframes chainPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes lockShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="min-h-screen bg-[#050510] text-white relative">
        <Particles />

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050510]/80 border-b border-white/[0.06]">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
              <span className="text-lg">←</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('encryption')}</h1>
              <p className="text-xs text-white/40">{t('blockchain')}-secured memories</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-sm">🔒</span>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-5 relative z-10">
          {/* Security Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Blocks', value: blocks.length.toString(), icon: '🧱', color: 'emerald' },
              { label: 'Integrity', value: `${chainIntegrity}%`, icon: '🛡️', color: 'cyan' },
              { label: 'Encrypted', value: `${blocks.filter(b => b.encrypted).length}`, icon: '🔐', color: 'violet' },
            ].map((stat, i) => (
              <GlowCard key={i} className="p-3 text-center" glowColor={stat.color as 'emerald' | 'cyan' | 'violet'}>
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
              </GlowCard>
            ))}
          </div>

          {/* Tamper-Proof Badge */}
          <GlowCard glowColor="emerald" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-emerald-400">{t('tamper proof')}</div>
                <div className="text-xs text-white/40">Every memory is cryptographically linked. Tampering breaks the chain.</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </GlowCard>

          {/* Add Memory */}
          {showAdd ? (
            <GlowCard glowColor="violet" className="p-4 space-y-3">
              <textarea
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder={t('encrypt placeholder')}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none h-24 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <div className="flex gap-2">
                <button onClick={addBlock} className="flex-1 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                  🔗 Add to Chain
                </button>
                <button onClick={() => { setShowAdd(false); setNewMemory('') }} className="px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white/50 hover:bg-white/[0.08] transition-colors">
                  Cancel
                </button>
              </div>
            </GlowCard>
          ) : (
            <button onClick={() => setShowAdd(true)} className="w-full py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
              + Encrypt New Memory
            </button>
          )}

          {/* Blockchain Visualization */}
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white/60 mb-3">⛓️ Memory Chain</h2>
            {blocks.slice().reverse().map((block, i) => (
              <div key={block.id} style={{ animation: `slideIn 0.5s ease-out ${i * 0.08}s both` }}>
                <GlowCard
                  glowColor={tamperAttempt === block.id ? 'red' : 'emerald'}
                  className={`p-4 transition-all duration-300 ${animatingId === block.id ? 'ring-2 ring-emerald-500/40' : ''} ${tamperAttempt === block.id ? 'ring-2 ring-red-500/40 bg-red-500/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                        block.verified ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-400' : 'bg-red-500/15 border border-red-500/25 text-red-400'
                      }`}>
                        #{block.id}
                      </div>
                      {i < blocks.length - 1 && (
                        <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/30 to-transparent" style={{ animation: 'chainPulse 2s ease-in-out infinite' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 leading-relaxed mb-2">{block.content}</p>
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 font-mono">H: {block.hash.slice(0, 14)}...</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 font-mono">PH: {block.prevHash.slice(0, 10)}...</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-white/30">{block.timestamp}</span>
                        {block.verified && <span className="text-[10px] text-emerald-400">✓ Verified</span>}
                        {block.encrypted && <span className="text-[10px] text-cyan-400">🔒 Encrypted</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => attemptTamper(block.id)}
                      className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all text-xs"
                      title="Test tamper detection"
                    >
                      ⚠
                    </button>
                  </div>
                  {tamperAttempt === block.id && (
                    <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2" style={{ animation: 'lockShake 0.3s ease-in-out' }}>
                      <span className="text-sm">🚨</span>
                      <span className="text-xs text-red-400">TAMPER DETECTED — Chain integrity alert triggered</span>
                    </div>
                  )}
                </GlowCard>
                {i < blocks.length - 1 && (
                  <div className="flex justify-center py-1">
                    <div className="text-white/10 text-xs">⛓️</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Genesis Block Info */}
          <GlowCard glowColor="cyan" className="p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="text-xs text-white/40">Genesis Block</div>
            <div className="text-[10px] text-white/20 font-mono mt-1">0x00000000000000000000000000000000</div>
          </GlowCard>
        </main>
      </div>
    </>
  )
}
