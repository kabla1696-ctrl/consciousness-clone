'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [memories] = useState(12)
  const [cloneReady] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        window.location.href = '/login'
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/memories" className="text-sm text-white/40 hover:text-white transition">Memories</Link>
            <Link href="/chat" className="text-sm text-white/40 hover:text-white transition">Chat</Link>
            <button onClick={handleLogout} className="text-sm text-white/40 hover:text-white transition">Logout</button>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm font-bold uppercase">
              {displayName.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {displayName} 👋</h1>
          <p className="text-white/40 text-lg">Your digital consciousness is growing.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Memories', value: memories, icon: '📝' },
            { label: 'Clone Status', value: cloneReady ? 'Active' : 'Training', icon: '🧠' },
            { label: 'Voice Samples', value: '3', icon: '🎤' },
            { label: 'Personality Score', value: '67%', icon: '🧬' },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] p-6 hover:border-white/[0.08] transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-white/30 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Link href="/memories" className="group rounded-xl border border-white/[0.04] hover:border-violet-500/20 p-8 transition-all duration-500" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</div>
            <h3 className="text-lg font-semibold mb-2">Add Memory</h3>
            <p className="text-white/30 text-sm">Write a new memory, upload voice or photo.</p>
          </Link>
          <Link href="/chat" className="group rounded-xl border border-white/[0.04] hover:border-fuchsia-500/20 p-8 transition-all duration-500" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-lg font-semibold mb-2">Talk to Your Clone</h3>
            <p className="text-white/30 text-sm">Chat with your AI consciousness.</p>
          </Link>
          <div className="group rounded-xl border border-white/[0.04] hover:border-orange-500/20 p-8 transition-all duration-500 cursor-pointer" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎤</div>
            <h3 className="text-lg font-semibold mb-2">Record Voice</h3>
            <p className="text-white/30 text-sm">Add voice samples to improve cloning.</p>
          </div>
        </div>

        {/* Recent Memories */}
        <h2 className="text-2xl font-bold mb-6">Recent Memories</h2>
        <div className="space-y-3">
          {[
            { text: 'Today I felt really happy because...', time: '2 hours ago', mood: '😊' },
            { text: 'My childhood memory of summer vacation...', time: '1 day ago', mood: '🌅' },
            { text: 'Advice I would give to my younger self...', time: '3 days ago', mood: '💡' },
          ].map((memory, i) => (
            <div key={i} className="rounded-xl border border-white/[0.04] hover:border-white/[0.08] p-5 flex items-center gap-4 transition cursor-pointer" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl">{memory.mood}</div>
              <div className="flex-1">
                <p className="text-white/70">{memory.text}</p>
                <p className="text-white/20 text-sm mt-1">{memory.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
