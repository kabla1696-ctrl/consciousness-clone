'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Briefing {
  id: string
  date: string
  content: string
  created_at: string
}

export default function DailyBriefing() {
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

        // Show today's briefing if it exists
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

      // Remove existing today's briefing and add new one
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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">☀️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Daily Briefing</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              Your morning companion
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/40 hover:text-violet-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* History Panel */}
        {showHistory && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Briefing History</h3>
              <span className="text-xs text-white/30">{history.length} days</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No briefings yet</p>
              ) : (
                history.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setBriefing(b.content); setShowHistory(false) }}
                    className="w-full px-4 py-3 text-left border-b border-white/[0.03] hover:bg-white/[0.02] transition"
                  >
                    <p className="text-sm text-white/70 font-medium">{b.date}</p>
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
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
            <div className="relative text-6xl">🌅</div>
          </div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">{greeting}</h2>
          <p className="text-white/40 text-sm">{today}</p>
        </div>

        {/* Generate / Refresh Button */}
        <button
          onClick={generateBriefing}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 font-semibold text-white hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 mb-6"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing Your Briefing...
            </>
          ) : briefing ? (
            <>
              <span>🔄</span> Refresh Briefing
            </>
          ) : (
            <>
              <span>☀️</span> Get Your Briefing
            </>
          )}
        </button>

        {/* Briefing Content */}
        {briefing && (
          <div className="rounded-2xl border border-amber-500/10 bg-gradient-to-b from-amber-500/5 to-transparent overflow-hidden">
            <div className="px-5 py-5">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{briefing}</p>
            </div>
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-white/20">Generated by your clone</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(briefing)
                  alert('Briefing copied!')
                }}
                className="text-xs text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
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
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-white/30 text-sm">Tap the button to receive your daily briefing</p>
            <p className="text-white/20 text-xs mt-1">Personalized insights based on your memories</p>
          </div>
        )}
      </div>
    </main>
  )
}
