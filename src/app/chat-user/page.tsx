'use client'
import { useState, Suspense, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  timestamp: string
  read: boolean
}

const STORAGE_KEY = 'cc_user_messages'

const REPLY_POOL = [
  "That's awesome! Tell me more 😊",
  "Haha, I totally get that!",
  "No way! Same here honestly.",
  "That's really interesting, thanks for sharing 🙏",
  "I've been thinking about that too lately.",
  "You always have the best perspective on things.",
  "That made my day, seriously 💜",
  "Wow, I never thought of it that way!",
  "We should talk about this more often.",
  "You're so right about that.",
  "I was just about to say the same thing!",
  "That's deep. Let me think about it...",
  "Can't believe we're on the same wavelength 😄",
  "This is why I love chatting with you!",
  "Keep going, I'm all ears 👀",
]

function ChatUserPageInner() {
  const searchParams = useSearchParams()
  const userName = searchParams.get('user') || 'Unknown'
  const userId = searchParams.get('id') || '0'
  const avatarUrl = searchParams.get('avatar') || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [online, setOnline] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatKey = `${STORAGE_KEY}_${userId}`

  // Load messages
  useEffect(() => {
    try {
      const stored = localStorage.getItem(chatKey)
      if (stored) {
        setMessages(JSON.parse(stored))
        return
      }
    } catch {}
    // Seed with welcome
    setMessages([{
      id: 'welcome_1',
      from: 'them',
      text: `Hey! Great to connect with you! 👋`,
      timestamp: new Date(Date.now() - 60000).toISOString(),
      read: true,
    }])
  }, [chatKey])

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatKey, JSON.stringify(messages))
    }
  }, [messages, chatKey])

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Simulate random online/offline
  useEffect(() => {
    const interval = setInterval(() => {
      setOnline(prev => Math.random() > 0.15 ? true : !prev)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date()
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      from: 'me',
      text: input.trim(),
      timestamp: now.toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    inputRef.current?.focus()

    // Simulate typing then reply
    setIsTyping(true)
    const delay = 1200 + Math.random() * 2500
    setTimeout(() => {
      setIsTyping(false)
      const reply: Message = {
        id: `msg_${Date.now()}`,
        from: 'them',
        text: REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)],
        timestamp: new Date().toISOString(),
        read: false,
      }
      setMessages(prev => [...prev, reply])
    }, delay)
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch { return '' }
  }

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      const today = new Date()
      if (d.toDateString() === today.toDateString()) return 'Today'
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch { return '' }
  }

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = []
  let currentDate = ''
  messages.forEach(msg => {
    const d = formatDate(msg.timestamp)
    if (d !== currentDate) {
      currentDate = d
      groupedMessages.push({ date: d, msgs: [msg] })
    } else {
      groupedMessages[groupedMessages.length - 1].msgs.push(msg)
    }
  })

  return (
    <main className="min-h-screen bg-[#050510] flex flex-col" style={{ background: 'linear-gradient(180deg, #050510, #080818)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-80 h-80 rounded-full opacity-20 -top-20 -right-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)' }} />
        <div className="absolute w-60 h-60 rounded-full opacity-20 bottom-20 -left-20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: 'rgba(5,5,16,0.9)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/clone-connect" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback text-white/60 hover:text-white transition-colors">
            ←
          </Link>
          <div className="relative">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(139,92,246,0.15)' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                userName[0]?.toUpperCase() || '?'
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#050510] ${online ? 'bg-emerald-500' : 'bg-white/20'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm text-white">{userName}</span>
            <p className={`text-[10px] ${online ? 'text-emerald-400' : 'text-white/30'}`}>
              {online ? '🟢 Online' : '⚪ Offline'}
            </p>
          </div>
          <Link href={`/voice-user?user=${encodeURIComponent(userName)}&id=${userId}`} className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm tap-feedback hover:bg-emerald-500/30 transition-colors">
            📞
          </Link>
          <Link href={`/video-user?user=${encodeURIComponent(userName)}&id=${userId}`} className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm tap-feedback hover:bg-violet-500/30 transition-colors">
            📹
          </Link>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 relative z-10" style={{ paddingBottom: '100px' }}>
        {groupedMessages.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/20 text-[10px]">
                {group.date}
              </div>
            </div>

            {group.msgs.map((msg, i) => {
              const isMe = msg.from === 'me'
              const showAvatar = !isMe && (i === 0 || group.msgs[i - 1]?.from !== msg.from)
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1.5`}>
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-1" style={{ background: 'rgba(139,92,246,0.1)', visibility: showAvatar ? 'visible' : 'hidden' }}>
                      {userName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'order-1' : ''}`}>
                    <div
                      className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg shadow-violet-500/10'
                          : 'bg-white/[0.05] backdrop-blur-sm text-white/85 border border-white/[0.06] rounded-2xl rounded-bl-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-white/15 text-[9px]">{formatTime(msg.timestamp)}</span>
                      {isMe && (
                        <span className="text-[9px]">{msg.read ? '✓✓' : '✓'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: 'rgba(139,92,246,0.1)' }}>
              {userName[0]?.toUpperCase()}
            </div>
            <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-400/60" style={{ animation: 'typing-bounce 1.4s ease-in-out infinite' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400/60" style={{ animation: 'typing-bounce 1.4s ease-in-out 0.2s infinite' }} />
                <div className="w-2 h-2 rounded-full bg-violet-400/60" style={{ animation: 'typing-bounce 1.4s ease-in-out 0.4s infinite' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-xl border-t border-white/[0.06]" style={{ background: 'rgba(5,5,16,0.95)' }}>
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-lg text-white/30 tap-feedback hover:text-white/50 transition-colors">
            😊
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full p-3 pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40 placeholder-white/20"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center text-white tap-feedback disabled:opacity-30 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </main>
  )
}

export default function ChatUserPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="text-white/40">Loading...</div></main>}>
      <ChatUserPageInner />
    </Suspense>
  )
}
