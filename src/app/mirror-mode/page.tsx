'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Message {
  id: string
  role: 'clone' | 'user'
  content: string
  timestamp: string
}

const LS_KEY = 'cc_mirror_mode'

function loadHistory(): Message[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch { return [] }
}

function saveHistory(msgs: Message[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(msgs))
}

export default function MirrorMode() {
  const t = useT();
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const history = loadHistory()
      setMessages(history)
      setInitialized(true)
      if (history.length === 0) {
        fetchQuestion(history)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const fetchQuestion = async (currentHistory: Message[]) => {
    setLoading(true)
    try {
      const context = currentHistory.length > 0
        ? `Previous conversation:\n${currentHistory.map(m => `${m.role === 'clone' ? 'Clone' : 'User'}: ${m.content}`).join('\n')}\n\nBased on what you've learned so far, ask a new question about a topic you haven't covered.`
        : 'You are the user\'s consciousness clone. Ask the user one deep question to learn more about them. Ask about topics you don\'t have memories about yet.'

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: context }),
      })
      const data = await res.json()
      const question = data.reply || data.message || 'Tell me something about yourself that nobody knows.'

      const cloneMsg: Message = {
        id: crypto.randomUUID(),
        role: 'clone',
        content: question,
        timestamp: new Date().toISOString(),
      }
      const updated = [...currentHistory, cloneMsg]
      setMessages(updated)
      saveHistory(updated)
    } catch {
      const cloneMsg: Message = {
        id: crypto.randomUUID(),
        role: 'clone',
        content: 'Tell me about a moment that changed who you are.',
        timestamp: new Date().toISOString(),
      }
      const updated = [...currentHistory, cloneMsg]
      setMessages(updated)
      saveHistory(updated)
    }
    setLoading(false)
  }

  const submitAnswer = async () => {
    if (!answer.trim() || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: answer.trim(),
      timestamp: new Date().toISOString(),
    }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    saveHistory(withUser)
    setAnswer('')

    setLoading(true)
    try {
      const context = `Conversation so far:\n${withUser.map(m => `${m.role === 'clone' ? 'Clone' : 'User'}: ${m.content}`).join('\n')}\n\nAcknowledge the user's answer warmly, then ask a new deep question about a topic you haven't explored yet. Keep it to 2-3 sentences max.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: context }),
      })
      const data = await res.json()
      const reply = data.reply || data.message || 'Thank you for sharing. Tell me about something you believe that most people disagree with.'

      const cloneMsg: Message = {
        id: crypto.randomUUID(),
        role: 'clone',
        content: reply,
        timestamp: new Date().toISOString(),
      }
      const updated = [...withUser, cloneMsg]
      setMessages(updated)
      saveHistory(updated)
    } catch {
      const cloneMsg: Message = {
        id: crypto.randomUUID(),
        role: 'clone',
        content: 'Thank you for sharing. What\'s a lesson you had to learn the hard way?',
        timestamp: new Date().toISOString(),
      }
      const updated = [...withUser, cloneMsg]
      setMessages(updated)
      saveHistory(updated)
    }
    setLoading(false)
  }

  const clearHistory = () => {
    setMessages([])
    saveHistory([])
    fetchQuestion([])
  }

  const userMsgCount = messages.filter(m => m.role === 'user').length

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition flex flex-col relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-fuchsia-600/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.02] blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="relative">
              <span className="text-xl">🪞</span>
              <div className="absolute -inset-1 bg-violet-500/20 rounded-full blur-md" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">{t('mirror mode')}</h1>
          </div>
          <button onClick={clearHistory} className="text-white/30 text-xs tap-feedback px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:text-white/50 transition-all duration-300">
            Reset
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-4 py-3 bg-white/[0.01] border-b border-white/[0.04] flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
          <span className="text-[11px] text-white/40">{t('questions')} <span className="text-violet-400 font-bold">{userMsgCount}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]" />
          <span className="text-[11px] text-white/40">{t('clone asks')} <span className="text-fuchsia-400 font-bold">{Math.min(userMsgCount * 5, 100)}%</span></span>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scroll-container">
        {messages.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-4">
              <div className="text-6xl">🪞</div>
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl scale-150" />
            </div>
            <p className="text-white/50 text-lg font-medium">{t('reflect')}</p>
            <p className="text-white/20 text-sm mt-2">{t('clone asks')}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3.5 backdrop-blur-sm transition-all duration-300 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-500/90 to-purple-600/90 text-white shadow-lg shadow-violet-500/20 border border-violet-400/20'
                : 'bg-white/[0.04] border border-white/[0.08] text-white/80 hover:bg-white/[0.06] shadow-lg shadow-black/10'
            }`}>
              {msg.role === 'clone' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs">🧠</span>
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Your Clone</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/40' : 'text-white/20'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" style={{ animation: 'fadeInUp 0.4s ease both' }}>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 backdrop-blur-sm shadow-lg shadow-black/10">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">🧠</span>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Your Clone</span>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-violet-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#050510]/80 backdrop-blur-2xl border-t border-white/[0.04] p-4 safe-bottom">
        <div className="flex gap-3">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAnswer()}
            disabled={loading}
            className="flex-1 px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-violet-500/50 focus:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 text-white placeholder:text-white/20 text-sm backdrop-blur-sm"
            placeholder="Type your answer..."
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || loading}
            className="px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition-all duration-300 disabled:opacity-30 tap-feedback shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            Send
          </button>
        </div>
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
