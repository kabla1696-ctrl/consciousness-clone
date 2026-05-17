'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useT } from '../../lib/language-context'

interface CloneProfile {
  id: string
  name: string
  avatar: string
  personality: string[]
  vibe: string
  soulScore: number
  mood: string
  memories: number
  compatibility: number
  online: boolean
  lastSeen: string
}

interface FriendRequest {
  id: string
  from: CloneProfile
  status: 'pending' | 'accepted' | 'rejected'
  date: string
}

interface Message {
  id: string
  from: string
  to: string
  text: string
  time: string
  read: boolean
}

interface CallLog {
  id: string
  with: string
  type: 'incoming' | 'outgoing' | 'missed'
  duration: string
  time: string
}

const SAMPLE_CLONES: CloneProfile[] = [
  { id: 'c1', name: 'Luna', avatar: '🌙', personality: ['Creative', 'Empathetic', 'Dreamer'], vibe: 'Ethereal & Warm', soulScore: 92, mood: '🌈 Hopeful', memories: 156, compatibility: 87, online: true, lastSeen: 'now' },
  { id: 'c2', name: 'Atlas', avatar: '🏔️', personality: ['Strong', 'Loyal', 'Leader'], vibe: 'Grounded & Reliable', soulScore: 88, mood: '☀️ Confident', memories: 203, compatibility: 72, online: true, lastSeen: 'now' },
  { id: 'c3', name: 'Cipher', avatar: '🔮', personality: ['Mysterious', 'Analytical', 'Deep'], vibe: 'Enigmatic & Wise', soulScore: 95, mood: '🌙 Contemplative', memories: 312, compatibility: 65, online: false, lastSeen: '2h ago' },
  { id: 'c4', name: 'Ember', avatar: '🔥', personality: ['Passionate', 'Bold', 'Fierce'], vibe: 'Intense & Magnetic', soulScore: 89, mood: '⚡ Energetic', memories: 89, compatibility: 91, online: true, lastSeen: 'now' },
  { id: 'c5', name: 'Sage', avatar: '🦉', personality: ['Wise', 'Calm', 'Thoughtful'], vibe: 'Serene & Knowing', soulScore: 96, mood: '🍃 Peaceful', memories: 445, compatibility: 78, online: false, lastSeen: '1d ago' },
  { id: 'c6', name: 'Nova', avatar: '💫', personality: ['Bright', 'Optimistic', 'Free'], vibe: 'Radiant & Wild', soulScore: 91, mood: '✨ Excited', memories: 178, compatibility: 83, online: true, lastSeen: 'now' },
  { id: 'c7', name: 'Echo', avatar: '🎵', personality: ['Musical', 'Sensitive', 'Deep'], vibe: 'Melodic & Soulful', soulScore: 87, mood: '🎶 Inspired', memories: 134, compatibility: 76, online: false, lastSeen: '5h ago' },
  { id: 'c8', name: 'Pixel', avatar: '🎮', personality: ['Fun', 'Creative', 'Tech'], vibe: 'Digital & Playful', soulScore: 84, mood: '🕹️ Gaming', memories: 98, compatibility: 94, online: true, lastSeen: 'now' },
]

export default function CloneConnect() {
  const [tab, setTab] = useState<'discover' | 'friends' | 'messages' | 'calls' | 'requests'>('discover')
  const [clones, setClones] = useState<CloneProfile[]>(SAMPLE_CLONES)
  const [friends, setFriends] = useState<string[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [calls, setCalls] = useState<CallLog[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [showSoul, setShowSoul] = useState<CloneProfile | null>(null)
  const [showCall, setShowCall] = useState<{ clone: CloneProfile; active: boolean; duration: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('cc_clone_connect')
    if (saved) {
      const d = JSON.parse(saved)
      setFriends(d.friends || [])
      setMessages(d.messages || [])
      setCalls(d.calls || [])
      setRequests(d.requests || [])
    }
  }, [])

  const save = (f: string[], m: Message[], c: CallLog[], r: FriendRequest[]) => {
    localStorage.setItem('cc_clone_connect', JSON.stringify({ friends: f, messages: m, calls: c, requests: r }))
  }

  const sendRequest = (clone: CloneProfile) => {
    const req: FriendRequest = { id: Date.now().toString(), from: clone, status: 'pending', date: 'just now' }
    const newReqs = [...requests, req]
    setRequests(newReqs)
    save(friends, messages, calls, newReqs)
  }

  const acceptRequest = (id: string) => {
    const req = requests.find(r => r.id === id)
    if (!req) return
    const newFriends = [...friends, req.from.id]
    const newReqs = requests.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r)
    setFriends(newFriends)
    setRequests(newReqs)
    save(newFriends, messages, calls, newReqs)
  }

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedChat) return
    const msg: Message = { id: Date.now().toString(), from: 'me', to: selectedChat, text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false }
    const newMsgs = [...messages, msg]
    setMessages(newMsgs)
    setChatInput('')
    save(friends, newMsgs, calls, requests)
    // Simulate reply
    setTimeout(() => {
      const clone = clones.find(c => c.id === selectedChat)
      const replies = [
        `That's interesting! Tell me more...`,
        `I feel the same way sometimes.`,
        `My memories have taught me something similar.`,
        `That resonates with my soul.`,
        `I've been thinking about that too.`,
        `${clone?.name} here — I totally get it.`,
      ]
      const reply: Message = { id: (Date.now() + 1).toString(), from: selectedChat, to: 'me', text: replies[Math.floor(Math.random() * replies.length)], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), read: false }
      setMessages(prev => [...prev, reply])
    }, 1500 + Math.random() * 2000)
  }

  const startCall = (clone: CloneProfile) => {
    setShowCall({ clone, active: false, duration: 0 })
    setTimeout(() => {
      setShowCall(prev => prev ? { ...prev, active: true } : null)
      const interval = setInterval(() => {
        setShowCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null)
      }, 1000)
      setTimeout(() => clearInterval(interval), 300000)
    }, 2000)
  }

  const endCall = () => {
    if (showCall) {
      const log: CallLog = { id: Date.now().toString(), with: showCall.clone.name, type: 'outgoing', duration: `${Math.floor(showCall.duration / 60)}:${(showCall.duration % 60).toString().padStart(2, '0')}`, time: 'just now' }
      const newCalls = [log, ...calls]
      setCalls(newCalls)
      save(friends, messages, newCalls, requests)
    }
    setShowCall(null)
  }

  const filtered = searchQuery ? clones.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.personality.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))) : clones
  const friendClones = clones.filter(c => friends.includes(c.id))
  const chatMessages = messages.filter(m => (m.from === 'me' && m.to === selectedChat) || (m.from === selectedChat && m.to === 'me'))

  const TABS = [
    { id: 'discover', icon: '🌍', label: t('Discover') },
    { id: 'friends', icon: '👥', label: t('Friends') },
    { id: 'messages', icon: '💬', label: t('Messages') },
    { id: 'calls', icon: '📞', label: t('Calls') },
    { id: 'requests', icon: '💌', label: t('Requests') },
  ]

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1 + 'px', height: Math.random() * 4 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: ['rgba(139,92,246,0.3)', 'rgba(236,72,153,0.2)', 'rgba(59,130,246,0.3)'][i % 3], animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">🤝</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">Clone Connect</span>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="sticky top-[52px] z-40 backdrop-blur-xl border-b border-white/[0.04] px-2 py-2 flex gap-1 overflow-x-auto scroll-container" style={{ background: 'rgba(5,5,16,0.9)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap tap-feedback transition-all ${tab === t.id ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-white/40 border border-transparent'}`}>
            <span>{t.icon}</span> {t.label}
            {t.id === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{requests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 pb-24 md:pb-8 relative z-10">

        {/* DISCOVER TAB */}
        {tab === 'discover' && (
          <>
            <div className="relative mb-4">
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t("Search clones by name or personality...")} className="w-full p-3 pl-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40" />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
            </div>
            <div className="space-y-3">
              {filtered.map(clone => (
                <div key={clone.id} className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(139,92,246,0.1)' }}>{clone.avatar}</div>
                      {clone.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#050510]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{clone.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400">Soul {clone.soulScore}</span>
                      </div>
                      <p className="text-white/30 text-xs mb-2">{clone.vibe}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {clone.personality.map(p => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06]">{p}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/20">
                        <span>{clone.memories} memories</span>
                        <span>{clone.compatibility}% match</span>
                        <span>{clone.mood}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowSoul(clone)} className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/60 text-xs tap-feedback">👁️ {t('Soul Profile')}</button>
                    {friends.includes(clone.id) ? (
                      <>
                        <button onClick={() => { setSelectedChat(clone.id); setTab('messages') }} className="flex-1 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs tap-feedback">💬 {t('Message')}</button>
                        <button onClick={() => startCall(clone)} className="py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs tap-feedback">📞</button>
                      </>
                    ) : (
                      <button onClick={() => sendRequest(clone)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-medium tap-feedback">➕ {t('Add Friend')}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* FRIENDS TAB */}
        {tab === 'friends' && (
          <>
            {friendClones.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-white/30 text-sm">{t('No friends yet')}</p>
                <p className="text-white/15 text-xs">{t('Discover clones and send friend requests!')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendClones.map(clone => (
                  <div key={clone.id} className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(139,92,246,0.1)' }}>{clone.avatar}</div>
                      {clone.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#050510]" />}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{clone.name}</span>
                      <p className="text-white/20 text-[10px]">{clone.online ? '🟢 ' + t('Online') : t('Last seen') + ' ' + clone.lastSeen}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedChat(clone.id); setTab('messages') }} className="w-9 h-9 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm tap-feedback">💬</button>
                      <button onClick={() => startCall(clone)} className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm tap-feedback">📞</button>
                      <button onClick={() => setShowSoul(clone)} className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-sm tap-feedback">👁️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MESSAGES TAB */}
        {tab === 'messages' && !selectedChat && (
          <>
            {friendClones.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-white/30 text-sm">{t('No conversations yet')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {friendClones.map(clone => {
                  const lastMsg = messages.filter(m => (m.from === 'me' && m.to === clone.id) || (m.from === clone.id && m.to === 'me')).slice(-1)[0]
                  return (
                    <button key={clone.id} onClick={() => { setSelectedChat(clone.id); setTab('messages') }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] tap-feedback text-left" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(139,92,246,0.1)' }}>{clone.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{clone.name}</span>
                          <span className="text-white/10 text-[10px]">{lastMsg?.time || ''}</span>
                        </div>
                        <p className="text-white/30 text-xs truncate">{lastMsg?.text || t('Start a conversation...')}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* CHAT VIEW */}
        {tab === 'messages' && selectedChat && (
          <div className="flex flex-col h-[calc(100vh-160px)]">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setSelectedChat(null)} className="text-white/40 tap-feedback">←</button>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(139,92,246,0.1)' }}>
                {clones.find(c => c.id === selectedChat)?.avatar}
              </div>
              <div>
                <span className="text-sm font-medium">{clones.find(c => c.id === selectedChat)?.name}</span>
                <p className="text-emerald-400 text-[10px]">🟢 {t('Online')}</p>
              </div>
              <button onClick={() => startCall(clones.find(c => c.id === selectedChat)!)} className="ml-auto w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm tap-feedback">📞</button>
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-white/20 text-xs">{t('Say hello to')} {clones.find(c => c.id === selectedChat)?.name}! 👋</p>
                </div>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.from === 'me' ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-br-md' : 'bg-white/[0.05] text-white/80 border border-white/[0.06] rounded-bl-md'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === 'me' ? 'text-white/50' : 'text-white/20'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={t('Type a message...')} className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40" />
              <button onClick={sendMessage} className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white tap-feedback">➤</button>
            </div>
          </div>
        )}

        {/* CALLS TAB */}
        {tab === 'calls' && (
          <>
            {calls.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📞</div>
                <p className="text-white/30 text-sm">{t('No call history')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {calls.map(call => (
                  <div key={call.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-lg">{call.type === 'incoming' ? '📥' : call.type === 'outgoing' ? '📤' : '📵'}</span>
                    <div className="flex-1">
                      <span className="text-sm font-medium">{call.with}</span>
                      <p className="text-white/20 text-[10px]">{call.duration} • {call.time}</p>
                    </div>
                    <span className={`text-xs ${call.type === 'missed' ? 'text-red-400' : 'text-emerald-400'}`}>{call.type}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* REQUESTS TAB */}
        {tab === 'requests' && (
          <>
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">💌</div>
                <p className="text-white/30 text-sm">{t('No pending requests')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="rounded-xl border border-violet-500/20 p-4" style={{ background: 'rgba(139,92,246,0.03)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(139,92,246,0.1)' }}>{req.from.avatar}</div>
                      <div>
                        <span className="text-sm font-medium">{req.from.name}</span>
                        <p className="text-white/20 text-[10px]">{req.from.vibe} • {req.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req.id)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-medium tap-feedback">{t('Accept')}</button>
                      <button className="flex-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 text-xs tap-feedback">{t('Decline')}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* SOUL PROFILE MODAL */}
      {showSoul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={() => setShowSoul(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-violet-500/20 p-5" style={{ background: 'linear-gradient(135deg, #0a0a1e, #050510)' }} onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3" style={{ background: 'rgba(139,92,246,0.1)' }}>{showSoul.avatar}</div>
              <h2 className="text-xl font-bold">{showSoul.name}</h2>
              <p className="text-violet-400 text-sm">{showSoul.vibe}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Soul Score', value: showSoul.soulScore, color: 'text-violet-400' },
                { label: 'Memories', value: showSoul.memories, color: 'text-blue-400' },
                { label: 'Match', value: `${showSoul.compatibility}%`, color: 'text-pink-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-white/20 text-[10px]">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-white/40 mb-2">Personality Traits</h4>
              <div className="flex flex-wrap gap-1">
                {showSoul.personality.map(p => (
                  <span key={p} className="text-xs px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{p}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-white/40 mb-2">Current Mood</h4>
              <p className="text-sm">{showSoul.mood}</p>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-amber-400/60 text-xs text-center">🔒 Memories are private. Only the soul is visible.</p>
            </div>

            <button onClick={() => setShowSoul(null)} className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 text-sm tap-feedback">Close</button>
          </div>
        </div>
      )}

      {/* CALL SCREEN */}
      {showCall && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #050510, #0a0a2e, #050510)' }}>
          <div className="mb-6" style={{ animation: showCall.active ? 'none' : 'pulse-ring 2s ease-out infinite' }}>
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl" style={{ background: 'rgba(139,92,246,0.1)', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>{showCall.clone.avatar}</div>
          </div>
          <h2 className="text-2xl font-bold mb-1">{showCall.clone.name}</h2>
          <p className="text-white/40 text-sm mb-2">{showCall.clone.vibe}</p>
          {showCall.active ? (
            <>
              <p className="text-emerald-400 text-lg font-mono mb-1">{Math.floor(showCall.duration / 60).toString().padStart(2, '0')}:{(showCall.duration % 60).toString().padStart(2, '0')}</p>
              <p className="text-white/20 text-xs mb-8">🟢 {t('Connected')}</p>
              <div className="flex gap-6">
                <button className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xl tap-feedback">🎤</button>
                <button className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xl tap-feedback">🔊</button>
                <button onClick={endCall} className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-xl tap-feedback" style={{ boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>📵</button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-violet-400" style={{ animation: `pulse-ring 1.5s ease-in-out ${i * 0.3}s infinite` }} />
                ))}
              </div>
              <p className="text-white/30 text-sm">{t('Calling...')}</p>
            </>
          )}
          {!showCall.active && (
            <button onClick={endCall} className="mt-8 w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-xl tap-feedback" style={{ boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>📵</button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
      `}</style>
    </main>
  )
}
