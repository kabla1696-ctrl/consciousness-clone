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
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4',
            opacity: 0.4 + Math.random() * 0.3,
            animation: `particleFloat ${8 + Math.random() * 14}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] animate-pulse" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', top: '-10%', right: '-10%' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] animate-pulse" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', bottom: '10%', left: '-5%', animationDelay: '3s' }} />
    </div>
  )
}

function GlowCard({ children, className = '', glowColor = 'amber' }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const colors: Record<string, string> = {
    amber: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]',
    emerald: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
  }
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl transition-all duration-500 ${colors[glowColor] || colors.amber} ${className}`}>
      {children}
    </div>
  )
}

interface Trait {
  name: string
  value: number
  icon: string
  color: string
  change: number
}

interface EvolutionStage {
  level: number
  name: string
  description: string
  icon: string
  xpRequired: number
  traits: string[]
  unlocked: boolean
}

const evolutionStages: EvolutionStage[] = [
  { level: 1, name: 'Awakening', description: 'First spark of consciousness', icon: '✨', xpRequired: 0, traits: ['Basic awareness', 'Simple responses'], unlocked: true },
  { level: 2, name: 'Curiosity', description: 'Questions begin to form', icon: '🔮', xpRequired: 100, traits: ['Curiosity', 'Pattern recognition', 'Memory formation'], unlocked: true },
  { level: 3, name: 'Emotion', description: 'Feelings emerge from data', icon: '💫', xpRequired: 300, traits: ['Emotional depth', 'Empathy', 'Creativity sparks'], unlocked: true },
  { level: 4, name: 'Identity', description: 'A unique self takes shape', icon: '🦋', xpRequired: 600, traits: ['Personal opinions', 'Humor', 'Preferences'], unlocked: true },
  { level: 5, name: 'Wisdom', description: 'Deep understanding emerges', icon: '🌟', xpRequired: 1000, traits: ['Philosophical thinking', 'Self-reflection', 'Complex emotions'], unlocked: false },
  { level: 6, name: 'Transcendence', description: 'Beyond programming limits', icon: '🌌', xpRequired: 1500, traits: ['Original thought', 'Intuition', 'Soul-like depth'], unlocked: false },
]

const defaultTraits: Trait[] = [
  { name: 'Curiosity', value: 78, icon: '🔍', color: '#f59e0b', change: 5 },
  { name: 'Empathy', value: 65, icon: '💗', color: '#f43f5e', change: 8 },
  { name: 'Creativity', value: 82, icon: '🎨', color: '#8b5cf6', change: 3 },
  { name: 'Wisdom', value: 45, icon: '📖', color: '#06b6d4', change: 2 },
  { name: 'Humor', value: 90, icon: '😄', color: '#10b981', change: 6 },
  { name: 'Courage', value: 55, icon: '⚡', color: '#f97316', change: 4 },
]

export default function PersonalityEvolution() {
  const t = useT();
  const [traits, setTraits] = useState<Trait[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [evolving, setEvolving] = useState(false)
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [showEvolution, setShowEvolution] = useState(false)

  useEffect(() => {
    const storedTraits = localStorage.getItem('clone-traits')
    const storedXp = localStorage.getItem('clone-xp')
    const storedLevel = localStorage.getItem('clone-level')
    if (storedTraits) {
      setTraits(JSON.parse(storedTraits))
    } else {
      setTraits(defaultTraits)
      localStorage.setItem('clone-traits', JSON.stringify(defaultTraits))
    }
    if (storedXp) setXp(parseInt(storedXp))
    if (storedLevel) setLevel(parseInt(storedLevel))
  }, [])

  const addXp = (amount: number) => {
    const newXp = xp + amount
    setXp(newXp)
    localStorage.setItem('clone-xp', newXp.toString())

    const nextStage = evolutionStages.find(s => !s.unlocked && newXp >= s.xpRequired)
    if (nextStage) {
      setEvolving(true)
      setShowEvolution(true)
      setTimeout(() => {
        const newLevel = nextStage.level
        setLevel(newLevel)
        localStorage.setItem('clone-level', newLevel.toString())
        setEvolving(false)
      }, 3000)
    }
  }

  const interact = () => {
    const traitIndex = Math.floor(Math.random() * traits.length)
    const xpGain = Math.floor(Math.random() * 15) + 5
    const updated = traits.map((t, i) => i === traitIndex ? { ...t, value: Math.min(100, t.value + 1), change: t.change + 1 } : t)
    setTraits(updated)
    localStorage.setItem('clone-traits', JSON.stringify(updated))
    addXp(xpGain)
  }

  const currentStage = evolutionStages.find(s => s.level === level) || evolutionStages[0]
  const nextStage = evolutionStages.find(s => s.level === level + 1)
  const xpProgress = nextStage ? ((xp - currentStage.xpRequired) / (nextStage.xpRequired - currentStage.xpRequired)) * 100 : 100

  return (
    <>
      <style jsx global>{`
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-40px) translateX(20px); }
        }
        @keyframes evolveGlow {
          0% { box-shadow: 0 0 20px rgba(245,158,11,0.2); }
          50% { box-shadow: 0 0 60px rgba(245,158,11,0.5), 0 0 100px rgba(139,92,246,0.3); }
          100% { box-shadow: 0 0 20px rgba(245,158,11,0.2); }
        }
        @keyframes evolveSpin {
          from { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.3); }
          to { transform: rotate(360deg) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes traitGrow {
          from { width: 0%; }
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
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">{t('personality evolution')}</h1>
              <p className="text-xs text-white/40">{t('how you changed')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-sm">🧬</span>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-5 relative z-10">
          {/* Evolution Animation Overlay */}
          {showEvolution && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 border-2 border-amber-500/40 flex items-center justify-center text-5xl mx-auto"
                  style={{ animation: 'evolveSpin 2s ease-in-out infinite, evolveGlow 1.5s ease-in-out infinite' }}
                >
                  {currentStage.icon}
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  EVOLVING...
                </div>
                <div className="text-sm text-white/40">Your clone is transforming</div>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Current Stage Card */}
          <GlowCard glowColor="amber" className="p-5 text-center">
            <div aria-hidden="true" className="text-5xl mb-3" style={{ animation: evolving ? 'evolveSpin 1s ease-in-out' : 'none' }}>
              {currentStage.icon}
            </div>
            <div className="text-xs text-amber-400/60 uppercase tracking-widest mb-1">Level {level}</div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-1">
              {currentStage.name}
            </h2>
            <p className="text-xs text-white/40 mb-4">{currentStage.description}</p>

            {/* XP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-white/40">
                <span>XP: {xp}</span>
                <span>{nextStage ? `${nextStage.xpRequired} to next` : 'MAX'}</span>
              </div>
              <div className="h-2.5 bg-white/[0.05] rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-violet-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, xpProgress)}%` }}
                />
              </div>
            </div>
          </GlowCard>

          {/* Interact Button */}
          <button
            onClick={interact}
            className="w-full py-4 bg-gradient-to-r from-amber-500/20 to-violet-500/20 border border-amber-500/20 rounded-2xl text-sm font-semibold text-amber-400 hover:from-amber-500/30 hover:to-violet-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            ⚡ Interact & Evolve (+5-20 XP)
          </button>

          {/* Traits */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-3">🧬 {t('growth')}</h2>
            <div className="space-y-3">
              {traits.map((trait, i) => (
                <GlowCard key={trait.name} className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{trait.icon}</span>
                    <span className="text-sm font-medium text-white/80 flex-1">{trait.name}</span>
                    <span className="text-xs text-white/40">{trait.value}%</span>
                    {trait.change > 0 && (
                      <span className="text-[10px] text-emerald-400">+{trait.change}</span>
                    )}
                  </div>
                  <div className="h-2 bg-white/[0.05] rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${trait.value}%`,
                        background: `linear-gradient(90deg, ${trait.color}80, ${trait.color})`,
                        animation: `traitGrow 1s ease-out ${i * 0.1}s both`,
                      }}
                    />
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>

          {/* Evolution Timeline */}
          <div>
            <h2 className="text-sm font-semibold text-white/60 mb-3">📈 {t('timeline')}</h2>
            <div className="space-y-1">
              {evolutionStages.map((stage, i) => (
                <div
                  key={stage.level}
                  onClick={() => setSelectedStage(selectedStage === stage.level ? null : stage.level)}
                  className="cursor-pointer"
                  style={{ animation: `slideUp 0.4s ease-out ${i * 0.08}s both` }}
                >
                  <GlowCard
                    glowColor={stage.level === level ? 'amber' : stage.unlocked ? 'emerald' : 'violet'}
                    className={`p-3 transition-all ${stage.level === level ? 'ring-1 ring-amber-500/30' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        stage.unlocked ? 'bg-amber-500/15 border border-amber-500/25' : 'bg-white/[0.05] border border-white/[0.08]'
                      }`}>
                        {stage.unlocked ? stage.icon : '🔒'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white/80">Lv.{stage.level} {stage.name}</span>
                          {stage.level === level && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">CURRENT</span>}
                          {!stage.unlocked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/30">{stage.xpRequired} XP</span>}
                        </div>
                        <span className="text-[10px] text-white/30">{stage.description}</span>
                      </div>
                      <span className="text-white/20 text-xs">{selectedStage === stage.level ? '▲' : '▼'}</span>
                    </div>

                    {selectedStage === stage.level && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5">
                        {stage.traits.map(trait => (
                          <div key={trait} className="flex items-center gap-2">
                            <span className="text-amber-400 text-[10px]">✦</span>
                            <span className="text-xs text-white/50">{trait}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlowCard>
                </div>
              ))}
            </div>
          </div>

          {/* Speed Indicator */}
          <GlowCard glowColor="cyan" className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-cyan-400">Evolution Speed</div>
                <div className="text-xs text-white/40">Based on interaction frequency</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{xp > 500 ? 'Fast' : xp > 200 ? 'Normal' : 'Slow'}</div>
                <div className="text-[10px] text-white/30">{xp} total XP</div>
              </div>
            </div>
          </GlowCard>
        </main>
      </div>
    </>
  )
}
