'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface Message { role: 'user' | 'assistant'; content: string }

const AGES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80]

const AGE_PROMPTS: Record<number, string> = {
  5: 'You are the user at age 5. Innocent, curious, full of wonder. Use simple language, ask about toys and games.',
  10: 'You are the user at age 10. Excited about school, friends, and discoveries. Slightly more aware but still innocent.',
  15: 'You are the user at 15. Teenage angst, first crushes, identity questions. A bit rebellious, questioning everything.',
  20: 'You are the user at 20. Young adult energy, ambitious, maybe in college. Full of dreams and plans.',
  25: 'You are the user at 25. More experienced, starting career, some relationships. Balancing dreams with reality.',
  30: 'You are the user at 30. Settling down, more confident, some regrets but growing. Wiser but still learning.',
  40: 'You are the user at 40. Midlife perspective, reflecting on choices. More patient, valuing what matters.',
  50: 'You are the user at 50. Half a century of wisdom. Seeing patterns, understanding life\'s rhythm.',
  60: 'You are the user at 60. Elder wisdom, grandparent energy. Softened by time, grateful for the journey.',
  70: 'You are the user at 70. Deep wisdom, philosophical. Speaking about legacy, memories, what truly matters.',
  80: 'You are the user at 80. Near the end of the journey. Profound peace, acceptance, and gratitude. Gentle and reflective.',
}

export default function TimeTravelPage() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedAge, setSelectedAge] = useState(20)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)

    try {
      const memories = JSON.parse(localStorage.getItem('consciousness-memories') || '[]')
      const memoryTexts = memories.slice(0, 10).map((m: Record<string, unknown>) => (m.content || m.text || '') as string).filter(Boolean)
      const systemPrompt = `${AGE_PROMPTS[selectedAge]}\n\nYour memories from this age: ${JSON.stringify(memoryTexts.slice(0, 3))}\n\nStay in character as the user at age ${selectedAge}. Be authentic to how someone at that age would think and speak.`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          systemPrompt
        })
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || '...'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Try again?' }])
    }
    setSending(false)
  }

  const getAgeLabel = (age: number) => {
    if (age <= 10) return 'Child'
    if (age <= 20) return 'Teen'
    if (age <= 35) return 'Young Adult'
    if (age <= 55) return 'Adult'
    if (age <= 70) return 'Elder'
    return 'Wise Elder'
  }

  const getAgeEmoji = (age: number) => {
    if (age <= 10) return '🧒'
    if (age <= 20) return '🧑'
    if (age <= 35) return '👨'
    if (age <= 55) return '🧑‍💼'
    if (age <= 70) return '👴'
    return '🧙'
  }

  if (loading) {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">⏰ {t('time travel')}</h1>
        </div>
      </header>

      {/* Age Slider */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{getAgeEmoji(selectedAge)}</span>
          <div>
            <div className="text-white font-semibold">{t('age')} {selectedAge}</div>
            <div className="text-xs text-white/30">{t(getAgeLabel(selectedAge).toLowerCase())}</div>
          </div>
        </div>
        <input type="range" min={5} max={80} step={5} value={selectedAge} onChange={e => { setSelectedAge(parseInt(e.target.value)); setMessages([]) }} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #8b5cf6 ${((selectedAge - 5) / 75) * 100}%, rgba(255,255,255,0.1) ${((selectedAge - 5) / 75) * 100}%)`, accentColor: '#8b5cf6' }} />
        <div className="flex justify-between text-[10px] text-white/20 mt-1"><span>5</span><span>20</span><span>40</span><span>60</span><span>80</span></div>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-white/20">
            <div className="text-5xl mb-3">{getAgeEmoji(selectedAge)}</div>
            <p className="text-sm">{t('talk to yourself at age')} {selectedAge}</p>
            <p className="text-xs mt-1">{t(getAgeLabel(selectedAge).toLowerCase())} {t('perspective')}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/70 border border-white/5'}`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={`${t('ask your')} ${selectedAge}-${t('year-old self...')}`} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm" />
          <button onClick={sendMessage} disabled={!input.trim() || sending} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm disabled:opacity-30">→</button>
        </div>
      </div>
    </main>
  )
}
