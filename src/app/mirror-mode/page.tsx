'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'

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

    // Get acknowledgment + next question
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
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">🪞</span>
            <h1 className="text-base font-bold">Mirror Mode</h1>
          </div>
          <button onClick={clearHistory} className="text-white/30 text-xs tap-feedback px-2 py-1 rounded border border-white/[0.06]">
            Reset
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="px-4 py-2 bg-white/[0.01] border-b border-white/[0.04] flex gap-4">
        <span className="text-[10px] text-white/30">Questions answered: <span className="text-violet-400 font-semibold">{userMsgCount}</span></span>
        <span className="text-[10px] text-white/30">Clone learning: <span className="text-fuchsia-400 font-semibold">{Math.min(userMsgCount * 5, 100)}%</span></span>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-container">
        {messages.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🪞</div>
            <p className="text-white/40">Your clone wants to learn about you</p>
            <p className="text-white/20 text-sm mt-1">Answer honestly — this helps build your consciousness</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
              : 'bg-white/[0.04] border border-white/[0.06] text-white/80'
            }`}>
              {msg.role === 'clone' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">🧠</span>
                  <span className="text-[10px] text-violet-400 font-semibold">Your Clone</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-white/40' : 'text-white/20'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs">🧠</span>
                <span className="text-[10px] text-violet-400 font-semibold">Your Clone</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-violet-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-[#050510]/95 backdrop-blur-xl border-t border-white/[0.04] p-4 safe-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitAnswer()}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20 text-sm"
            placeholder="Type your answer..."
          />
          <button
            onClick={submitAnswer}
            disabled={!answer.trim() || loading}
            className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-30 tap-feedback"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
