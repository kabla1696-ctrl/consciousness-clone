'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

type TherapyType = 'anxiety' | 'relationships' | 'career' | 'self-worth' | 'grief' | 'motivation'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Session {
  id: string
  type: TherapyType
  messages: Message[]
  moodBefore: number
  moodAfter: number | null
  date: string
  insight?: string
}

const MOOD_EMOJIS = ['😢', '😟', '😐', '🙂', '😊', '😄', '🥰', '✨', '💫', '🌟']

export default function CloneTherapy() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [activeType, setActiveType] = useState<TherapyType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memoryContext, setMemoryContext] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [moodBefore, setMoodBefore] = useState<number | null>(null)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const [showMoodCheckIn, setShowMoodCheckIn] = useState<'before' | 'after' | null>(null)
  const [todayInsight, setTodayInsight] = useState('')
  const [generatingInsight, setGeneratingInsight] = useState(false)
  const [breathingActive, setBreathingActive] = useState(false)
  const [breathingStep, setBreathingStep] = useState(0)
  const [breathingCount, setBreathingCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const THERAPY_TYPES: { key: TherapyType; icon: string; label: string; color: string; gradient: string }[] = [
    { key: 'anxiety', icon: '🫧', label: t('Anxiety'), color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { key: 'relationships', icon: '💜', label: t('Relationships'), color: 'purple', gradient: 'from-purple-500 to-pink-500' },
    { key: 'career', icon: '🚀', label: t('Career'), color: 'amber', gradient: 'from-amber-500 to-orange-500' },
    { key: 'self-worth', icon: '🌟', label: t('Self-Worth'), color: 'rose', gradient: 'from-rose-500 to-pink-500' },
    { key: 'grief', icon: '🕊️', label: t('Grief'), color: 'indigo', gradient: 'from-indigo-500 to-blue-500' },
    { key: 'motivation', icon: '🔥', label: t('Motivation'), color: 'orange', gradient: 'from-orange-500 to-red-500' },
  ]

  const BREATHING_STEPS = [
    { label: t('Breathe In'), duration: 4, scale: 1.4 },
    { label: t('Hold'), duration: 7, scale: 1.4 },
    { label: t('Breathe Out'), duration: 8, scale: 1 },
  ]

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: memories } = await supabase
        .from('memories')
        .select('content, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (memories) {
        setMemoryContext(memories.map(m => `[${m.category}] ${m.content}`).join('\n'))
      }

      const stored = localStorage.getItem('clone-therapy-sessions')
      if (stored) {
        const parsed: Session[] = JSON.parse(stored)
        setSessions(parsed)
      }

      const insightStored = localStorage.getItem('clone-therapy-insight')
      const insightDate = localStorage.getItem('clone-therapy-insight-date')
      const todayStr = new Date().toISOString().split('T')[0]
      if (insightStored && insightDate === todayStr) {
        setTodayInsight(insightStored)
      }
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!breathingActive) return
    const step = BREATHING_STEPS[breathingStep]
    const timer = setTimeout(() => {
      const next = (breathingStep + 1) % BREATHING_STEPS.length
      if (next === 0) {
        setBreathingCount(c => c + 1)
        if (breathingCount >= 3) {
          setBreathingActive(false)
          setBreathingStep(0)
          setBreathingCount(0)
          return
        }
      }
      setBreathingStep(next)
    }, step.duration * 1000)
    return () => clearTimeout(timer)
  }, [breathingActive, breathingStep, breathingCount])

  const generateInsight = async () => {
    if (generatingInsight || !memoryContext) return
    setGeneratingInsight(true)
    try {
      const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || ''
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Generate a single, profound therapeutic insight for today based on my memories. One paragraph, warm and wise.' }],
          memories: memoryContext,
          systemPrompt: 'You are a compassionate therapist. Generate one daily insight — a pearl of wisdom drawn from this person\'s life experiences. Keep it to one powerful paragraph. Be warm, specific, and deeply personal.',
        }),
      })
      const data = await response.json()
      const insight = data.insight || data.reply || 'You are worthy of peace and growth.'
      setTodayInsight(insight)
      const todayStr = new Date().toISOString().split('T')[0]
      localStorage.setItem('clone-therapy-insight', insight)
      localStorage.setItem('clone-therapy-insight-date', todayStr)
    } catch { setTodayInsight('Today, remember: growth is not linear. Every step counts.') }
    setGeneratingInsight(false)
  }

  const startSession = (type: TherapyType) => {
    setActiveType(type)
    setMessages([])
    setMoodBefore(null)
    setMoodAfter(null)
    setShowMoodCheckIn('before')
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeType) return
    const cleanInput = input.trim().slice(0, 5000)
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: cleanInput, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const therapyType = THERAPY_TYPES.find(tp => tp.key === activeType)
      const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || ''
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          memories: memoryContext,
          systemPrompt: `You are a compassionate, skilled therapist specializing in ${therapyType?.label}. You deeply know this person through their memories. Use their life context to give personalized, meaningful therapeutic advice. Be warm, validating, and gently challenging. Ask thoughtful follow-up questions. Use evidence-based techniques (CBT, mindfulness, etc). Keep responses conversational but profound. Never diagnose. Remember: you know their story — reference their memories when relevant.`,
        }),
      })
      const data = await response.json()
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply || 'I hear you. Let\'s explore that together.', timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, assistantMsg])
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I\'m here for you. Could you try again?', timestamp: new Date().toISOString() }])
    }
    setLoading(false)
  }

  const endSession = () => {
    if (!activeType) return
    setShowMoodCheckIn('after')
  }

  const saveSession = () => {
    if (!activeType || moodBefore === null) return
    const session: Session = {
      id: Date.now().toString(),
      type: activeType,
      messages,
      moodBefore,
      moodAfter,
      date: new Date().toISOString().split('T')[0],
    }
    const updated = [session, ...sessions].slice(0, 50)
    setSessions(updated)
    localStorage.setItem('clone-therapy-sessions', JSON.stringify(updated))
    setActiveType(null)
    setMessages([])
    setMoodBefore(null)
    setMoodAfter(null)
    setShowMoodCheckIn(null)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  const activeTypeInfo = THERAPY_TYPES.find(tp => tp.key === activeType)

  // Mood Check-in Overlay
  if (showMoodCheckIn) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/[0.06] blur-[140px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-600/[0.05] blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 text-center px-6 max-w-md mx-auto">
          <div className="text-5xl mb-6 animate-bounce" aria-hidden="true">{showMoodCheckIn === 'before' ? '🫧' : '✨'}</div>
          <h2 className="text-xl font-bold text-white mb-2">{showMoodCheckIn === 'before' ? t('How are you feeling?') : t('How do you feel now?')}</h2>
          <p className="text-white/40 text-sm mb-8">{t('Rate your mood on a scale of 1–10')}</p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {MOOD_EMOJIS.map((emoji, i) => {
              const val = i + 1
              const selected = showMoodCheckIn === 'before' ? moodBefore === val : moodAfter === val
              return (
                <button
                  key={val}
                  onClick={() => showMoodCheckIn === 'before' ? setMoodBefore(val) : setMoodAfter(val)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${selected ? 'bg-blue-500/30 scale-125 ring-2 ring-blue-400/50' : 'bg-white/[0.04] hover:bg-white/[0.08] hover:scale-110'}`}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => {
              if (showMoodCheckIn === 'before' && moodBefore !== null) setShowMoodCheckIn(null)
              else if (showMoodCheckIn === 'after') saveSession()
            }}
            disabled={showMoodCheckIn === 'before' ? moodBefore === null : moodAfter === null}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold disabled:opacity-30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            {showMoodCheckIn === 'before' ? t('Start Session') : t('Save & Close')}
          </button>
        </div>
      </main>
    )
  }

  // Active therapy session
  if (activeType) {
    return (
      <main className="min-h-screen flex flex-col bg-[#050510] relative">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/[0.04] blur-[140px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-purple-600/[0.03] blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top">
          <div className="px-4 py-3 flex items-center gap-3">
            <button onClick={() => { if (messages.length > 0) endSession(); else setActiveType(null) }} className="tap-feedback p-1 group">
              <svg className="w-6 h-6 text-white/50 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTypeInfo?.gradient} flex items-center justify-center text-sm shadow-lg`}>{activeTypeInfo?.icon}</div>
            <div className="flex-1">
              <h1 className="text-sm font-bold text-white/90">{activeTypeInfo?.label} Therapy</h1>
              <p className="text-[10px] text-blue-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                {t('Safe space — take your time')}
              </p>
            </div>
            <button onClick={() => setBreathingActive(true)} className="p-2 rounded-xl hover:bg-blue-500/10 transition-all text-white/40 hover:text-blue-400" title="Breathing Exercise">
              🫧
            </button>
          </div>
        </header>

        {/* Breathing overlay */}
        {breathingActive && (
          <div className="fixed inset-0 z-[60] bg-[#050510]/95 backdrop-blur-xl flex items-center justify-center">
            <button onClick={() => { setBreathingActive(false); setBreathingStep(0); setBreathingCount(0) }} className="absolute top-6 right-6 text-white/40 hover:text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="text-center">
              <div className="text-sm text-blue-400 mb-4 font-medium">{t('4-7-8 Breathing')} · {t('Round')} {breathingCount + 1}/4</div>
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 transition-all duration-1000 ease-in-out"
                  style={{ transform: `scale(${BREATHING_STEPS[breathingStep].scale})`, animationDuration: `${BREATHING_STEPS[breathingStep].duration}s` }}
                />
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 flex items-center justify-center">
                  <span className="text-3xl font-light text-white/80">{BREATHING_STEPS[breathingStep].label}</span>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                {BREATHING_STEPS.map((s, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === breathingStep ? 'bg-blue-400 scale-125' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div aria-hidden="true" className="text-5xl mb-4">{activeTypeInfo?.icon}</div>
              <h2 className="text-lg font-bold text-white/90 mb-2">{t('Welcome to your')} {activeTypeInfo?.label} {t('session')}</h2>
              <p className="text-white/40 text-sm max-w-xs mx-auto">{t('I know your story. Let\'s work through this together. Share what\'s on your mind.')}</p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                ? `bg-gradient-to-r ${activeTypeInfo?.gradient} text-white shadow-lg`
                : 'bg-white/[0.05] border border-white/[0.08] text-white/80 backdrop-blur-xl'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-white/20'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-xs text-white/30">{t('Reflecting...')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 bg-[#050510]/80 backdrop-blur-2xl border-t border-white/[0.06] p-4 safe-bottom relative z-10">
          <div className="flex items-center gap-3 max-w-3xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('Share what\'s on your mind...')}
              className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition-all"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className={`w-11 h-11 rounded-xl bg-gradient-to-r ${activeTypeInfo?.gradient} flex items-center justify-center text-white disabled:opacity-30 transition-all hover:shadow-lg active:scale-90`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          {messages.length >= 2 && (
            <button onClick={endSession} className="mt-3 w-full text-center text-xs text-white/30 hover:text-blue-400 transition-colors py-1">
              {t('End session & rate mood')} →
            </button>
          )}
        </div>
      </main>
    )
  }

  // Main lobby
  return (
    <main className="min-h-screen flex flex-col bg-[#050510] relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/[0.06] blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-600/[0.04] blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full bg-cyan-600/[0.03] blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/50 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm shadow-lg shadow-blue-500/25">🫧</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('Clone Therapy')}</h1>
            <p className="text-[10px] text-blue-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              {t('Your safe space')}
            </p>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="text-white/40 hover:text-blue-400 transition-all duration-300 p-2 rounded-xl hover:bg-blue-500/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
        {/* History */}
        {showHistory && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/[0.03]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-blue-500/[0.06] to-transparent">
              <h3 className="text-sm font-semibold text-white/90">{t('Session History')}</h3>
              <span className="text-xs text-blue-400/70 bg-blue-500/10 px-2 py-0.5 rounded-full">{sessions.length} {t('sessions')}</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-white/30 text-sm p-6 text-center">{t('No sessions yet')}</p>
              ) : sessions.map(s => {
                const info = THERAPY_TYPES.find(tp => tp.key === s.type)
                const improvement = s.moodAfter !== null ? s.moodAfter - s.moodBefore : 0
                return (
                  <div key={s.id} className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${info?.gradient} flex items-center justify-center text-sm`}>{info?.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-white/70 font-medium">{info?.label}</p>
                      <p className="text-xs text-white/30">{s.date} · {s.messages.length} messages</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">{MOOD_EMOJIS[s.moodBefore - 1]} → {s.moodAfter ? MOOD_EMOJIS[s.moodAfter - 1] : '?'}</p>
                      {improvement !== 0 && (
                        <p className={`text-xs font-medium ${improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>{improvement > 0 ? '+' : ''}{improvement} mood</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Today's Insight */}
        <div className="mb-6 rounded-2xl border border-blue-500/[0.12] bg-gradient-to-b from-blue-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/[0.05] relative group">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-blue-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm -z-10" />
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💡</span>
              <h3 className="text-sm font-semibold text-white/90">{t('Today\'s Insight')}</h3>
            </div>
            {todayInsight ? (
              <p className="text-sm text-white/70 leading-relaxed">{todayInsight}</p>
            ) : (
              <button
                onClick={generateInsight}
                disabled={generatingInsight}
                className="w-full py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/15 transition-all disabled:opacity-30"
              >
                {generatingInsight ? (
                  <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> {t('Generating...')}</span>
                ) : '✨ ' + t('Generate Today\'s Insight')}
              </button>
            )}
          </div>
        </div>

        {/* Breathing Quick Access */}
        <button
          onClick={() => setBreathingActive(true)}
          className="w-full mb-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] transition-all group"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl group-hover:animate-pulse">🫧</span>
            <div>
              <p className="text-sm font-semibold text-white/80">{t('4-7-8 Breathing Exercise')}</p>
              <p className="text-xs text-white/30">{t('Calm your mind in 2 minutes')}</p>
            </div>
          </div>
        </button>

        {/* Therapy Types */}
        <h3 className="text-sm font-semibold text-white/50 mb-4 uppercase tracking-wider">{t('Choose a Focus')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {THERAPY_TYPES.map(therapy => (
            <button
              key={therapy.key}
              onClick={() => startSession(therapy.key)}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group text-left"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${therapy.gradient} flex items-center justify-center text-lg mb-3 shadow-lg group-hover:scale-110 transition-transform`}>{therapy.icon}</div>
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{therapy.label}</p>
            </button>
          ))}
        </div>

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xl font-bold text-blue-400">{sessions.length}</p>
              <p className="text-[10px] text-white/30 mt-1">{t('Sessions')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xl font-bold text-purple-400">
                {sessions.filter(s => s.moodAfter !== null && s.moodAfter > s.moodBefore).length}
              </p>
              <p className="text-[10px] text-white/30 mt-1">{t('Improved')}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-xl font-bold text-green-400">
                +{sessions.filter(s => s.moodAfter !== null).length > 0
                  ? (sessions.filter(s => s.moodAfter !== null).reduce((sum, s) => sum + (s.moodAfter! - s.moodBefore), 0) / sessions.filter(s => s.moodAfter !== null).length).toFixed(1)
                  : '0'}
              </p>
              <p className="text-[10px] text-white/30 mt-1">{t('Avg Mood Δ')}</p>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </main>
  )
}
