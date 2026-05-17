'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Briefing {
  id: string
  date: string
  content: string
  created_at: string
}

export default function DailyBriefing() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [briefing, setBriefing] = useState('')
  const [memoryContext, setMemoryContext] = useState('')
  const [history, setHistory] = useState<Briefing[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  })()

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
        .limit(80)

      if (memories) {
        setMemoryContext(memories.map(m => `[${m.category}] ${m.content}`).join('\n'))
      }

      const stored = localStorage.getItem('daily-briefing-history')
      if (stored) {
        const parsed: Briefing[] = JSON.parse(stored)
        setHistory(parsed)

        const todayStr = new Date().toISOString().split('T')[0]
        const todayBriefing = parsed.find(b => b.date === todayStr)
        if (todayBriefing) setBriefing(todayBriefing.content)
      }
    }
    init()
  }, [])

  const generateBriefing = async () => {
    if (generating) return
    setGenerating(true)
    setBriefing('')

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are giving the user their daily morning briefing. Based on their memories and personality, give them: 1) Motivational quote 2) Life tip 3) Something to think about 4) Energy forecast. Make it personal, warm, and insightful. Use emoji sparingly.`
          }],
          memories: memoryContext,
          systemPrompt: `You are a wise, warm daily briefing assistant — like a personal coach who deeply knows this person. 

Format your response clearly with these sections:
🌅 MOTIVATIONAL QUOTE
💡 LIFE TIP  
🤔 SOMETHING TO THINK ABOUT
⚡ ENERGY FORECAST

Be specific to this person's life based on their memories. Be genuine, not generic. Keep each section concise but meaningful.`,
        }),
      })

      const data = await response.json()
      const content = data.reply || 'Unable to generate briefing. Please try again.'
      setBriefing(content)

      const todayStr = new Date().toISOString().split('T')[0]
      const newBriefing: Briefing = {
        id: Date.now().toString(),
        date: todayStr,
        content,
        created_at: new Date().toISOString(),
      }

      const filtered = history.filter(b => b.date !== todayStr)
      const updated = [newBriefing, ...filtered].slice(0, 30)
      setHistory(updated)
      localStorage.setItem('daily-briefing-history', JSON.stringify(updated))
    } catch (err) {
      setBriefing('Failed to generate briefing. Please try again.')
    }

    setGenerating(false)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-orange-500/20 border-b-orange-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-600/[0.07] blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-orange-600/[0.05] blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 rounded-full bg-rose-600/[0.04] blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/50 group-hover:text-amber-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm shadow-lg shadow-amber-500/25">☀️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('daily briefing')}</h1>
            <p className="text-[10px] text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              {t('morning')}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/40 hover:text-amber-400 transition-all duration-300 p-2 rounded-xl hover:bg-amber-500/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
        {/* History Panel */}
        {showHistory && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-amber-500/[0.03]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-amber-500/[0.06] to-transparent">
              <h3 className="text-sm font-semibold text-white/90">{t('summary')}</h3>
              <span className="text-xs text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full">{history.length} days</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-white/30 text-sm p-6 text-center">No briefings yet</p>
              ) : (
                history.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setBriefing(b.content); setShowHistory(false) }}
                    className="w-full px-4 py-3 text-left border-b border-white/[0.04] hover:bg-white/[0.04] transition-all duration-200 group"
                  >
                    <p className="text-sm text-white/70 font-medium group-hover:text-amber-300 transition-colors">{b.date}</p>
                    <p className="text-xs text-white/30 truncate">{b.content.slice(0, 80)}...</p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Morning Greeting */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-rose-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s', transform: 'scale(1.3)' }} />
            <div className="relative text-6xl drop-shadow-lg">🌅</div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-white to-orange-300 bg-clip-text text-transparent mb-1">{t('morning')}</h2>
          <p className="text-white/40 text-sm">{today}</p>
        </div>

        {/* Generate / Refresh Button */}
        <button
          onClick={generateBriefing}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2 mb-6 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
              <span className="relative z-10">{t('schedule')}</span>
            </>
          ) : briefing ? (
            <>
              <span className="relative z-10">🔄</span> <span className="relative z-10">{t('daily briefing')}</span>
            </>
          ) : (
            <>
              <span className="relative z-10">☀️</span> <span className="relative z-10">{t('daily briefing')}</span>
            </>
          )}
        </button>

        {/* Briefing Content */}
        {briefing && (
          <div className="rounded-2xl border border-amber-500/[0.12] bg-gradient-to-b from-amber-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-amber-500/[0.05] relative group">
            {/* Glow border */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm -z-10" />

            <div className="px-5 py-5">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
            </div>
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-amber-500/[0.04] to-transparent">
              <span className="text-xs text-white/20">Generated by your clone</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(briefing)
                  alert('Briefing copied!')
                }}
                className="text-xs text-amber-400 hover:text-amber-300 transition-all duration-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-amber-500/10"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!briefing && !generating && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-bounce">✨</div>
            <p className="text-white/40 text-sm font-medium">{t('daily briefing')}</p>
            <p className="text-white/20 text-xs mt-1.5">{t('summary')}</p>
          </div>
        )}
      </div>
    </main>
  )
}
