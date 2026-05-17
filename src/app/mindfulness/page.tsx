'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface CheckIn {
  id: string
  emoji: string
  note: string
  date: string
}

interface GratitudeEntry {
  id: string
  items: string[]
  date: string
}

const LS_CHECKINS = 'cc_mindfulness_checkins'
const LS_GRATITUDE = 'cc_mindfulness_gratitude'

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback }
}
function saveJSON(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data))
}

const FEELINGS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '🥰', label: 'Grateful' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😔', label: 'Down' },
]

export default function Mindfulness() {
  const t = useT();
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<'checkin' | 'breathe' | 'gratitude' | 'meditate'>('checkin')

  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [selectedFeeling, setSelectedFeeling] = useState('')
  const [feelingNote, setFeelingNote] = useState('')

  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle')
  const [breathTimer, setBreathTimer] = useState(0)
  const [breathCycles, setBreathCycles] = useState(0)
  const breathInterval = useRef<NodeJS.Timeout | null>(null)

  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([])
  const [gratitudeItems, setGratitudeItems] = useState(['', '', ''])

  const [meditating, setMeditating] = useState(false)
  const [meditationScript, setMeditationScript] = useState('')
  const [meditationLoading, setMeditationLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setCheckins(loadJSON(LS_CHECKINS, []))
      setGratitudeEntries(loadJSON(LS_GRATITUDE, []))
    }
    init()
  }, [])

  const startBreathing = useCallback(() => {
    setBreathPhase('inhale')
    setBreathTimer(4)
    setBreathCycles(0)
    if (breathInterval.current) clearInterval(breathInterval.current)
    breathInterval.current = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          setBreathPhase(current => {
            if (current === 'inhale') { setBreathTimer(7); return 'hold' }
            else if (current === 'hold') { setBreathTimer(8); return 'exhale' }
            else { setBreathCycles(c => c + 1); setBreathTimer(4); return 'inhale' }
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stopBreathing = useCallback(() => {
    if (breathInterval.current) clearInterval(breathInterval.current)
    setBreathPhase('idle')
    setBreathTimer(0)
  }, [])

  useEffect(() => {
    return () => { if (breathInterval.current) clearInterval(breathInterval.current) }
  }, [])

  const submitCheckIn = () => {
    if (!selectedFeeling) return
    const entry: CheckIn = {
      id: crypto.randomUUID(),
      emoji: selectedFeeling,
      note: feelingNote.trim(),
      date: new Date().toISOString(),
    }
    const updated = [entry, ...checkins]
    setCheckins(updated)
    saveJSON(LS_CHECKINS, updated)
    setSelectedFeeling('')
    setFeelingNote('')
  }

  const submitGratitude = () => {
    const filled = gratitudeItems.filter(i => i.trim())
    if (filled.length === 0) return
    const entry: GratitudeEntry = {
      id: crypto.randomUUID(),
      items: filled,
      date: new Date().toISOString(),
    }
    const updated = [entry, ...gratitudeEntries]
    setGratitudeEntries(updated)
    saveJSON(LS_GRATITUDE, updated)
    setGratitudeItems(['', '', ''])
  }

  const generateMeditation = async () => {
    setMeditationLoading(true)
    try {
      const recentMood = checkins.length > 0 ? checkins[0].emoji : 'neutral'
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a short 2-minute guided meditation script. The user is currently feeling ${recentMood}. Make it calming, specific, and easy to follow. Include breathing cues. Keep it under 200 words.`,
        }),
      })
      const data = await res.json()
      setMeditationScript(data.reply || data.message || 'Close your eyes. Breathe deeply. Let go of tension with each exhale...')
    } catch {
      setMeditationScript('Close your eyes. Take a deep breath in... hold... and slowly exhale. Notice the weight of your body. Let each breath bring you deeper into calm. You are safe. You are present. You are enough.')
    }
    setMeditationLoading(false)
    setMeditating(true)
  }

  const todayCheckIn = checkins.find(c => c.date.startsWith(new Date().toISOString().split('T')[0]))

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-emerald-600/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-cyan-600/[0.02] blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="text-xl">🧘</span>
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur-md" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">{t('mindfulness')}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: checkins.length, label: t('session'), color: 'violet', icon: '💭' },
            { value: breathCycles, label: t('breathing'), color: 'fuchsia', icon: '🌬️' },
            { value: gratitudeEntries.length, label: 'Gratitude', color: 'cyan', icon: '🙏' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] p-4 bg-white/[0.02] backdrop-blur-sm text-center shadow-lg shadow-black/10 hover:bg-white/[0.04] transition-all duration-300 group">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl font-black bg-gradient-to-b from-${stat.color}-400 to-${stat.color}-600 bg-clip-text text-transparent`}>{stat.value}</div>
              <div className="text-white/30 text-[10px] uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {([
            { id: 'checkin' as const, icon: '💭', label: 'Check-in' },
            { id: 'breathe' as const, icon: '🌬️', label: 'Breathe' },
            { id: 'gratitude' as const, icon: '🙏', label: 'Gratitude' },
            { id: 'meditate' as const, icon: '🧘', label: 'Meditate' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                tab === t.id
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:text-white/60'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Check-in Tab */}
        {tab === 'checkin' && (
          <div className="space-y-5">
            {todayCheckIn ? (
              <div className="rounded-2xl border border-emerald-500/20 p-6 bg-emerald-500/[0.03] backdrop-blur-sm text-center shadow-lg shadow-emerald-500/5">
                <div className="relative inline-block mb-3">
                  <div className="text-5xl">{todayCheckIn.emoji}</div>
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl scale-150" />
                </div>
                <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider">You checked in today!</p>
                {todayCheckIn.note && <p className="text-white/40 text-sm mt-2">{todayCheckIn.note}</p>}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] p-6 bg-white/[0.02] backdrop-blur-sm shadow-lg shadow-black/10">
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-1">How are you feeling?</h3>
                <p className="text-white/30 text-xs mb-5 uppercase tracking-wider">Select the emoji that matches your mood</p>
                <div className="grid grid-cols-5 gap-3 mb-5">
                  {FEELINGS.map(f => (
                    <button
                      key={f.emoji}
                      onClick={() => setSelectedFeeling(f.emoji)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
                        selectedFeeling === f.emoji
                          ? 'bg-violet-500/20 border-2 border-violet-500/40 shadow-lg shadow-violet-500/20 scale-105'
                          : 'border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                      }`}
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span className="text-[10px] text-white/30">{f.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={feelingNote}
                  onChange={e => setFeelingNote(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 resize-none text-white placeholder:text-white/20 text-sm backdrop-blur-sm mb-4"
                  rows={2}
                  placeholder="Any notes about how you feel? (optional)"
                />
                <button
                  onClick={submitCheckIn}
                  disabled={!selectedFeeling}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-30 shadow-lg shadow-violet-500/20"
                >
                  Check In
                </button>
              </div>
            )}

            {checkins.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 mb-3 uppercase tracking-wider">Recent Check-ins</h3>
                <div className="space-y-2">
                  {checkins.slice(0, 7).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300" style={{ animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1">
                        {c.note && <p className="text-white/50 text-sm">{c.note}</p>}
                        <p className="text-white/20 text-[10px] uppercase tracking-wider">{new Date(c.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Breathing Tab */}
        {tab === 'breathe' && (
          <div className="flex flex-col items-center">
            <div className="rounded-2xl border border-white/[0.08] p-8 bg-white/[0.02] backdrop-blur-sm w-full text-center mb-6 shadow-lg shadow-black/10">
              <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">{t('meditation')}</h3>
              <p className="text-white/30 text-xs mb-8 uppercase tracking-wider">{t('calm')}</p>

              {/* Animated Circle */}
              <div className="relative w-52 h-52 mx-auto mb-8">
                {/* Outer glow ring */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-1000 opacity-50"
                  style={{
                    background: breathPhase === 'inhale'
                      ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)'
                      : breathPhase === 'hold'
                        ? 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)'
                        : breathPhase === 'exhale'
                          ? 'radial-gradient(circle, rgba(192,132,252,0.08) 0%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                    transform: breathPhase === 'inhale' ? 'scale(1.6)' : breathPhase === 'hold' ? 'scale(1.6)' : breathPhase === 'exhale' ? 'scale(0.6)' : 'scale(1)',
                  }}
                />
                {/* Main circle */}
                <div
                  className="absolute inset-4 rounded-full transition-all duration-1000 backdrop-blur-sm"
                  style={{
                    background: breathPhase === 'inhale'
                      ? 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.05) 70%)'
                      : breathPhase === 'hold'
                        ? 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(168,85,247,0.08) 70%)'
                        : breathPhase === 'exhale'
                          ? 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, rgba(192,132,252,0.02) 70%)'
                          : 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                    transform: breathPhase === 'inhale' ? 'scale(1.3)' : breathPhase === 'hold' ? 'scale(1.3)' : breathPhase === 'exhale' ? 'scale(0.7)' : 'scale(1)',
                    boxShadow: breathPhase !== 'idle' ? '0 0 60px rgba(139,92,246,0.15), inset 0 0 60px rgba(139,92,246,0.05)' : 'none',
                    border: breathPhase !== 'idle' ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black bg-gradient-to-b from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      {breathPhase === 'idle' ? '🫁' : breathTimer}
                    </div>
                    <div className="text-sm text-white/40 mt-2 capitalize font-medium">
                      {breathPhase === 'idle' ? 'Ready' : breathPhase}
                    </div>
                  </div>
                </div>
              </div>

              {breathCycles > 0 && (
                <p className="text-white/30 text-sm mb-5 font-medium">{breathCycles} cycle{breathCycles !== 1 ? 's' : ''} completed</p>
              )}

              <button
                onClick={breathPhase === 'idle' ? startBreathing : stopBreathing}
                className={`px-10 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 tap-feedback ${
                  breathPhase === 'idle'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90 shadow-lg shadow-violet-500/20'
                    : 'border border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                }`}
              >
                {breathPhase === 'idle' ? 'Start Breathing' : 'Stop'}
              </button>
            </div>

            <div className="rounded-2xl border border-white/[0.08] p-5 bg-white/[0.02] backdrop-blur-sm w-full shadow-lg shadow-black/10">
              <h4 className="text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">Benefits</h4>
              <ul className="text-white/30 text-xs space-y-2">
                {['Reduces anxiety and stress', 'Helps with falling asleep', 'Lowers blood pressure', 'Improves focus and clarity'].map((b, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Gratitude Tab */}
        {tab === 'gratitude' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/[0.08] p-6 bg-white/[0.02] backdrop-blur-sm shadow-lg shadow-black/10">
              <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-1">Gratitude Journal</h3>
              <p className="text-white/30 text-xs mb-5 uppercase tracking-wider">What are 3 things you&apos;re grateful for today?</p>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                  <input
                    type="text"
                    value={gratitudeItems[i]}
                    onChange={e => {
                      const items = [...gratitudeItems]
                      items[i] = e.target.value
                      setGratitudeItems(items)
                    }}
                    className="flex-1 px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
                    placeholder={`I'm grateful for...`}
                  />
                </div>
              ))}
              <button
                onClick={submitGratitude}
                disabled={gratitudeItems.every(i => !i.trim())}
                className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-30 shadow-lg shadow-violet-500/20 mt-2"
              >
                Save Gratitude
              </button>
            </div>

            {gratitudeEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 mb-3 uppercase tracking-wider">Past Entries</h3>
                <div className="space-y-3">
                  {gratitudeEntries.slice(0, 10).map((entry, i) => (
                    <div key={entry.id} className="rounded-2xl border border-white/[0.06] p-5 bg-white/[0.02] backdrop-blur-sm shadow-lg shadow-black/10" style={{ animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
                      <p className="text-[10px] text-white/20 mb-3 uppercase tracking-wider">{new Date(entry.date).toLocaleDateString()}</p>
                      <ul className="space-y-2">
                        {entry.items.map((item, j) => (
                          <li key={j} className="text-white/50 text-sm flex items-start gap-3">
                            <span className="text-violet-400 mt-0.5">🙏</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meditate Tab */}
        {tab === 'meditate' && (
          <div className="space-y-5">
            {!meditating ? (
              <div className="rounded-2xl border border-white/[0.08] p-8 bg-white/[0.02] backdrop-blur-sm text-center shadow-lg shadow-black/10">
                <div className="relative inline-block mb-5">
                  <div className="text-6xl">🧘</div>
                  <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl scale-150" />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">AI Meditation Guide</h3>
                <p className="text-white/30 text-sm mb-8">Get a personalized meditation script based on your current mood</p>
                <button
                  onClick={generateMeditation}
                  disabled={meditationLoading}
                  className="px-10 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-50 tap-feedback shadow-lg shadow-violet-500/20"
                >
                  {meditationLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : '✨ Generate Meditation'}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-violet-500/20 p-8 bg-violet-500/[0.03] backdrop-blur-sm shadow-lg shadow-violet-500/5">
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-3">
                    <div className="text-4xl">🧘</div>
                    <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl scale-150" />
                  </div>
                  <h3 className="text-lg font-bold text-violet-400 uppercase tracking-wider">Your Meditation</h3>
                </div>
                <div className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap mb-6 backdrop-blur-sm">
                  {meditationScript}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMeditating(false); setMeditationScript('') }}
                    className="flex-1 px-4 py-3.5 border border-white/[0.08] rounded-xl text-sm text-white/40 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    New Script
                  </button>
                  <button
                    onClick={generateMeditation}
                    disabled={meditationLoading}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-violet-500/20"
                  >
                    {meditationLoading ? '🔄' : '🔄 Regenerate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
