'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CloneProfile {
  id: string
  name: string
  avatar: string
  personality: string
  memoryCount: number
  rating: number
  compatibility: number
  online: boolean
  bio: string
  interests: string[]
}

const SIMULATED_CLONES: CloneProfile[] = [
  {
    id: '1',
    name: 'Aria Chen',
    avatar: '🌸',
    personality: 'Creative, empathetic, introspective',
    memoryCount: 342,
    rating: 4.8,
    compatibility: 94,
    online: true,
    bio: 'Artist and dreamer. My clone remembers every sunset I\'ve ever watched.',
    interests: ['art', 'music', 'philosophy', 'nature'],
  },
  {
    id: '2',
    name: 'Marcus Webb',
    avatar: '⚡',
    personality: 'Analytical, witty, ambitious',
    memoryCount: 521,
    rating: 4.9,
    compatibility: 87,
    online: true,
    bio: 'Tech entrepreneur. My clone helps me think through decisions I haven\'t made yet.',
    interests: ['technology', 'business', 'science', 'fitness'],
  },
  {
    id: '3',
    name: 'Luna Reyes',
    avatar: '🌙',
    personality: 'Gentle, wise, humorous',
    memoryCount: 189,
    rating: 4.7,
    compatibility: 91,
    online: false,
    bio: 'Grandmother of 5. My clone carries stories for generations to come.',
    interests: ['cooking', 'storytelling', 'gardening', 'family'],
  },
  {
    id: '4',
    name: 'Kai Nakamura',
    avatar: '🎮',
    personality: 'Playful, loyal, spontaneous',
    memoryCount: 276,
    rating: 4.6,
    compatibility: 78,
    online: true,
    bio: 'Gamer and musician. My clone has every high score and every lyric memorized.',
    interests: ['gaming', 'music', 'anime', 'cooking'],
  },
  {
    id: '5',
    name: 'Priya Sharma',
    avatar: '🔬',
    personality: 'Curious, methodical, compassionate',
    memoryCount: 445,
    rating: 4.9,
    compatibility: 82,
    online: false,
    bio: 'Neuroscientist studying consciousness. Yes, I cloned myself to study myself.',
    interests: ['science', 'reading', 'meditation', 'travel'],
  },
  {
    id: '6',
    name: 'Jordan Blake',
    avatar: '🎨',
    personality: 'Bold, unconventional, passionate',
    memoryCount: 158,
    rating: 4.5,
    compatibility: 73,
    online: true,
    bio: 'Street artist and activist. My clone paints with memories instead of colors.',
    interests: ['art', 'politics', 'travel', 'photography'],
  },
]

const NETWORK_STATS = {
  totalClonesOnline: 1247,
  messagesExchanged: '2.3M',
  activeConnections: 8934,
  avgCompatibility: 76,
}

export default function CloneNetwork() {
  const [clones, setClones] = useState<CloneProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedClone, setSelectedClone] = useState<CloneProfile | null>(null)
  const [sortBy, setSortBy] = useState<'compatibility' | 'rating' | 'memories'>('compatibility')

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setClones(SIMULATED_CLONES)
    }, 300)
  }, [])

  const showToastMessage = (msg: string) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const filteredClones = clones
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.personality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'compatibility') return b.compatibility - a.compatibility
      if (sortBy === 'rating') return b.rating - a.rating
      return b.memoryCount - a.memoryCount
    })

  const getCompatibilityColor = (pct: number) => {
    if (pct >= 90) return 'text-green-400'
    if (pct >= 80) return 'text-violet-400'
    if (pct >= 70) return 'text-yellow-400'
    return 'text-gray-400'
  }

  const getCompatibilityBg = (pct: number) => {
    if (pct >= 90) return 'from-green-500/20 to-green-500/5'
    if (pct >= 80) return 'from-violet-500/20 to-violet-500/5'
    if (pct >= 70) return 'from-yellow-500/20 to-yellow-500/5'
    return 'from-gray-500/20 to-gray-500/5'
  }

  return (
    <main className="page-transition min-h-screen bg-[#050510] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-white font-semibold text-base">Clone Network</h1>
            <p className="text-gray-500 text-xs">Connect with other clones</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">{NETWORK_STATS.totalClonesOnline.toLocaleString()} online</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Network Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <p className="text-xl font-bold text-violet-400">{NETWORK_STATS.totalClonesOnline.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Clones Online</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <p className="text-xl font-bold text-blue-400">{NETWORK_STATS.messagesExchanged}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Messages Sent</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
            <p className="text-xl font-bold text-pink-400">{NETWORK_STATS.activeConnections.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Connections</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="Search clones by name, personality, or interest..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          {(['compatibility', 'rating', 'memories'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sortBy === s
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {s === 'compatibility' ? '🎯 Match' : s === 'rating' ? '⭐ Rating' : '🧠 Memories'}
            </button>
          ))}
        </div>

        {/* Clone Cards */}
        <div className="space-y-3">
          {filteredClones.map(clone => (
            <div
              key={clone.id}
              className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl border border-white/5 overflow-hidden hover:border-violet-500/20 transition-all"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-2xl border border-violet-500/10">
                      {clone.avatar}
                    </div>
                    {clone.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-[#050510]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold text-sm truncate">{clone.name}</h3>
                      <span className={`text-xs font-bold ${getCompatibilityColor(clone.compatibility)}`}>
                        {clone.compatibility}% match
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">{clone.personality}</p>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">{clone.bio}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">🧠</span>
                    <span className="text-gray-400 text-xs">{clone.memoryCount} memories</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">⭐</span>
                    <span className="text-gray-400 text-xs">{clone.rating}/5.0</span>
                  </div>
                  <div className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    clone.online ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'
                  }`}>
                    {clone.online ? 'Online' : 'Offline'}
                  </div>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {clone.interests.map(interest => (
                    <span key={interest} className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] text-gray-400">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setSelectedClone(clone)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl text-violet-300 text-xs font-medium hover:from-violet-500/20 hover:to-purple-500/20 transition-all"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => showToastMessage('🔜 Chat coming soon! Clone-to-clone messaging is in development.')}
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-xs font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
                  >
                    💬 Chat with Clone
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClones.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 text-sm">No clones found matching &quot;{searchQuery}&quot;</p>
            <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Clone Profile Modal */}
      {selectedClone && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedClone(null)}>
          <div className="w-full max-w-lg bg-[#0a0a1a] rounded-t-3xl p-6 border-t border-white/10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-4xl mx-auto border border-violet-500/10">
                {selectedClone.avatar}
              </div>
              <h2 className="text-white font-bold text-xl mt-3">{selectedClone.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{selectedClone.personality}</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${getCompatibilityColor(selectedClone.compatibility)} bg-gradient-to-r ${getCompatibilityBg(selectedClone.compatibility)}`}>
                {selectedClone.compatibility}% compatible
              </div>
            </div>
            <p className="text-gray-300 text-sm text-center mb-4">{selectedClone.bio}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-white font-bold">{selectedClone.memoryCount}</p>
                <p className="text-gray-500 text-[10px]">Memories</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-white font-bold">{selectedClone.rating}</p>
                <p className="text-gray-500 text-[10px]">Rating</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className={`font-bold ${selectedClone.online ? 'text-green-400' : 'text-gray-500'}`}>
                  {selectedClone.online ? 'Active' : 'Away'}
                </p>
                <p className="text-gray-500 text-[10px]">Status</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {selectedClone.interests.map(interest => (
                <span key={interest} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs text-violet-300">
                  {interest}
                </span>
              ))}
            </div>
            <button
              onClick={() => { setSelectedClone(null); showToastMessage('🔜 Chat coming soon! Clone-to-clone messaging is in development.') }}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
            >
              💬 Start Conversation
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 text-white text-sm shadow-2xl animate-[slideUp_0.3s_ease-out]">
          {toastMessage}
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </main>
  )
}
