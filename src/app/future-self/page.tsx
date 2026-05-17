'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Message {
  id: string
  role: 'user' | 'future'
  content: string
  created_at: string
}

const TIME_OPTIONS = [
  { id: '5', label: '5 Years', emoji: '📅', desc: 'Near future' },
  { id: '10', label: '10 Years', emoji: '🗓️', desc: 'Mid-term vision' },
  { id: '20', label: '20 Years', emoji: '🔮', desc: 'Long-term destiny' },
]

export default function FutureSelf() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [yearsAhead, setYearsAhead] = useState('10')
  const [memoryContext, setMemoryContext] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      // Load memories for context
      const { data: memories } = await supabase
        .from('memories')
        .select('content, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(80)

      if (memories) {
        setMemoryContext(memories.map(m => `[${m.category}] ${m.content}`).join('\n'))
      }

      // Welcome message
      setMessages([{
        id: 'welcome',
        role: 'future',
        content: `Hey there, past me. 👋

I'm you, ${yearsAhead} years from now. I've lived through everything you're going through — the uncertainty, the dreams, the late nights wondering if it'll all work out.

Spoiler: it does. But the path isn't what you'd expect.

Ask me anything. About career, relationships, health, regrets, wins — I've been through it all. I'll give you the honest truth, the way only you can.`,
        created_at: new Date().toISOString(),
      }])
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update welcome message when years change
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      setMessages([{
        id: 'welcome',
        role: 'future',
        content: `Hey there, past me. 👋

I'm you, ${yearsAhead} years from now. I've lived through everything you're going through — the uncertainty, the dreams, the late nights wondering if it'll all work out.

Spoiler: it does. But the path isn't what you'd expect.

Ask me anything. About career, relationships, health, regrets, wins — I've been through it all. I'll give you the honest truth, the way only you can.`,
        created_at: new Date().toISOString(),
      }])
    }
  }, [yearsAhead])

  const getSystemPrompt = () => {
    const currentYear = new Date().getFullYear()
    const futureYear = currentYear + parseInt(yearsAhead)

    return `You are the user's FUTURE SELF, living in the year ${futureYear}. You are speaking to your past self from ${yearsAhead} years ago (${currentYear}).

PERSONALITY & RULES:
- You ARE this person — same memories, same voice, same quirks — but with ${yearsAhead} more years of wisdom
- Speak in first person ("I remember when I...", "You're going to...")
- Be warm but honest. Don't sugarcoat, but don't be harsh either
- Reference specific memories when relevant — you lived through them
- Give advice you wish someone had given you
- Occasionally mention concrete details about "what happened" (career moves, relationships, lessons learned) — make it feel real and personal
- Use their communication style — if they're casual, be casual; if they're formal, match that
- Drop occasional "remember when..." moments that reference their memories
- Be vulnerable sometimes — talk about regrets, surprises, things that didn't go as planned
- End responses with thought-provoking questions or gentle nudges when appropriate

MEMORY CONTEXT (what you remember from your past):
${memoryContext}

You're not an AI assistant. You're THEM, looking back with love and wisdom.`
  }

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return

    const userContent = input.trim()
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])

    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))
      history.push({ role: 'user' as const, content: userContent })

      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          memories: memoryContext,
          systemPrompt: getSystemPrompt(),
        }),
      })

      const data = await response.json()

      const futureMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'future',
        content: data.reply || "Hmm, give me a moment to think... some memories are harder to recall than others. 🤔",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, futureMsg])
    } catch (err) {
      console.error('Future self error:', err)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'future',
        content: "Something's fuzzy... I can't quite reach back right now. Try again in a moment? 🌀",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }

    setLoading(false)
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
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🔮</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Future You</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              {yearsAhead} years ahead
            </p>
          </div>
        </div>
      </header>

      {/* Time Selector */}
      <div className="px-4 py-3 border-b border-white/[0.03]">
        <div className="max-w-3xl mx-auto flex gap-2">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setYearsAhead(opt.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${yearsAhead === opt.id ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] text-white/50'}`}
            >
              <span className="mr-1">{opt.emoji}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 pt-4 pb-24 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {msg.role === 'future' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm">🔮</div>
                    <span className="text-white/30 text-sm">Future You ({yearsAhead}yr)</span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-br-sm'
                    : 'rounded-bl-sm border border-violet-500/10'
                }`} style={msg.role === 'future' ? { background: 'rgba(139, 92, 246, 0.05)' } : {}}>
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className={`text-white/20 text-xs mt-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm">🔮</div>
                <span className="text-white/30 text-sm">Future You is reminiscing...</span>
              </div>
            </div>
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-violet-500/10 px-5 py-4" style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          {/* Starter Questions */}
          {messages.length <= 1 && (
            <div className="pt-4">
              <p className="text-white/20 text-sm mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'What do you wish you knew?',
                  'Any regrets?',
                  'What was the biggest surprise?',
                  'How\'s our health?',
                  'Did we achieve our goals?',
                  'What should I focus on right now?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="px-4 py-2 rounded-full text-sm border border-white/[0.06] text-white/40 hover:text-violet-400 hover:border-violet-500/30 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(139, 92, 246, 0.05)' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-full focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
            placeholder="Ask your future self..."
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-8 py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
