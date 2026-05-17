'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  role: 'user' | 'clone'
  content: string
  time: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'clone',
      content: "Hey! I'm your consciousness clone. I've been learning from your memories. Ask me anything — I'll respond the way YOU would. 🧠",
      time: 'Now',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate AI response (replace with real API call later)
    setTimeout(() => {
      const cloneMsg: Message = {
        id: Date.now() + 1,
        role: 'clone',
        content: getCloneResponse(input),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, cloneMsg])
      setLoading(false)
    }, 1500)
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

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text">Consciousness Clone</Link>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition">Dashboard</Link>
            <Link href="/memories" className="text-white/60 hover:text-white transition">Memories</Link>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="flex-1 pt-20 pb-24 px-4 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                {msg.role === 'clone' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm">🧠</div>
                    <span className="text-white/40 text-sm">Your Clone</span>
                  </div>
                )}
                <div className={`rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary rounded-br-sm'
                    : 'glass rounded-bl-sm'
                }`}>
                  <p className="text-white/90">{msg.content}</p>
                </div>
                <p className={`text-white/30 text-xs mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl rounded-bl-sm px-5 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 glass p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-primary transition"
            placeholder="Talk to your clone..."
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-primary rounded-full font-semibold hover:bg-primary/80 transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
