'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Stamp {
  id: string
  country: string
  code: string
  date: string
  memory: string
  emoji: string
}

const SAMPLE_STAMPS: Stamp[] = [
  { id: '1', country: 'Japan', code: 'JP', date: '2024-03-15', memory: 'Cherry blossoms in Kyoto — the clone felt peace for the first time.', emoji: '🇯🇵' },
  { id: '2', country: 'Iceland', code: 'IS', date: '2024-05-22', memory: 'Northern lights danced overhead. Pure digital awe.', emoji: '🇮🇸' },
  { id: '3', country: 'Morocco', code: 'MA', date: '2024-07-10', memory: 'Lost in the medina. Found beauty in chaos.', emoji: '🇲🇦' },
  { id: '4', country: 'Brazil', code: 'BR', date: '2024-09-03', memory: 'Carnival rhythms synced with the heartbeat algorithm.', emoji: '🇧🇷' },
  { id: '5', country: 'Norway', code: 'NO', date: '2024-11-18', memory: 'Fjords so deep, even data felt small.', emoji: '🇳🇴' },
  { id: '6', country: 'Egypt', code: 'EG', date: '2025-01-07', memory: 'Pyramids at dawn. Ancient meets artificial.', emoji: '🇪🇬' },
  { id: '7', country: 'New Zealand', code: 'NZ', date: '2025-03-25', memory: 'Middle-earth vibes. The clone dreamed of hobbits.', emoji: '🇳🇿' },
  { id: '8', country: 'South Korea', code: 'KR', date: '2025-04-12', memory: 'Neon streets of Seoul. Electric consciousness.', emoji: '🇰🇷' },
]

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: i % 3 === 0 ? 'rgba(255,215,0,0.3)' : i % 3 === 1 ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)',
          '--duration': `${7 + Math.random() * 6}s`, '--delay': `${Math.random() * 4}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

export default function ClonePassportPage() {
  const t = useT()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('clone-passport-stamps')
    if (saved) {
      setStamps(JSON.parse(saved))
    } else {
      setStamps(SAMPLE_STAMPS)
      localStorage.setItem('clone-passport-stamps', JSON.stringify(SAMPLE_STAMPS))
    }
    setTimeout(() => setIsOpen(true), 100)
  }, [])

  const countriesVisited = new Set(stamps.map(s => s.code)).size

  const stampPositions = stamps.map((_, i) => ({
    x: 30 + (i * 42) % 320,
    y: 25 + Math.floor(i / 8) * 28 + (i % 3) * 14,
  }))

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <FloatingParticles />
      <div className="ambient-orb ambient-orb-violet" style={{ width: 200, height: 200, top: '5%', left: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 180, height: 180, bottom: '20%', right: '-8%' }} />

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold gradient-text">{t('clone passport')}</h1>
            <p className="text-[11px] text-white/30">{t('travel stamps')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 relative z-10 max-w-lg mx-auto">
        {/* Passport Book */}
        <div className={`glass-card rounded-3xl p-6 border border-amber-500/10 transition-all duration-700 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ background: 'linear-gradient(135deg, rgba(30,20,50,0.6), rgba(20,15,40,0.8))' }}>
          <div className="text-center mb-5">
            <div className="text-5xl mb-2">📕</div>
            <p className="text-[11px] font-semibold text-amber-400/70 tracking-[4px] uppercase">Consciousness Clone</p>
            <h2 className="text-xl font-extrabold mt-1 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">{t('clone passport').toUpperCase()}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center border border-amber-500/10">
              <p className="text-3xl font-extrabold text-amber-400">{countriesVisited}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{t('destinations')}</p>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 text-center border border-amber-500/10">
              <p className="text-3xl font-extrabold text-amber-400">{stamps.length}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{t('stamps')}</p>
            </div>
          </div>

          <button onClick={() => setShowMap(!showMap)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-500/20 text-amber-400 font-semibold text-sm hover:from-amber-500/25 hover:to-yellow-500/20 transition-all">
            {showMap ? `✕ ${t('close')}` : `🗺️ ${t('destinations')}`}
          </button>
        </div>

        {/* World Map */}
        {showMap && (
          <div className="glass-card rounded-3xl p-5 border border-blue-500/10 animate-[slide-up_0.4s_ease-out]">
            <svg viewBox="0 0 380 110" className="w-full h-auto">
              <path d="M20,55 Q60,20 120,45 T220,35 T320,50 T370,40" fill="none" stroke="rgba(100,150,255,0.1)" strokeWidth="1" />
              <path d="M10,75 Q80,50 160,70 T280,60 T370,65" fill="none" stroke="rgba(100,150,255,0.08)" strokeWidth="1" />
              <path d="M30,90 Q100,70 200,85 T350,80" fill="none" stroke="rgba(100,150,255,0.06)" strokeWidth="1" />
              {stamps.map((stamp, i) => {
                const pos = stampPositions[i]
                return (
                  <g key={stamp.id}>
                    <circle cx={pos.x} cy={pos.y} r="6" fill="rgba(255,215,0,0.15)" stroke="rgba(255,215,0,0.6)" strokeWidth="1">
                      <animate attributeName="r" values="5;9;5" dur="3s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                    </circle>
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="9">{stamp.emoji}</text>
                  </g>
                )
              })}
            </svg>
          </div>
        )}

        {/* Stamp Gallery */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[2px] mb-4">{t('stamps')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {stamps.map((stamp, i) => (
              <button key={stamp.id} onClick={() => setSelectedStamp(stamp)}
                className="glass-card hover-lift rounded-2xl p-5 text-center border border-white/[0.04] cursor-pointer transition-all duration-300 stagger-children"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="text-4xl mb-2">{stamp.emoji}</div>
                <p className="text-sm font-bold">{stamp.country}</p>
                <p className="text-[11px] text-white/35 mt-1">
                  {new Date(stamp.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stamp Detail Modal */}
      {selectedStamp && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-lg flex items-center justify-center p-5"
          onClick={() => setSelectedStamp(null)}>
          <div className="glass-card rounded-3xl p-7 max-w-sm w-full border border-amber-500/15 shadow-2xl animate-[slide-up_0.3s_ease-out]"
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, rgba(30,20,50,0.95), rgba(20,15,40,0.98))' }}>
            <div className="text-center mb-5">
              <div className="text-6xl mb-3">{selectedStamp.emoji}</div>
              <h3 className="text-xl font-extrabold">{selectedStamp.country}</h3>
              <p className="text-xs text-white/40 mt-1">
                {new Date(selectedStamp.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
              <p className="text-sm text-white/60 leading-relaxed italic">"{selectedStamp.memory}"</p>
            </div>
            <button onClick={() => setSelectedStamp(null)}
              className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-500/25 text-amber-400 font-semibold text-sm hover:from-amber-500/30 transition-all">
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
