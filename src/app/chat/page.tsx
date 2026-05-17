'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Message {
  id: string
  role: 'user' | 'clone'
  content: string
  created_at: string
}

const AI_ENDPOINT = 'https://opengateway.gitlawb.com/v1/xiaomi-mimo/chat/completions'
const AI_MODEL = 'mimo-v2.5-pro'

export default function Chat() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadMessages(user.id)
    }
    init()
  }, [])

  const loadMessages = async (userId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50)

    if (data && data.length > 0) {
      setMessages(data)
    } else {
      const welcome: Message = {
        id: 'welcome',
        role: 'clone',
        content: "Hey! I'm your consciousness clone. I've been learning from your memories. Ask me anything — I'll respond the way YOU would. 🧠",
        created_at: new Date().toISOString(),
      }
      setMessages([welcome])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getAIResponse = async (userContent: string): Promise<string> => {
    const history = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))
    history.push({ role: 'user' as const, content: userContent })

    const { data: memories } = await supabase
      .from('memories')
      .select('content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const memoryContext = memories?.map(m => m.content).join('\n') || ''

    const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, memories: memoryContext }),
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    return data.reply || "I'm thinking... give me a moment. 🧠"
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

    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role: 'user',
      content: userContent,
    })

    setLoading(true)

    try {
      const cloneContent = await getAIResponse(userContent)
      const cloneMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'clone',
        content: cloneContent,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, cloneMsg])

      await supabase.from('chat_messages').insert({
        user_id: user.id,
        role: 'clone',
        content: cloneContent,
      })
    } catch (err) {
      console.error('AI error:', err)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'clone',
        content: "Sorry, I couldn't connect to my brain right now. Try again in a moment! 🧠",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Subtle particle background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animation: 'orb1 25s ease-in-out infinite' }} />
        <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', animation: 'orb2 30s ease-in-out infinite' }} />
      </div>

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={`relative ${loading ? 'avatar-ring-pulse' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">🧠</div>
            {loading && <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-30" />}
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Your Clone</h1>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 pt-4 pb-24 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}>
              <div className="max-w-[80%]">
                {msg.role === 'clone' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs shadow-md shadow-violet-500/20">🧠</div>
                    <span className="text-white/25 text-xs font-medium">Your Clone</span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-br-md shadow-lg shadow-violet-500/10'
                    : 'rounded-bl-md glass'
                }`}>
                  <p className="text-white/90 leading-relaxed text-[15px]">{msg.content}</p>
                </div>
                <p className={`text-white/15 text-[11px] mt-1.5 font-medium ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs avatar-ring-pulse shadow-md shadow-violet-500/20 brain-pulse">🧠</div>
                  <span className="text-white/25 text-xs font-medium">Your Clone</span>
                  <span className="text-violet-400/60 text-[11px] italic">thinking...</span>
                </div>
                <div className="rounded-2xl rounded-bl-md glass px-5 py-4">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-2.5 h-2.5 bg-violet-400 rounded-full typing-dot-1" />
                    <div className="w-2.5 h-2.5 bg-fuchsia-400 rounded-full typing-dot-2" />
                    <div className="w-2.5 h-2.5 bg-violet-400 rounded-full typing-dot-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#050510]/85 backdrop-blur-2xl border-t border-white/[0.03]">
        <div className={`max-w-3xl mx-auto flex gap-3 rounded-full glass-strong px-2 py-2 input-glow transition-all duration-300 ${isInputFocused ? 'border-violet-500/30' : ''}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className="flex-1 px-4 py-3 bg-transparent border-none focus:outline-none text-white placeholder:text-white/20 text-[15px]"
            placeholder="Talk to your clone..."
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-20 disabled:hover:shadow-none active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </main>
  )
}
