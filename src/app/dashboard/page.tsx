'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [memoryCount, setMemoryCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadData(user.id)
    }
    init()
  }, [])

  const loadData = async (userId: string) => {
    const [memories, messages] = await Promise.all([
      supabase.from('memories').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('chat_messages').select('id', { count: 'exact' }).eq('user_id', userId),
    ])
    setMemoryCount(memories.count || 0)
    setChatCount(messages.count || 0)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const features = [
    // Core
    { href: '/chat', icon: '💬', title: 'Talk to Clone', desc: 'Chat with your consciousness', color: 'from-violet-500 to-purple-500' },
    { href: '/memories', icon: '📝', title: 'Memories', desc: 'Store your life experiences', color: 'from-blue-500 to-cyan-500' },
    { href: '/personality', icon: '🧬', title: 'Personality Quiz', desc: 'Define your clone\'s traits', color: 'from-pink-500 to-rose-500' },
    { href: '/mood', icon: '🎭', title: 'Mood Tracker', desc: 'Track how you feel daily', color: 'from-yellow-500 to-orange-500' },
    // Future
    { href: '/time-capsule', icon: '🕐', title: 'Time Capsule', desc: 'Lock memories for the future', color: 'from-amber-500 to-yellow-500' },
    { href: '/legacy', icon: '💌', title: 'Legacy Letters', desc: 'Messages for loved ones', color: 'from-rose-500 to-pink-500' },
    { href: '/last-words', icon: '📜', title: 'Last Words', desc: 'Final messages for the world', color: 'from-red-500 to-rose-500' },
    { href: '/dead-mans-switch', icon: '⏰', title: 'Dead Man\'s Switch', desc: 'Auto-deliver when inactive', color: 'from-orange-500 to-red-500' },
    // AI Features
    { href: '/life-story', icon: '📖', title: 'Life Story Book', desc: 'AI-generated life story', color: 'from-emerald-500 to-teal-500' },
    { href: '/future-self', icon: '🔮', title: 'Future Self', desc: 'Talk to future you', color: 'from-indigo-500 to-blue-500' },
    { href: '/predictions', icon: '🌟', title: 'Predictions', desc: 'AI predicts your future', color: 'from-amber-500 to-orange-500' },
    { href: '/memory-stories', icon: '✨', title: 'Memory Stories', desc: 'AI writes your stories', color: 'from-pink-500 to-fuchsia-500' },
    { href: '/clone-podcast', icon: '🎙️', title: 'Clone Podcast', desc: 'AI podcast from memories', color: 'from-purple-500 to-violet-500' },
    // Self Discovery
    { href: '/mirror-mode', icon: '🪞', title: 'Mirror Mode', desc: 'Clone asks YOU questions', color: 'from-sky-500 to-blue-500' },
    { href: '/dream-lab', icon: '🧪', title: 'Dream Lab', desc: 'Record & analyze dreams', color: 'from-indigo-500 to-purple-500' },
    { href: '/emotion-engine', icon: '💜', title: 'Emotion Engine', desc: 'Detect emotions in text', color: 'from-fuchsia-500 to-pink-500' },
    { href: '/personality-snapshots', icon: '📸', title: 'Personality Snapshots', desc: 'Daily personality tracking', color: 'from-teal-500 to-cyan-500' },
    // Growth
    { href: '/goals', icon: '🎯', title: 'Life Goals', desc: 'Track & achieve your goals', color: 'from-green-500 to-emerald-500' },
    { href: '/life-score', icon: '📊', title: 'Life Score', desc: 'Rate your life balance', color: 'from-violet-500 to-indigo-500' },
    { href: '/mindfulness', icon: '🧘', title: 'Mindfulness', desc: 'Meditation & breathing', color: 'from-cyan-500 to-teal-500' },
    { href: '/achievements', icon: '🏆', title: 'Achievements', desc: 'Unlock badges & rewards', color: 'from-yellow-500 to-amber-500' },
    // Creative
    { href: '/idea-generator', icon: '💡', title: 'Idea Generator', desc: 'AI creative ideas', color: 'from-orange-500 to-yellow-500' },
    { href: '/soul-playlist', icon: '🎵', title: 'Soul Playlist', desc: 'Music for your soul', color: 'from-pink-500 to-rose-500' },
    { href: '/photo-memories', icon: '📸', title: 'Photo Memories', desc: 'Visual memory gallery', color: 'from-blue-500 to-indigo-500' },
    { href: '/voice-journal', icon: '🎤', title: 'Voice Journal', desc: 'Record voice memories', color: 'from-teal-500 to-green-500' },
    // Social
    { href: '/clone-quiz', icon: '🎮', title: 'Clone Quiz', desc: 'How well does clone know you?', color: 'from-fuchsia-500 to-purple-500' },
    { href: '/clone-network', icon: '🤝', title: 'Clone Network', desc: 'Meet other clones', color: 'from-blue-500 to-purple-500' },
    { href: '/public-profile', icon: '🌐', title: 'Public Profile', desc: 'Share your clone with world', color: 'from-cyan-500 to-blue-500' },
    { href: '/dream-mode', icon: '🌙', title: 'Dream Mode', desc: 'Background processing', color: 'from-indigo-500 to-purple-500' },
    // Tools
    { href: '/analytics', icon: '📈', title: 'Analytics', desc: 'Insights about your clone', color: 'from-violet-500 to-indigo-500' },
    { href: '/memory-map', icon: '🗺️', title: 'Memory Map', desc: 'Where your memories live', color: 'from-sky-500 to-blue-500' },
    { href: '/family', icon: '👨‍👩‍👧‍👦', title: 'Family Tree', desc: 'Your family legacy', color: 'from-lime-500 to-green-500' },
    { href: '/skills', icon: '🎯', title: 'Skill Transfer', desc: 'Teach your skills to clone', color: 'from-orange-500 to-red-500' },
    { href: '/voice', icon: '🎤', title: 'Voice Clone', desc: 'Make clone sound like you', color: 'from-purple-500 to-violet-500' },
    { href: '/clone-settings', icon: '⚙️', title: 'Clone Settings', desc: 'Customize your clone', color: 'from-gray-500 to-slate-500' },
    { href: '/referral', icon: '🎁', title: 'Refer & Earn', desc: 'Get free Pro', color: 'from-pink-500 to-fuchsia-500' },
    { href: '/share', icon: '🔗', title: 'Share Clone', desc: 'Let others meet your clone', color: 'from-violet-500 to-purple-500' },
  ]

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🧠</div>
            <span className="text-base font-bold">Consciousness Clone</span>
          </div>
          <button onClick={logout} className="text-white/40 text-sm tap-feedback px-3 py-1.5 rounded-lg border border-white/[0.06]">
            Logout
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 scroll-container">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Hey, {userName} 👋</h1>
          <p className="text-white/30 text-sm">Your digital consciousness dashboard — 37 features</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-violet-400">{memoryCount}</div>
            <div className="text-white/30 text-[10px]">Memories</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-fuchsia-400">{chatCount}</div>
            <div className="text-white/30 text-[10px]">Messages</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
            <div className="text-xl font-bold text-emerald-400">∞</div>
            <div className="text-white/30 text-[10px]">Immortal</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="tap-feedback">
              <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02] hover:bg-white/[0.04] transition h-full">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="font-semibold text-sm">{f.title}</h3>
                <p className="text-white/30 text-[11px] mt-0.5">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Upgrade Banner */}
        <Link href="/pricing" className="block rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 tap-feedback mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-violet-400">Upgrade to Pro</h3>
              <p className="text-white/30 text-xs">Unlimited memories, voice clone & more</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#050510]/95 backdrop-blur-xl border-t border-white/[0.04] safe-bottom bottom-tab-bar">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center py-2 px-4 tap-feedback">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] text-violet-400 mt-1">Home</span>
          </Link>
          <Link href="/chat" className="flex flex-col items-center py-2 px-4 tap-feedback">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-[10px] text-white/40 mt-1">Chat</span>
          </Link>
          <Link href="/memories" className="flex flex-col items-center py-2 px-4 tap-feedback">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] text-white/40 mt-1">Memories</span>
          </Link>
          <Link href="/mood" className="flex flex-col items-center py-2 px-4 tap-feedback">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] text-white/40 mt-1">Mood</span>
          </Link>
          <Link href="/analytics" className="flex flex-col items-center py-2 px-4 tap-feedback">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-[10px] text-white/40 mt-1">Stats</span>
          </Link>
        </div>
      </nav>
    </main>
  )
}
