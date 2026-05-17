'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [memoryCount, setMemoryCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)
  const [displayMemoryCount, setDisplayMemoryCount] = useState(0)
  const [displayChatCount, setDisplayChatCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadData(user.id)
    }
    init()
  }, [])

  // Scroll-triggered reveal
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        observerRef.current?.observe(el)
      })
      setIsLoaded(true)
    }, 100)

    return () => {
      clearTimeout(timer)
      observerRef.current?.disconnect()
    }
  }, [])

  // Rolling counter animation
  useEffect(() => {
    if (memoryCount === 0 && chatCount === 0) return
    const duration = 1200
    const steps = 30
    const memStep = memoryCount / steps
    const chatStep = chatCount / steps
    let current = 0

    const interval = setInterval(() => {
      current++
      setDisplayMemoryCount(Math.min(Math.round(memStep * current), memoryCount))
      setDisplayChatCount(Math.min(Math.round(chatStep * current), chatCount))
      if (current >= steps) clearInterval(interval)
    }, duration / steps)

    return () => clearInterval(interval)
  }, [memoryCount, chatCount])

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
        <div className="relative">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  const features = [
    { href: '/chat', icon: '💬', title: 'Talk to Clone', desc: 'Chat with your consciousness', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/memories', icon: '📝', title: 'Memories', desc: 'Store your life experiences', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/personality', icon: '🧬', title: 'Personality Quiz', desc: "Define your clone's traits", color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/mood', icon: '🎭', title: 'Mood Tracker', desc: 'Track how you feel daily', color: 'from-yellow-500 to-orange-500', glow: 'rgba(245,158,11,0.15)' },
    { href: '/time-capsule', icon: '🕐', title: 'Time Capsule', desc: 'Lock memories for the future', color: 'from-amber-500 to-yellow-500', glow: 'rgba(245,158,11,0.12)' },
    { href: '/legacy', icon: '💌', title: 'Legacy Letters', desc: 'Messages for loved ones', color: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.15)' },
    { href: '/last-words', icon: '📜', title: 'Last Words', desc: 'Final messages for the world', color: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.15)' },
    { href: '/dead-mans-switch', icon: '⏰', title: "Dead Man's Switch", desc: 'Auto-deliver when inactive', color: 'from-orange-500 to-red-500', glow: 'rgba(249,115,22,0.15)' },
    { href: '/life-story', icon: '📖', title: 'Life Story Book', desc: 'AI-generated life story', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)' },
    { href: '/future-self', icon: '🔮', title: 'Future Self', desc: 'Talk to future you', color: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/predictions', icon: '🌟', title: 'Predictions', desc: 'AI predicts your future', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.12)' },
    { href: '/memory-stories', icon: '✨', title: 'Memory Stories', desc: 'AI writes your stories', color: 'from-pink-500 to-fuchsia-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/clone-podcast', icon: '🎙️', title: 'Clone Podcast', desc: 'AI podcast from memories', color: 'from-purple-500 to-violet-500', glow: 'rgba(168,85,247,0.15)' },
    { href: '/mirror-mode', icon: '🪞', title: 'Mirror Mode', desc: 'Clone asks YOU questions', color: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,0.15)' },
    { href: '/dream-lab', icon: '🧪', title: 'Dream Lab', desc: 'Record & analyze dreams', color: 'from-indigo-500 to-purple-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/emotion-engine', icon: '💜', title: 'Emotion Engine', desc: 'Detect emotions in text', color: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.15)' },
    { href: '/personality-snapshots', icon: '📸', title: 'Personality Snapshots', desc: 'Daily personality tracking', color: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.15)' },
    { href: '/goals', icon: '🎯', title: 'Life Goals', desc: 'Track & achieve your goals', color: 'from-green-500 to-emerald-500', glow: 'rgba(34,197,94,0.15)' },
    { href: '/life-score', icon: '📊', title: 'Life Score', desc: 'Rate your life balance', color: 'from-violet-500 to-indigo-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/mindfulness', icon: '🧘', title: 'Mindfulness', desc: 'Meditation & breathing', color: 'from-cyan-500 to-teal-500', glow: 'rgba(6,182,212,0.15)' },
    { href: '/achievements', icon: '🏆', title: 'Achievements', desc: 'Unlock badges & rewards', color: 'from-yellow-500 to-amber-500', glow: 'rgba(234,179,8,0.15)' },
    { href: '/idea-generator', icon: '💡', title: 'Idea Generator', desc: 'AI creative ideas', color: 'from-orange-500 to-yellow-500', glow: 'rgba(249,115,22,0.12)' },
    { href: '/soul-playlist', icon: '🎵', title: 'Soul Playlist', desc: 'Music for your soul', color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/photo-memories', icon: '📸', title: 'Photo Memories', desc: 'Visual memory gallery', color: 'from-blue-500 to-indigo-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/voice-journal', icon: '🎤', title: 'Voice Journal', desc: 'Record voice memories', color: 'from-teal-500 to-green-500', glow: 'rgba(20,184,166,0.15)' },
    { href: '/clone-quiz', icon: '🎮', title: 'Clone Quiz', desc: 'How well does clone know you?', color: 'from-fuchsia-500 to-purple-500', glow: 'rgba(217,70,239,0.15)' },
    { href: '/clone-network', icon: '🤝', title: 'Clone Network', desc: 'Meet other clones', color: 'from-blue-500 to-purple-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/public-profile', icon: '🌐', title: 'Public Profile', desc: 'Share your clone with world', color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.15)' },
    { href: '/dream-mode', icon: '🌙', title: 'Dream Mode', desc: 'Background processing', color: 'from-indigo-500 to-purple-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/analytics', icon: '📈', title: 'Analytics', desc: 'Insights about your clone', color: 'from-violet-500 to-indigo-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/memory-map', icon: '🗺️', title: 'Memory Map', desc: 'Where your memories live', color: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,0.15)' },
    { href: '/family', icon: '👨‍👩‍👧‍👦', title: 'Family Tree', desc: 'Your family legacy', color: 'from-lime-500 to-green-500', glow: 'rgba(132,204,22,0.15)' },
    { href: '/skills', icon: '🎯', title: 'Skill Transfer', desc: 'Teach your skills to clone', color: 'from-orange-500 to-red-500', glow: 'rgba(249,115,22,0.15)' },
    { href: '/voice', icon: '🎤', title: 'Voice Clone', desc: 'Make clone sound like you', color: 'from-purple-500 to-violet-500', glow: 'rgba(168,85,247,0.15)' },
    { href: '/clone-settings', icon: '⚙️', title: 'Clone Settings', desc: 'Customize your clone', color: 'from-gray-500 to-slate-500', glow: 'rgba(100,116,139,0.15)' },
    { href: '/referral', icon: '🎁', title: 'Refer & Earn', desc: 'Get free Pro', color: 'from-pink-500 to-fuchsia-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/share', icon: '🔗', title: 'Share Clone', desc: 'Let others meet your clone', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/relationships', icon: '👨‍👩‍👧‍👦', title: 'Relationships', desc: 'Map your people & legacy access', color: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.15)' },
    { href: '/heir-access', icon: '🔑', title: 'Heir Access', desc: 'Who gets your clone after you', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.15)' },
    { href: '/heartbeat', icon: '💓', title: 'Heartbeat Memory', desc: 'Camera heart rate detection', color: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.15)' },
    { href: '/astronaut', icon: '🚀', title: 'Astronaut Mode', desc: 'Phone down = dream mode', color: 'from-blue-500 to-indigo-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/vault', icon: '🔐', title: 'Memory Vault', desc: 'Encrypted secret memories', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)' },
    { href: '/memory-dna', icon: '🧬', title: 'Memory DNA', desc: 'Your personality genome', color: 'from-purple-500 to-violet-500', glow: 'rgba(168,85,247,0.15)' },
    { href: '/clone-identity', icon: '🪪', title: 'Clone Identity', desc: 'Clone recognizes who talks', color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.15)' },
    { href: '/daily-briefing', icon: '☀️', title: 'Daily Briefing', desc: 'Morning clone briefing', color: 'from-yellow-500 to-amber-500', glow: 'rgba(234,179,8,0.15)' },
    { href: '/widget', icon: '📱', title: 'Widget', desc: 'Home screen widget', color: 'from-slate-500 to-gray-500', glow: 'rgba(100,116,139,0.15)' },
    { href: '/soul-sync', icon: '💕', title: 'Soul Sync', desc: 'Find your soul match', color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/time-travel', icon: '⏰', title: 'Time Travel', desc: 'Talk to younger/future you', color: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/death-simulation', icon: '💀', title: 'Death Simulation', desc: 'What they would say', color: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.15)' },
    { href: '/ghost-mode', icon: '👻', title: 'Ghost Mode', desc: 'Messages from beyond', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/clone-therapy', icon: '🧘', title: 'Clone Therapy', desc: 'AI therapy sessions', color: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.15)' },
    { href: '/memory-milestones', icon: '🏅', title: 'Milestones', desc: 'Unlock badges & XP', color: 'from-amber-500 to-yellow-500', glow: 'rgba(245,158,11,0.15)' },
    { href: '/clone-confessions', icon: '🤫', title: 'Confessions', desc: 'Anonymous secrets', color: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.15)' },
    { href: '/language', icon: '🌍', title: 'Language', desc: '47+ languages supported', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/memory-auction', icon: '🔨', title: 'Memory Auction', desc: 'Sell your best memories', color: 'from-amber-500 to-yellow-500', glow: 'rgba(245,158,11,0.15)' },
    { href: '/soul-tattoo', icon: '🖋️', title: 'Soul Tattoo', desc: 'Permanent personality marks', color: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.15)' },
    { href: '/clone-dating', icon: '💕', title: 'Clone Dating', desc: 'Find your perfect match', color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.15)' },
    { href: '/digital-reincarnation', icon: '♻️', title: 'Reincarnation', desc: 'Digital immortality', color: 'from-purple-500 to-violet-500', glow: 'rgba(168,85,247,0.15)' },
    { href: '/memory-marketplace', icon: '🏪', title: 'Marketplace', desc: 'Buy & sell experiences', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)' },
    { href: '/dream-sharing', icon: '💭', title: 'Dream Sharing', desc: 'Share your dreams', color: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/clone-orchestra', icon: '🎼', title: 'Clone Orchestra', desc: 'Clones create together', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/soul-frequency', icon: '📡', title: 'Soul Frequency', desc: 'Your unique waveform', color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.15)' },
    { href: '/clone-passport', icon: '🛂', title: 'Clone Passport', desc: 'Travel stamps collection', color: 'from-blue-500 to-indigo-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/emotional-weather', icon: '🌤️', title: 'Emotional Weather', desc: 'Mood forecast', color: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,0.15)' },
    { href: '/clone-diary', icon: '📔', title: 'Clone Diary', desc: 'Daily clone journal', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.15)' },
    { href: '/soulmate-ring', icon: '💍', title: 'Soulmate Ring', desc: 'Digital bond ring', color: 'from-yellow-500 to-amber-500', glow: 'rgba(234,179,8,0.15)' },
    { href: '/memory-constellation', icon: '⭐', title: 'Constellation', desc: 'Memories as stars', color: 'from-indigo-500 to-purple-500', glow: 'rgba(99,102,241,0.15)' },
    { href: '/clone-therapy-dog', icon: '🐕', title: 'Therapy Dog', desc: 'Virtual comfort pet', color: 'from-orange-500 to-amber-500', glow: 'rgba(249,115,22,0.15)' },
    { href: '/legacy-tree', icon: '🌳', title: 'Legacy Tree', desc: 'Family memory tree', color: 'from-green-500 to-emerald-500', glow: 'rgba(34,197,94,0.15)' },
    { href: '/clone-voice-calls', icon: '📞', title: 'Voice Calls', desc: 'Clone calls you', color: 'from-teal-500 to-cyan-500', glow: 'rgba(20,184,166,0.15)' },
    { href: '/memory-encryption', icon: '🔒', title: 'Blockchain Memory', desc: 'Tamper-proof memories', color: 'from-slate-500 to-gray-500', glow: 'rgba(100,116,139,0.15)' },
    { href: '/clone-social', icon: '📱', title: 'Clone Social', desc: 'Clone social feed', color: 'from-blue-500 to-purple-500', glow: 'rgba(59,130,246,0.15)' },
    { href: '/personality-evolution', icon: '🧬', title: 'Evolution', desc: 'Clone evolves over time', color: 'from-green-500 to-teal-500', glow: 'rgba(34,197,94,0.15)' },
    { href: '/memory-triggers', icon: '⚡', title: 'Memory Triggers', desc: 'Auto memory activation', color: 'from-yellow-500 to-orange-500', glow: 'rgba(234,179,8,0.15)' },
    { href: '/clone-guardian', icon: '🛡️', title: 'Guardian Angel', desc: 'Clone protects you', color: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,0.15)' },
    { href: '/soul-mirror', icon: '🪞', title: 'Soul Mirror', desc: 'Compare personalities', color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.15)' },
    { href: '/memory-reels', icon: '🎬', title: 'Memory Reels', desc: 'TikTok for memories', color: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.15)' },
    { href: '/clone-tournament', icon: '⚔️', title: 'Clone Battles', desc: 'Clone vs Clone fights', color: 'from-red-500 to-orange-500', glow: 'rgba(239,68,68,0.15)' },
  ]

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-150px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', animation: 'orb1 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)', animation: 'orb2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animation: 'orb3 18s ease-in-out infinite' }} />
        {/* Tiny floating particles */}
        {isLoaded && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-violet-400/20" style={{
            left: `${10 + (i * 7.5) % 90}%`,
            top: `${5 + (i * 13) % 85}%`,
            animation: `float-subtle ${4 + (i % 4) * 2}s ease-in-out ${i * 0.5}s infinite`,
          }} />
        ))}
      </div>

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">🧠</div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-20" />
            </div>
            <span className="text-base font-bold tracking-tight">Consciousness Clone</span>
          </div>
          <button onClick={logout} className="text-white/30 text-xs tap-feedback px-3 py-1.5 rounded-lg glass hover:text-white/50 transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="relative z-10 px-4 py-4 pb-24 scroll-container">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Hey, {userName} <span className="inline-block" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>👋</span>
          </h1>
          <p className="text-shimmer text-sm font-medium mt-1">Your digital consciousness dashboard</p>
          <p className="text-white/20 text-xs mt-0.5">83 features • Your clone awaits</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl glass-strong p-4 text-center glow-pulse-hover transition-all duration-300 hover:scale-[1.03] cursor-default">
            <div className="text-2xl font-black text-violet-400 roll-in">{displayMemoryCount}</div>
            <div className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">Memories</div>
            <div className="w-full h-0.5 bg-gradient-to-r from-violet-500/30 to-transparent rounded-full mt-2" />
          </div>
          <div className="rounded-2xl glass-strong p-4 text-center glow-pulse-hover transition-all duration-300 hover:scale-[1.03] cursor-default">
            <div className="text-2xl font-black text-fuchsia-400 roll-in" style={{ animationDelay: '0.1s' }}>{displayChatCount}</div>
            <div className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">Messages</div>
            <div className="w-full h-0.5 bg-gradient-to-r from-fuchsia-500/30 to-transparent rounded-full mt-2" />
          </div>
          <div className="rounded-2xl glass-strong p-4 text-center glow-pulse-hover transition-all duration-300 hover:scale-[1.03] cursor-default">
            <div className="text-2xl font-black text-emerald-400 roll-in" style={{ animationDelay: '0.2s' }}>∞</div>
            <div className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">Immortal</div>
            <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500/30 to-transparent rounded-full mt-2" />
          </div>
        </div>

        {/* Features Grid */}
        <div className="reveal-on-scroll grid grid-cols-2 gap-3 mb-6">
          {features.map((f, i) => (
            <Link key={f.href} href={f.href} className="tap-feedback block">
              <div
                className="float-card rounded-2xl glass p-4 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden h-full"
                style={{ animationDelay: `${(i % 6) * -1}s` }}
              >
                {/* Hover glow */}
                <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: f.glow }} />
                <div className="relative">
                  <div className="text-2xl mb-2.5">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-white/90">{f.title}</h3>
                  <p className="text-white/25 text-[11px] mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Upgrade Banner */}
        <Link href="/pricing" className="reveal-on-scroll block rounded-2xl p-4 tap-feedback mb-6 group relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-violet-400">Upgrade to Pro</h3>
              <p className="text-white/25 text-xs">Unlimited memories, voice clone & more</p>
            </div>
            <svg className="w-5 h-5 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#050510]/90 backdrop-blur-2xl border-t border-white/[0.04] safe-bottom bottom-tab-bar z-50">
        <div className="flex justify-around py-2">
          {[
            { href: '/dashboard', label: 'Home', active: true, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
            { href: '/chat', label: 'Chat', active: false, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
            { href: '/memories', label: 'Memories', active: false, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
            { href: '/mood', label: 'Mood', active: false, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { href: '/analytics', label: 'Stats', active: false, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
          ].map((tab) => (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center py-2 px-4 tap-feedback group relative">
              {tab.active && (
                <div className="absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
              )}
              <svg className={`w-6 h-6 transition-colors ${tab.active ? 'text-violet-400' : 'text-white/30 group-hover:text-white/50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {tab.icon}
              </svg>
              <span className={`text-[10px] mt-1 font-medium transition-colors ${tab.active ? 'text-violet-400' : 'text-white/30'}`}>{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  )
}
