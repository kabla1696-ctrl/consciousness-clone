'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import InfiniteScroll from '../../components/InfiniteScroll'

interface Message {
  id: string
  role: 'user' | 'clone'
  content: string
  created_at: string
}

const STORAGE_KEY = 'cc_chat_messages'

export default function Chat() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setAuthLoading(false)
    })
  }, [])

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) { setMessages(parsed); return }
      }
    } catch {}
    setMessages([{
      id: 'welcome', role: 'clone',
      content: "Hey there! 👋 I'm your consciousness clone — trained on your memories, ready to chat. Ask me anything!",
      created_at: new Date().toISOString(),
    }])
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (messages.length > 0 && !authLoading) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages, authLoading])

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const getAIResponse = async (text: string): Promise<string> => {
    const history = [...messages.slice(-20).map(m => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })), { role: 'user' as const, content: text }]

    let memories: string[] = []
    if (user) {
      const { data } = await supabase.from('memories').select('content').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(50)
      memories = data?.map(m => m.content) || []
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, memories }),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()
    return data.reply || data.content || "I'm thinking... 🧠"
  }

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !user) return
    const text = input.trim()
    setInput('')
    inputRef.current?.focus()

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }
    setMessages(p => [...p, userMsg])
    setLoading(true)

    try {
      const reply = await getAIResponse(text)
      setMessages(p => [...p, { id: `c-${Date.now()}`, role: 'clone', content: reply, created_at: new Date().toISOString() }])
    } catch (e) {
      console.error(e)
      setMessages(p => [...p, { id: `e-${Date.now()}`, role: 'clone', content: "Couldn't reach my brain. Try again? 🧠", created_at: new Date().toISOString() }])
    }
    setLoading(false)
  }, [input, loading, user, messages])

  const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (authLoading || !user) {
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
    <main className="min-h-screen flex flex-col bg-[#050510] relative">
      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{ top: '-150px', right: '-120px', background: 'radial-gradient(circle,rgba(139,92,246,0.4),transparent 70%)', animation: 'orb1 20s ease-in-out infinite' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ bottom: '-200px', left: '-150px', background: 'radial-gradient(circle,rgba(236,72,153,0.35),transparent 70%)', animation: 'orb2 25s ease-in-out infinite' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.05]" style={{ top: '40%', left: '60%', background: 'radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%)', animation: 'orb3 18s ease-in-out infinite' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3 max-w-3xl mx-auto">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-base shadow-lg shadow-violet-500/20">🧠</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white">{t('talk to clone')}</h1>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Empty state */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-4xl mb-6 border border-white/[0.06]">🧠</div>
              <h2 className="text-xl font-bold text-white mb-2">{t('welcome')}</h2>
              <p className="text-white/40 text-sm max-w-xs leading-relaxed">Start a conversation — your clone responds based on your memories and personality.</p>
            </div>
          )}

          {/* Messages list with InfiniteScroll */}
          <InfiniteScroll
            items={messages}
            renderItem={(msg, i) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}>
                <div className="max-w-[82%] sm:max-w-[75%]">
                  {msg.role === 'clone' && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs shadow-md shadow-violet-500/20">🧠</div>
                      <span className="text-white/20 text-[11px] font-medium">Clone</span>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-br-md shadow-lg shadow-violet-500/10' : 'rounded-bl-md bg-white/[0.04] backdrop-blur-sm border border-white/[0.06]'}`}>
                    {msg.role === 'clone' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  <p className={`text-white/15 text-[10px] mt-1 font-medium ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>{time(msg.created_at)}</p>
                </div>
              </div>
            )}
            loadMore={async () => { /* Could load older messages from storage */ }}
            hasMore={false}
            className="space-y-5"
          />

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs animate-pulse">🧠</div>
                  <span className="text-white/20 text-[11px] font-medium">Clone</span>
                </div>
                <div className="rounded-2xl rounded-bl-md bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] px-5 py-3.5">
                  <div className="flex gap-2 items-center">
                    <div className="w-2 h-2 bg-violet-400/80 rounded-full dot-1" />
                    <div className="w-2 h-2 bg-fuchsia-400/80 rounded-full dot-2" />
                    <div className="w-2 h-2 bg-violet-400/80 rounded-full dot-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050510]/90 backdrop-blur-2xl border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className={`flex items-center gap-2 rounded-2xl bg-white/[0.04] border px-2 transition-all duration-200 ${focused ? 'border-violet-500/30 shadow-lg shadow-violet-500/5' : 'border-white/[0.06]'}`}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} className="flex-1 px-3 py-3 bg-transparent border-none focus:outline-none text-white text-[15px] placeholder:text-white/20" placeholder={t('type message')} disabled={loading} />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center transition-all disabled:opacity-20 active:scale-90 hover:shadow-lg hover:shadow-violet-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-20px,15px) scale(.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.04)} 66%{transform:translate(15px,-30px) scale(.96)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,20px)} }
        .dot-1 { animation: bounce 1.4s ease-in-out infinite }
        .dot-2 { animation: bounce 1.4s ease-in-out .2s infinite }
        .dot-3 { animation: bounce 1.4s ease-in-out .4s infinite }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }
        @keyframes slide-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .animate-slide-up { animation: slide-up .35s ease-out forwards; opacity:0 }
        @keyframes fade-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in .6s ease-out forwards }
      `}</style>
    </main>
  )
}
