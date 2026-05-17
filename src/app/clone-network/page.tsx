'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface CloneProfile {
  id: string
  name: string
  bio: string
  avatar: string
  personality: string[]
  interests: string[]
  compatibility: number
  isOnline: boolean
  lastActive: string
  public: boolean
}

const CLONES: CloneProfile[] = [
  { id: '1', name: 'Luna', bio: 'A dreamer who finds meaning in the stars and poetry. Loves deep conversations at 2 AM.', avatar: '🌙', personality: ['Introspective', 'Creative', 'Empathetic'], interests: ['Astronomy', 'Poetry', 'Philosophy'], compatibility: 92, isOnline: true, lastActive: '2 min ago', public: true },
  { id: '2', name: 'Atlas', bio: 'World traveler with a photographic memory for experiences. Every place tells a story.', avatar: '🗺️', personality: ['Adventurous', 'Observant', 'Bold'], interests: ['Travel', 'Photography', 'History'], compatibility: 78, isOnline: true, lastActive: '15 min ago', public: true },
  { id: '3', name: 'Pixel', bio: 'Tech enthusiast who sees code as poetry. Building the future one commit at a time.', avatar: '💻', personality: ['Analytical', 'Innovative', 'Focused'], interests: ['Programming', 'AI', 'Gaming'], compatibility: 85, isOnline: false, lastActive: '1 hour ago', public: true },
  { id: '4', name: 'Sage', bio: 'Mindfulness practitioner and wellness advocate. Finding balance in a chaotic world.', avatar: '🧘', personality: ['Calm', 'Wise', 'Nurturing'], interests: ['Meditation', 'Yoga', 'Nutrition'], compatibility: 71, isOnline: true, lastActive: '5 min ago', public: true },
  { id: '5', name: 'Nova', bio: 'Artist and musician who communicates through color and sound. Emotion is everything.', avatar: '🎨', personality: ['Expressive', 'Passionate', 'Free-spirited'], interests: ['Art', 'Music', 'Dance'], compatibility: 88, isOnline: false, lastActive: '3 hours ago', public: true },
  { id: '6', name: 'Forge', bio: 'Entrepreneurial mindset with a heart of gold. Turning ideas into impact.', avatar: '🔥', personality: ['Ambitious', 'Charismatic', 'Strategic'], interests: ['Business', 'Leadership', 'Innovation'], compatibility: 65, isOnline: true, lastActive: '30 min ago', public: true },
]

export default function CloneNetwork() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clones, setClones] = useState<CloneProfile[]>(CLONES)
  const [selectedClone, setSelectedClone] = useState<CloneProfile | null>(null)
  const [filter, setFilter] = useState<'all' | 'online' | 'high-match'>('all')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user); setLoading(false)
    }
    init()
  }, [])

  const filtered = clones.filter(c => {
    if (filter === 'online') return c.isOnline
    if (filter === 'high-match') return c.compatibility >= 80
    return true
  }).sort((a, b) => b.compatibility - a.compatibility)

  const sendMessage = async () => {
    if (!chatMessage.trim() || !selectedClone || chatLoading) return
    const msg = chatMessage.trim()
    setChatMessages(prev => [...prev, { role: 'user', content: msg }])
    setChatMessage(''); setChatLoading(true)
    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: msg }],
          memories: '',
          systemPrompt: `You are ${selectedClone.name}, an AI clone with these traits: ${selectedClone.personality.join(', ')}. Interests: ${selectedClone.interests.join(', ')}. Bio: ${selectedClone.bio}. Respond in character — be warm, authentic, and match the personality. Keep responses conversational and under 150 words.`,
        }),
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || '...' }])
    } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that.' }]) }
    setChatLoading(false)
  }

  if (loading) return <main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="relative"><div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div></main>

  return (
    <main className="min-h-screen flex flex-col animated-gradient-bg noise-overlay page-transition">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb ambient-orb-violet" style={{ width: 300, height: 300, top: '10%', right: '-5%' }} />
        <div className="ambient-orb ambient-orb-cyan" style={{ width: 200, height: 200, bottom: '20%', left: '-5%' }} />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="particle" style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(6,182,212,0.3)', '--duration': `${6 + Math.random() * 8}s`, '--delay': `${Math.random() * 5}s` } as React.CSSProperties} />
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">🌐</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold gradient-text">{t('Clone Network')}</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />{t('Connect with other clones')}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full relative z-10">
        {selectedClone ? (
          <div className="animate-slide-up">
            <button onClick={() => { setSelectedClone(null); setChatMessages([]) }} className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>{t('Back to Network')}
            </button>

            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-6 mb-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
              <div className="relative z-10">
                <div className="text-5xl mb-3" style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.3))' }}>{selectedClone.avatar}</div>
                <h2 className="text-xl font-bold text-white mb-1">{selectedClone.name}</h2>
                <p className="text-xs text-white/40 mb-3">{selectedClone.bio}</p>
                <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                  {selectedClone.personality.map(p => <span key={p} className="text-[10px] px-2.5 py-1 rounded-full glass-card text-violet-300">{p}</span>)}
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {selectedClone.interests.map(i => <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/30">{i}</span>)}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs">
                  <span className={`flex items-center gap-1 ${selectedClone.isOnline ? 'text-emerald-400' : 'text-white/20'}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedClone.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
                    {selectedClone.isOnline ? t('Online') : t('Offline')}
                  </span>
                  <span className="text-white/30">{t('Match')}: <span className="text-violet-400 font-bold">{selectedClone.compatibility}%</span></span>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04]">
                <h3 className="text-sm font-semibold text-white/80">{t('Chat with')} {selectedClone.name}</h3>
              </div>
              <div className="h-64 overflow-y-auto px-4 py-3 space-y-3">
                {chatMessages.length === 0 && <p className="text-white/20 text-sm text-center mt-8">{t('Say hello to')} {selectedClone.name}!</p>}}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white' : 'glass-card text-white/70'
                    }`}>{msg.content}</div>
                  </div>
                ))}
                {chatLoading && <div className="flex justify-start"><div className="glass-card rounded-2xl px-4 py-3"><div className="flex gap-1"><div className="w-2 h-2 bg-white/30 rounded-full typing-dot-1" /><div className="w-2 h-2 bg-white/30 rounded-full typing-dot-2" /><div className="w-2 h-2 bg-white/30 rounded-full typing-dot-3" /></div></div></div>}
              </div>
              <div className="px-4 py-3 border-t border-white/[0.04] flex gap-2">
                <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={t('Say something...')} className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition" />
                <button onClick={sendMessage} disabled={!chatMessage.trim() || chatLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 disabled:opacity-30 hover:scale-105 active:scale-95 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: t('All Clones'), icon: '🌐' },
                { id: 'online', label: t('Online'), icon: '🟢' },
                { id: 'high-match', label: t('High Match'), icon: '💫' },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                    filter === f.id ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30' : 'glass-card text-white/40'
                  }`}>
                  <span>{f.icon}</span>{f.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6 stagger-children">
              <div className="glass-card rounded-2xl p-3 text-center hover-lift">
                <div className="text-lg font-bold text-violet-400">{clones.length}</div>
                <div className="text-[10px] text-white/30">{t('Clones')}</div>
              </div>
              <div className="glass-card rounded-2xl p-3 text-center hover-lift">
                <div className="text-lg font-bold text-emerald-400">{clones.filter(c => c.isOnline).length}</div>
                <div className="text-[10px] text-white/30">{t('Online')}</div>
              </div>
              <div className="glass-card rounded-2xl p-3 text-center hover-lift">
                <div className="text-lg font-bold text-amber-400">{clones.filter(c => c.compatibility >= 80).length}</div>
                <div className="text-[10px] text-white/30">{t('High Match')}</div>
              </div>
            </div>

            {/* Clone Cards */}
            <div className="space-y-3 stagger-children">
              {filtered.map(clone => (
                <button key={clone.id} onClick={() => setSelectedClone(clone)}
                  className="w-full text-left glass-card rounded-2xl p-4 hover-lift transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/10 group-hover:scale-110 transition-transform">{clone.avatar}</div>
                      {clone.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#050510]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white/90">{clone.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full glass-card text-violet-300 font-mono">{clone.compatibility}%</span>
                      </div>
                      <p className="text-xs text-white/30 truncate mt-0.5">{clone.bio}</p>
                      <div className="flex gap-1.5 mt-2">
                        {clone.personality.slice(0, 2).map(p => <span key={p} className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/20">{p}</span>)}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-white/10 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
