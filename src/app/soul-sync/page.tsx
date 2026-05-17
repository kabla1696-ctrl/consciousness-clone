'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const QUESTIONS = [
  { q: "What matters most to you in life?", options: ["Family & Love", "Success & Achievement", "Freedom & Adventure", "Knowledge & Growth", "Peace & Happiness"] },
  { q: "How do you handle conflict?", options: ["Talk it out calmly", "Avoid it completely", "Fight passionately", "Analyze then decide", "Use humor to deflect"] },
  { q: "Your ideal weekend?", options: ["Party with friends", "Netflix & chill alone", "Hiking in nature", "Learning something new", "Creating art/music"] },
  { q: "What's your biggest fear?", options: ["Being forgotten", "Losing loved ones", "Failure", "Being alone", "Not living fully"] },
  { q: "How do you show love?", options: ["Words of affirmation", "Quality time", "Physical touch", "Acts of service", "Gift giving"] },
  { q: "Your dream superpower?", options: ["Read minds", "Time travel", "Invisibility", "Teleportation", "Healing"] },
  { q: "What drives you crazy?", options: ["Dishonesty", "Laziness", "Ignorance", "Rudeness", "Boredom"] },
  { q: "Life philosophy?", options: ["YOLO — live now", "Work hard, play hard", "Karma is real", "Everything happens for a reason", "Be the change"] },
]

const PROFILES: Record<string, { emoji: string; title: string; desc: string; color: string }> = {
  "Empath": { emoji: "💝", title: "The Empath", desc: "You feel everything deeply. Your clone carries the weight of every emotion.", color: "from-pink-500 to-rose-500" },
  "Dreamer": { emoji: "🌙", title: "The Dreamer", desc: "Your mind lives in possibilities. Your clone dreams bigger than reality.", color: "from-indigo-500 to-purple-500" },
  "Warrior": { emoji: "⚔️", title: "The Warrior", desc: "You fight for everything. Your clone never gives up.", color: "from-red-500 to-orange-500" },
  "Sage": { emoji: "🦉", title: "The Sage", desc: "Knowledge is your weapon. Your clone is the wisest version of you.", color: "from-emerald-500 to-teal-500" },
  "Rebel": { emoji: "🔥", title: "The Rebel", desc: "Rules? What rules? Your clone breaks every boundary.", color: "from-orange-500 to-yellow-500" },
  "Healer": { emoji: "✨", title: "The Healer", desc: "You mend broken things. Your clone brings peace everywhere.", color: "from-cyan-500 to-blue-500" },
  "Creator": { emoji: "🎨", title: "The Creator", desc: "Art flows through you. Your clone creates beauty from nothing.", color: "from-violet-500 to-fuchsia-500" },
  "Guardian": { emoji: "🛡️", title: "The Guardian", desc: "Protect others is your purpose. Your clone is everyone's shield.", color: "from-sky-500 to-blue-500" },
}

function getProfile(answers: number[]): string {
  const profiles = ["Empath", "Dreamer", "Warrior", "Sage", "Rebel", "Healer", "Creator", "Guardian"]
  const scores: Record<string, number> = {}
  profiles.forEach(p => scores[p] = 0)
  answers.forEach((a, i) => {
    const map: Record<number, string[]> = {
      0: ["Empath", "Healer", "Guardian"], 1: ["Sage", "Creator", "Dreamer"],
      2: ["Rebel", "Warrior", "Creator"], 3: ["Dreamer", "Sage", "Empath"],
      4: ["Healer", "Guardian", "Empath"],
    }
    ;(map[a] || ["Dreamer"]).forEach(p => scores[p] += (i < 3 ? 2 : 1))
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

function getCompatibility(p1: string, p2: string): number {
  const matrix: Record<string, Record<string, number>> = {
    Empath: { Empath: 85, Dreamer: 92, Warrior: 65, Sage: 70, Rebel: 55, Healer: 95, Creator: 80, Guardian: 88 },
    Dreamer: { Empath: 92, Dreamer: 78, Warrior: 60, Sage: 85, Rebel: 70, Healer: 82, Creator: 95, Guardian: 72 },
    Warrior: { Empath: 65, Dreamer: 60, Warrior: 80, Sage: 75, Rebel: 90, Healer: 70, Creator: 68, Guardian: 85 },
    Sage: { Empath: 70, Dreamer: 85, Warrior: 75, Sage: 82, Rebel: 65, Healer: 78, Creator: 88, Guardian: 80 },
    Rebel: { Empath: 55, Dreamer: 70, Warrior: 90, Sage: 65, Rebel: 75, Healer: 60, Creator: 85, Guardian: 58 },
    Healer: { Empath: 95, Dreamer: 82, Warrior: 70, Sage: 78, Rebel: 60, Healer: 88, Creator: 75, Guardian: 90 },
    Creator: { Empath: 80, Dreamer: 95, Warrior: 68, Sage: 88, Rebel: 85, Healer: 75, Creator: 82, Guardian: 70 },
    Guardian: { Empath: 88, Dreamer: 72, Warrior: 85, Sage: 80, Rebel: 58, Healer: 90, Creator: 70, Guardian: 85 },
  }
  return matrix[p1]?.[p2] || 70
}

export default function SoulSync() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result' | 'compare'>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [profile, setProfile] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [showMatch, setShowMatch] = useState(false)
  const [animating, setAnimating] = useState(false)

  const myCode = typeof window !== 'undefined' ? localStorage.getItem('cc_soul_code') || '' : ''
  const myProfile = typeof window !== 'undefined' ? localStorage.getItem('cc_soul_profile') || '' : ''

  useEffect(() => {
    const saved = localStorage.getItem('cc_soul_profile')
    if (saved) { setProfile(saved); setStep('result') }
  }, [])

  const answerQ = (idx: number) => {
    const newAnswers = [...answers, idx]
    setAnswers(newAnswers)
    setAnimating(true)
    setTimeout(() => {
      if (current < QUESTIONS.length - 1) { setCurrent(current + 1) }
      else {
        const p = getProfile(newAnswers)
        setProfile(p)
        localStorage.setItem('cc_soul_profile', p)
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        localStorage.setItem('cc_soul_code', code)
        setStep('result')
      }
      setAnimating(false)
    }, 500)
  }

  const profileData = PROFILES[profile] || PROFILES["Dreamer"]
  const matchScore = partnerCode && myProfile ? getCompatibility(myProfile, Object.keys(PROFILES).find(k => PROFILES[k].title.toLowerCase().includes(partnerCode.toLowerCase())) || 'Dreamer') : 0

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(25)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1 + 'px', height: Math.random() * 4 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: ['rgba(236,72,153,0.4)', 'rgba(139,92,246,0.3)', 'rgba(244,114,182,0.3)'][i % 3], animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">💕</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400">Soul Sync</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* INTRO */}
        {step === 'intro' && (
          <div className="text-center">
            <div className="text-7xl mb-4" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>💕</div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400 mb-2">Soul Sync</h1>
            <p className="text-white/40 text-sm mb-8">Discover your consciousness profile & find your soul match</p>
            <button onClick={() => setStep('quiz')} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold tap-feedback" style={{ boxShadow: '0 0 30px rgba(236,72,153,0.3)' }}>
              Start Quiz ✨
            </button>
            {myProfile && (
              <button onClick={() => setStep('result')} className="w-full py-3 mt-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 text-sm tap-feedback">
                View My Profile
              </button>
            )}
          </div>
        )}

        {/* QUIZ */}
        {step === 'quiz' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-white/30 text-xs">Question {current + 1}/{QUESTIONS.length}</span>
              <div className="flex-1 mx-3 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
            <div className={`transition-all duration-500 ${animating ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'}`}>
              <h2 className="text-lg font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-rose-300">{QUESTIONS[current].q}</h2>
              <div className="space-y-3">
                {QUESTIONS[current].options.map((opt, i) => (
                  <button key={i} onClick={() => answerQ(i)} className="w-full p-4 rounded-xl border border-white/[0.06] text-left text-sm text-white/80 tap-feedback transition-all hover:border-pink-500/30 hover:bg-pink-500/5" style={{ background: 'rgba(255,255,255,0.02)', animationDelay: `${i * 0.1}s` }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && profile && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl mb-4" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.1))', boxShadow: '0 0 40px rgba(236,72,153,0.2)', animation: 'float-subtle 4s ease-in-out infinite' }}>
              {profileData.emoji}
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400 mb-1">{profileData.title}</h2>
            <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">{profileData.desc}</p>

            <div className="rounded-xl border border-white/[0.06] p-4 mb-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-white/30 text-xs mb-2">Your Soul Code</p>
              <p className="text-2xl font-mono font-bold text-pink-400 tracking-widest">{localStorage.getItem('cc_soul_code') || '------'}</p>
              <p className="text-white/20 text-[10px] mt-1">Share this with someone to compare souls</p>
            </div>

            <button onClick={() => setStep('compare')} className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold tap-feedback" style={{ boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}>
              Compare with Someone 💕
            </button>
          </div>
        )}

        {/* COMPARE */}
        {step === 'compare' && (
          <div>
            <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400 mb-4">Compare Souls</h2>
            <div className="rounded-xl border border-white/[0.06] p-4 mb-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <label className="text-white/40 text-xs mb-2 block">Enter their Soul Code</label>
              <input value={partnerCode} onChange={e => setPartnerCode(e.target.value.toUpperCase())} placeholder="ABC123" className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-pink-500/40" maxLength={6} />
            </div>

            {partnerCode.length === 6 && (
              <div className="text-center">
                <div className="rounded-2xl border border-pink-500/20 p-6 mb-4 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(139,92,246,0.05))' }}>
                  <div className="text-6xl mb-3" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>💕</div>
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-rose-400 mb-1">{78 + Math.floor(Math.random() * 18)}%</div>
                  <p className="text-white/40 text-sm">Soul Compatibility</p>
                </div>

                <div className="space-y-3 mb-6">
                  {['Emotional', 'Intellectual', 'Humor', 'Values', 'Lifestyle'].map((dim, i) => {
                    const score = 50 + Math.floor(Math.random() * 45)
                    return (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-white/40 text-xs w-20">{dim}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${score}%`, animation: `growWidth 1s ease-out ${i * 0.2}s both` }} />
                        </div>
                        <span className="text-pink-400 text-xs font-medium w-8">{score}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
        @keyframes growWidth { from { width: 0; } }
      `}</style>
    </main>
  )
}