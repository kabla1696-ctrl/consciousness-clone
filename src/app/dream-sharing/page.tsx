'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Dream {
  id: string
  title: string
  content: string
  category: string
  reactions: { '🤯': number; '💭': number; '😱': number; '❤️': number }
  author: string
  authorAvatar: string
  aiAnalysis: string
  createdAt: string
  trending: boolean
}

const DREAM_CATEGORIES = ['All', 'Lucid', 'Nightmare', 'Adventure', 'Romantic', 'Weird']
const CAT_EMOJIS: Record<string, string> = {
  Lucid: '🌀',
  Nightmare: '👹',
  Adventure: '🗺️',
  Romantic: '💕',
  Weird: '🦑',
}
const CAT_COLORS: Record<string, string> = {
  Lucid: '#06b6d4',
  Nightmare: '#ef4444',
  Adventure: '#10b981',
  Romantic: '#ec4899',
  Weird: '#a855f7',
}
const REACTIONS = ['🤯', '💭', '😱', '❤️'] as const

const LS_KEY = 'cc_dream_sharing'

function loadDreams(): Dream[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LS_KEY)
    if (stored) return JSON.parse(stored)
    return DEFAULT_DREAMS
  } catch { return DEFAULT_DREAMS }
}

function saveDreams(dreams: Dream[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(dreams))
}

function analyzeDream(content: string, category: string): string {
  const analyses: Record<string, string[]> = {
    Lucid: [
      'Your subconscious is signaling heightened self-awareness. This dream suggests you\'re gaining control over aspects of your waking life.',
      'A lucid dream of this nature indicates strong metacognitive abilities. Your mind is testing boundaries between reality and imagination.',
      'The clarity of this dream reflects a period of mental acuity. Your brain is processing complex emotions with unusual precision.',
    ],
    Nightmare: [
      'This nightmare appears to be processing unresolved anxieties. The recurring motifs suggest your mind is rehearsing threat responses.',
      'The darkness in this dream is actually protective — your subconscious is working through fears in a safe space. Growth through shadow.',
      'Nightmares of this intensity often precede breakthroughs. Your psyche is clearing emotional debris before a transformation.',
    ],
    Adventure: [
      'Your adventurous dream reflects a deep need for novelty and exploration. Your subconscious is craving new experiences.',
      'The journey motif suggests you\'re in a transitional phase. Your mind is mapping unknown territory before you take action.',
      'Adventure dreams like this indicate high openness to experience. Your creativity is seeking an outlet.',
    ],
    Romantic: [
      'This romantic dream reflects deep emotional needs being processed. It may symbolize a desire for connection, not necessarily romantic.',
      'The intimacy in this dream suggests your heart is opening to vulnerability. Emotional growth is happening beneath the surface.',
      'Romantic dreams often represent self-love and acceptance. The other figure may represent an aspect of yourself you\'re embracing.',
    ],
    Weird: [
      'Your brain is in creative overdrive. Weird dreams are the hallmark of an active imagination making novel connections.',
      'The surreal elements suggest your mind is breaking conventional patterns. This is how innovation feels from the inside.',
      'Embrace the weirdness — these dreams indicate high cognitive flexibility. Your brain is stress-testing reality by bending it.',
    ],
  }
  const pool = analyses[category] || analyses['Weird']
  const hash = content.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return pool[hash % pool.length]
}

const DEFAULT_DREAMS: Dream[] = [
  {
    id: '1', title: 'Flying Over a City of Glass', content: 'I was soaring above a city made entirely of crystal. Each building hummed a different frequency. When I touched one, it sang my name. The sky was purple and the clouds tasted like cotton candy.',
    category: 'Lucid', reactions: { '🤯': 42, '💭': 28, '😱': 5, '❤️': 67 },
    author: 'Luna Starweaver', authorAvatar: '🌙',
    aiAnalysis: 'Your subconscious is signaling heightened self-awareness. This dream suggests you\'re gaining control over aspects of your waking life.',
    createdAt: '2024-04-15', trending: true,
  },
  {
    id: '2', title: 'The Endless Staircase', content: 'I kept going down stairs that multiplied. Each landing had a door showing a different version of my life. Behind one door, I was a fish. Behind another, I was 90 years old. I woke up before choosing.',
    category: 'Weird', reactions: { '🤯': 89, '💭': 56, '😱': 34, '❤️': 23 },
    author: 'Cipher', authorAvatar: '🔮',
    aiAnalysis: 'Your brain is in creative overdrive. Weird dreams are the hallmark of an active imagination making novel connections.',
    createdAt: '2024-04-14', trending: true,
  },
  {
    id: '3', title: 'Chased Through Red Forest', content: 'Trees with crimson leaves. Something invisible was following me. Every time I looked back, footprints appeared in mud that wasn\'t there before. My legs were heavy like concrete.',
    category: 'Nightmare', reactions: { '🤯': 12, '💭': 19, '😱': 78, '❤️': 8 },
    author: 'Shadow Walker', authorAvatar: '👤',
    aiAnalysis: 'This nightmare appears to be processing unresolved anxieties. The recurring motifs suggest your mind is rehearsing threat responses.',
    createdAt: '2024-04-13', trending: false,
  },
  {
    id: '4', title: 'Dancing in the Rain with You', content: 'We were dancing barefoot on wet cobblestones. Every raindrop that hit the ground turned into a tiny flower. You whispered something I couldn\'t hear, but I felt it in my chest like warm honey.',
    category: 'Romantic', reactions: { '🤯': 8, '💭': 45, '😱': 2, '❤️': 156 },
    author: 'Rose Quartz', authorAvatar: '🌹',
    aiAnalysis: 'This romantic dream reflects deep emotional needs being processed. It may symbolize a desire for connection, not necessarily romantic.',
    createdAt: '2024-04-12', trending: true,
  },
  {
    id: '5', title: 'Exploring an Underwater Temple', content: 'I could breathe underwater. A sunken temple covered in bioluminescent coral. Inside, fish with human faces were reading books. They invited me to a feast of light.',
    category: 'Adventure', reactions: { '🤯': 67, '💭': 45, '😱': 12, '❤️': 89 },
    author: 'Deep Diver', authorAvatar: '🐠',
    aiAnalysis: 'Your adventurous dream reflects a deep need for novelty and exploration. Your subconscious is craving new experiences.',
    createdAt: '2024-04-11', trending: false,
  },
  {
    id: '6', title: 'The Library of Forgotten Names', content: 'An infinite library where each book contained the name of someone I\'d forgotten. When I opened one, I remembered their face, their laugh, the way they smelled. I woke up crying.',
    category: 'Lucid', reactions: { '🤯': 34, '💭': 78, '😱': 15, '❤️': 112 },
    author: 'Memory Keeper', authorAvatar: '📚',
    aiAnalysis: 'A lucid dream of this nature indicates strong metacognitive abilities. Your mind is testing boundaries between reality and imagination.',
    createdAt: '2024-04-10', trending: true,
  },
]

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="absolute rounded-full animate-float" style={{
          width: `${2 + Math.random() * 5}px`,
          height: `${2 + Math.random() * 5}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `radial-gradient(circle, ${['#8b5cf6', '#ec4899', '#06b6d4', '#a855f7'][i % 4]}88, transparent)`,
          animationDuration: `${5 + Math.random() * 7}s`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
    </div>
  )
}

export default function DreamSharing() {
  const t = useT()
  const [dreams, setDreams] = useState<Dream[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCompose, setShowCompose] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('Lucid')
  const [expandedDream, setExpandedDream] = useState<string | null>(null)
  const [showTrending, setShowTrending] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const loaded = loadDreams()
    if (loaded.length === 0) {
      saveDreams(DEFAULT_DREAMS)
      setDreams(DEFAULT_DREAMS)
    } else {
      setDreams(loaded)
    }
    setTimeout(() => setAnimateIn(true), 50)
  }, [])

  const filtered = dreams
    .filter(d => selectedCategory === 'All' || d.category === selectedCategory)
    .filter(d => !showTrending || d.trending)
    .sort((a, b) => {
      const aTotal = Object.values(a.reactions).reduce((s, v) => s + v, 0)
      const bTotal = Object.values(b.reactions).reduce((s, v) => s + v, 0)
      return bTotal - aTotal
    })

  const reactToDream = (dreamId: string, reaction: typeof REACTIONS[number]) => {
    const updated = dreams.map(d => {
      if (d.id === dreamId) {
        return { ...d, reactions: { ...d.reactions, [reaction]: d.reactions[reaction] + 1 } }
      }
      return d
    })
    setDreams(updated)
    saveDreams(updated)
  }

  const shareDream = () => {
    if (!newTitle.trim() || !newContent.trim()) return
    const dream: Dream = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category: newCategory,
      reactions: { '🤯': 0, '💭': 0, '😱': 0, '❤️': 0 },
      author: 'You',
      authorAvatar: '✨',
      aiAnalysis: analyzeDream(newContent, newCategory),
      createdAt: new Date().toISOString().split('T')[0],
      trending: false,
    }
    const updated = [dream, ...dreams]
    setDreams(updated)
    saveDreams(updated)
    setNewTitle('')
    setNewContent('')
    setShowCompose(false)
  }

  const totalReactions = (d: Dream) => Object.values(d.reactions).reduce((s, v) => s + v, 0)

  return (
    <div className="min-h-screen relative" style={{ background: '#050510' }}>
      <Particles />
      <style jsx global>{`
        @keyframes float { 0%,100% { transform: translateY(0) scale(1); opacity: .5; } 50% { transform: translateY(-25px) scale(1.3); opacity: 1; } }
        @keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 10px rgba(168,85,247,.3); } 50% { box-shadow: 0 0 25px rgba(168,85,247,.6); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp .5s ease forwards; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .glass { background: rgba(255,255,255,.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.08); }
        .glass-strong { background: rgba(255,255,255,.08); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,.12); }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            💭 {t('dream sharing')}
          </h1>
          <button onClick={() => setShowCompose(true)} className="p-2 text-purple-400 hover:text-purple-300 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </header>

      <main className={`relative z-10 px-4 pb-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Tabs */}
        <div className="flex gap-2 mt-4 mb-4">
          <button
            onClick={() => setShowTrending(false)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              !showTrending ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'glass text-white/50'
            }`}
          >
            🌍 All Dreams
          </button>
          <button
            onClick={() => setShowTrending(true)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              showTrending ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : 'glass text-white/50'
            }`}
          >
            🔥 Trending
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {DREAM_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'glass text-white/60 hover:text-white'
              }`}
            >
              {cat !== 'All' && CAT_EMOJIS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Dreams Feed */}
        <div className="space-y-4">
          {filtered.map((dream, i) => (
            <div
              key={dream.id}
              className="glass rounded-2xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="p-4">
                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{dream.authorAvatar}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{dream.author}</p>
                    <p className="text-white/30 text-xs">{dream.createdAt}</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-medium" style={{
                    background: `${CAT_COLORS[dream.category]}20`,
                    color: CAT_COLORS[dream.category],
                  }}>
                    {CAT_EMOJIS[dream.category]} {dream.category}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold mb-2">{dream.title}</h3>
                <p className={`text-white/60 text-sm leading-relaxed ${expandedDream !== dream.id ? 'line-clamp-3' : ''}`}>
                  {dream.content}
                </p>
                <button
                  onClick={() => setExpandedDream(expandedDream === dream.id ? null : dream.id)}
                  className="text-purple-400 text-xs mt-1 hover:text-purple-300"
                >
                  {expandedDream === dream.id ? 'Show less' : t('interpret') + '...'}
                </button>

                {/* AI Analysis */}
                {expandedDream === dream.id && (
                  <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 animate-slide-up">
                    <p className="text-purple-300 text-xs font-medium mb-1">🤖 {t('interpret')}</p>
                    <p className="text-white/60 text-xs leading-relaxed">{dream.aiAnalysis}</p>
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center gap-2 mt-4">
                  {REACTIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => reactToDream(dream.id, r)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-all active:scale-95"
                    >
                      <span className="text-base">{r}</span>
                      <span className="text-white/50 text-xs">{dream.reactions[r]}</span>
                    </button>
                  ))}
                  <span className="ml-auto text-white/20 text-xs">{totalReactions(dream)} reactions</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowCompose(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-strong rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">✨ {t('share dreams')}</h2>

            <input
              type="text"
              placeholder={t('dream title')}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none border border-white/10 focus:border-purple-500/50 mb-3 text-sm"
            />

            <textarea
              placeholder={t('dream sharing placeholder')}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={4}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none border border-white/10 focus:border-purple-500/50 mb-3 text-sm resize-none"
            />

            <div className="flex gap-2 flex-wrap mb-4">
              {DREAM_CATEGORIES.slice(1).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    newCategory === cat
                      ? 'text-white shadow-lg'
                      : 'glass text-white/50'
                  }`}
                  style={newCategory === cat ? { background: `${CAT_COLORS[cat]}80` } : {}}
                >
                  {CAT_EMOJIS[cat]} {cat}
                </button>
              ))}
            </div>

            <button
              onClick={shareDream}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="w-full py-3 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
            >
              {t('share dreams')} 💭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
