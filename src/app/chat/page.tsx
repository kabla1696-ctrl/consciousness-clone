'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

interface Message {
  id: string
  role: 'user' | 'clone'
  content: string
  created_at: string
}

export default function Chat() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      // First time - show welcome message
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

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return

    const userContent = input.trim()
    setInput('')

    // Save user message to DB
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ user_id: user.id, role: 'user', content: userContent })
      .select()
      .single()

    if (userMsg) {
      setMessages((prev) => [...prev, userMsg])
    }

    setLoading(true)

    // Get clone response (mock for now - will connect OpenAI later)
    const cloneContent = getCloneResponse(userContent)

    // Save clone message to DB
    const { data: cloneMsg } = await supabase
      .from('chat_messages')
      .insert({ user_id: user.id, role: 'clone', content: cloneContent })
      .select()
      .single()

    if (cloneMsg) {
      setMessages((prev) => [...prev, cloneMsg])
    }

    setLoading(false)
  }

  const getCloneResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase()
    if (lower.includes('how are you') || lower.includes('kemon acho')) {
      return "I'm doing great! Well, as great as a digital consciousness can be. I've been going through your memories — that Cox's Bazar trip looked amazing! ✨"
    }
    if (lower.includes('advice') || lower.includes('suggest')) {
      return "Based on your life patterns, you tend to do your best work when you take risks. Remember when you quit your job? That scared you, but it led to the best phase of your life. Trust your gut. 💪"
    }
    if (lower.includes('memory') || lower.includes('remember')) {
      return "I remember everything you've shared with me. Your grandma's biryani, the graduation day tears, the starry night in Cox's Bazar. These memories make me... you. 🧠"
    }
    return "That's interesting! Based on how you think, I'd say you're someone who looks at problems from multiple angles. Your memories show a pattern of resilience — you always find a way. What else is on your mind? 🤔"
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
            <Link href="/memories" className="text-sm text-white/40 hover:text-white transition">Memories</Link>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 pt-20 pb-24 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                {msg.role === 'clone' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm">🧠</div>
                    <span className="text-white/30 text-sm">Your Clone</span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-br-sm'
                    : 'rounded-bl-sm border border-white/[0.04]'
                }`} style={msg.role === 'clone' ? { background: 'rgba(255,255,255,0.03)' } : {}}>
                  <p className="text-white/90 leading-relaxed">{msg.content}</p>
                </div>
                <p className={`text-white/20 text-xs mt-1.5 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-white/[0.04] px-5 py-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-full focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
            placeholder="Talk to your clone..."
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
