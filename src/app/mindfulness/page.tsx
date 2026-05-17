'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  const [user, setUser] = useState<any>(null)
  const [tab, setTab] = useState<'checkin' | 'breathe' | 'gratitude' | 'meditate'>('checkin')

  // Check-in
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [selectedFeeling, setSelectedFeeling] = useState('')
  const [feelingNote, setFeelingNote] = useState('')

  // Breathing
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle')
  const [breathTimer, setBreathTimer] = useState(0)
  const [breathCycles, setBreathCycles] = useState(0)
  const breathInterval = useRef<NodeJS.Timeout | null>(null)

  // Gratitude
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([])
  const [gratitudeItems, setGratitudeItems] = useState(['', '', ''])

  // Meditation
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

  // Breathing exercise logic
  const startBreathing = useCallback(() => {
    setBreathPhase('inhale')
    setBreathTimer(4)
    setBreathCycles(0)

    if (breathInterval.current) clearInterval(breathInterval.current)

    breathInterval.current = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          setBreathPhase(current => {
            if (current === 'inhale') {
              setBreathTimer(7)
              return 'hold'
            } else if (current === 'hold') {
              setBreathTimer(8)
              return 'exhale'
            } else {
              setBreathCycles(c => c + 1)
              setBreathTimer(4)
              return 'inhale'
            }
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
    return () => {
      if (breathInterval.current) clearInterval(breathInterval.current)
    }
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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧘</span>
            <h1 className="text-base font-bold">Mindfulness</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-violet-400">{checkins.length}</div>
            <div className="text-white/30 text-[10px]">Check-ins</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-fuchsia-400">{breathCycles}</div>
            <div className="text-white/30 text-[10px]">Breath Cycles</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-cyan-400">{gratitudeEntries.length}</div>
            <div className="text-white/30 text-[10px]">Gratitude</div>
          </div>
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
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${tab === t.id ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.02]'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Check-in Tab */}
        {tab === 'checkin' && (
          <div className="space-y-4">
            {todayCheckIn ? (
              <div className="rounded-xl border border-violet-500/20 p-5 bg-violet-500/5 text-center">
                <div className="text-4xl mb-2">{todayCheckIn.emoji}</div>
                <p className="text-violet-400 font-semibold text-sm">You checked in today!</p>
                {todayCheckIn.note && <p className="text-white/40 text-sm mt-1">{todayCheckIn.note}</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] p-5 bg-white/[0.02]">
                <h3 className="text-lg font-semibold mb-1">How are you feeling?</h3>
                <p className="text-white/30 text-xs mb-4">Select the emoji that matches your mood</p>
                <div className="grid grid-cols-5 gap-3 mb-4">
                  {FEELINGS.map(f => (
                    <button
                      key={f.emoji}
                      onClick={() => setSelectedFeeling(f.emoji)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${selectedFeeling === f.emoji ? 'bg-violet-500/20 border border-violet-500/40' : 'border border-white/[0.06] hover:bg-white/[0.02]'}`}
                    >
                      <span className="text-2xl">{f.emoji}</span>
                      <span className="text-[10px] text-white/30">{f.label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={feelingNote}
                  onChange={e => setFeelingNote(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20 text-sm mb-3"
                  rows={2}
                  placeholder="Any notes about how you feel? (optional)"
                />
                <button
                  onClick={submitCheckIn}
                  disabled={!selectedFeeling}
                  className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30"
                >
                  Check In
                </button>
              </div>
            )}

            {/* Recent check-ins */}
            {checkins.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 mb-3">Recent Check-ins</h3>
                <div className="space-y-2">
                  {checkins.slice(0, 7).map(c => (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                      <span className="text-2xl">{c.emoji}</span>
                      <div className="flex-1">
                        {c.note && <p className="text-white/50 text-sm">{c.note}</p>}
                        <p className="text-white/20 text-[10px]">{new Date(c.date).toLocaleDateString()}</p>
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
            <div className="rounded-xl border border-white/[0.06] p-6 bg-white/[0.02] w-full text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">4-7-8 Breathing</h3>
              <p className="text-white/30 text-xs mb-6">Inhale 4s • Hold 7s • Exhale 8s</p>

              {/* Animated Circle */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full transition-all duration-1000"
                  style={{
                    background: breathPhase === 'inhale'
                      ? 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.05) 70%)'
                      : breathPhase === 'hold'
                        ? 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(168,85,247,0.1) 70%)'
                        : breathPhase === 'exhale'
                          ? 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, rgba(192,132,252,0.02) 70%)'
                          : 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    transform: breathPhase === 'inhale'
                      ? 'scale(1.3)'
                      : breathPhase === 'hold'
                        ? 'scale(1.3)'
                        : breathPhase === 'exhale'
                          ? 'scale(0.7)'
                          : 'scale(1)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-violet-400">
                      {breathPhase === 'idle' ? '🫁' : breathTimer}
                    </div>
                    <div className="text-sm text-white/40 mt-1 capitalize">
                      {breathPhase === 'idle' ? 'Ready' : breathPhase}
                    </div>
                  </div>
                </div>
              </div>

              {breathCycles > 0 && (
                <p className="text-white/30 text-sm mb-4">{breathCycles} cycle{breathCycles !== 1 ? 's' : ''} completed</p>
              )}

              <button
                onClick={breathPhase === 'idle' ? startBreathing : stopBreathing}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition tap-feedback ${breathPhase === 'idle'
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90'
                  : 'border border-white/[0.06] text-white/40 hover:bg-white/[0.02]'
                }`}
              >
                {breathPhase === 'idle' ? 'Start Breathing' : 'Stop'}
              </button>
            </div>

            <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] w-full">
              <h4 className="text-sm font-semibold text-white/60 mb-2">Benefits</h4>
              <ul className="text-white/30 text-xs space-y-1.5">
                <li>• Reduces anxiety and stress</li>
                <li>• Helps with falling asleep</li>
                <li>• Lowers blood pressure</li>
                <li>• Improves focus and clarity</li>
              </ul>
            </div>
          </div>
        )}

        {/* Gratitude Tab */}
        {tab === 'gratitude' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.06] p-5 bg-white/[0.02]">
              <h3 className="text-lg font-semibold mb-1">Gratitude Journal</h3>
              <p className="text-white/30 text-xs mb-4">What are 3 things you're grateful for today?</p>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 mb-3">
                  <span className="text-violet-400 font-bold text-sm">{i + 1}.</span>
                  <input
                    type="text"
                    value={gratitudeItems[i]}
                    onChange={e => {
                      const items = [...gratitudeItems]
                      items[i] = e.target.value
                      setGratitudeItems(items)
                    }}
                    className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
                    placeholder={`I'm grateful for...`}
                  />
                </div>
              ))}
              <button
                onClick={submitGratitude}
                disabled={gratitudeItems.every(i => !i.trim())}
                className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30"
              >
                Save Gratitude
              </button>
            </div>

            {gratitudeEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 mb-3">Past Entries</h3>
                <div className="space-y-2">
                  {gratitudeEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="rounded-xl border border-white/[0.04] p-4 bg-white/[0.01]">
                      <p className="text-[10px] text-white/20 mb-2">{new Date(entry.date).toLocaleDateString()}</p>
                      <ul className="space-y-1">
                        {entry.items.map((item, i) => (
                          <li key={i} className="text-white/50 text-sm flex items-start gap-2">
                            <span className="text-violet-400">🙏</span> {item}
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
          <div className="space-y-4">
            {!meditating ? (
              <div className="rounded-xl border border-white/[0.06] p-6 bg-white/[0.02] text-center">
                <div className="text-5xl mb-4">🧘</div>
                <h3 className="text-lg font-semibold mb-2">AI Meditation Guide</h3>
                <p className="text-white/30 text-sm mb-6">Get a personalized meditation script based on your current mood</p>
                <button
                  onClick={generateMeditation}
                  disabled={meditationLoading}
                  className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 tap-feedback"
                >
                  {meditationLoading ? '🔄 Generating...' : '✨ Generate Meditation'}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-violet-500/20 p-6 bg-violet-500/5">
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🧘</div>
                  <h3 className="text-lg font-semibold text-violet-400">Your Meditation</h3>
                </div>
                <div className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                  {meditationScript}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMeditating(false); setMeditationScript('') }}
                    className="flex-1 px-4 py-3 border border-white/[0.06] rounded-xl text-sm text-white/40 hover:bg-white/[0.02] transition"
                  >
                    New Script
                  </button>
                  <button
                    onClick={generateMeditation}
                    disabled={meditationLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {meditationLoading ? '🔄' : '🔄 Regenerate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
