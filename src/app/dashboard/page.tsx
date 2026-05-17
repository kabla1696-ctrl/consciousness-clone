'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-browser'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [memoryCount, setMemoryCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)
  const [clonePersonality, setClonePersonality] = useState<any>(null)

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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

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
            <Link href="/analytics" className="text-sm text-white/40 hover:text-white transition">Analytics</Link>
            <Link href="/referral" className="text-sm text-white/40 hover:text-white transition">Refer</Link>
            <button onClick={logout} className="text-sm text-white/40 hover:text-white transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName} 👋</h1>
          <p className="text-white/30">Your digital consciousness awaits</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl mb-2">📝</div>
            <div className="text-2xl font-bold text-violet-400">{memoryCount}</div>
            <div className="text-white/30 text-sm">Memories</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl mb-2">💬</div>
            <div className="text-2xl font-bold text-fuchsia-400">{chatCount}</div>
            <div className="text-white/30 text-sm">Chat Messages</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl mb-2">🧬</div>
            <div className="text-2xl font-bold text-cyan-400">Active</div>
            <div className="text-white/30 text-sm">Clone Status</div>
          </div>
          <div className="rounded-2xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-amber-400">Free</div>
            <div className="text-white/30 text-sm">Current Plan</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link href="/chat" className="group rounded-2xl border border-white/[0.04] hover:border-violet-500/30 p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition">Talk to Clone</h3>
            <p className="text-white/30 text-sm">Have a conversation with your digital consciousness</p>
          </Link>
          <Link href="/memories" className="group rounded-2xl border border-white/[0.04] hover:border-fuchsia-500/30 p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-fuchsia-400 transition">Add Memories</h3>
            <p className="text-white/30 text-sm">Store your experiences, thoughts, and feelings</p>
          </Link>
          <Link href="/personality" className="group rounded-2xl border border-white/[0.04] hover:border-cyan-500/30 p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4">🧬</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">Personality Quiz</h3>
            <p className="text-white/30 text-sm">Define your clone&apos;s personality traits</p>
          </Link>
          <Link href="/voice" className="group rounded-2xl border border-white/[0.04] hover:border-emerald-500/30 p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition">Voice Clone</h3>
            <p className="text-white/30 text-sm">Make your clone sound like you</p>
          </Link>
          <Link href="/referral" className="group rounded-2xl border border-white/[0.04] hover:border-amber-500/30 p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition">Refer & Earn</h3>
            <p className="text-white/30 text-sm">Get free Pro by inviting friends</p>
          </Link>
        </div>

        {/* Clone Personality Preview */}
        <div className="rounded-2xl border border-white/[0.04] p-8 mb-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">Your Clone&apos;s Personality 🧬</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white/50 text-sm font-semibold mb-3">PERSONALITY TRAITS</h3>
              <div className="space-y-3">
                {[
                  { trait: 'Empathy', value: 85 },
                  { trait: 'Humor', value: 72 },
                  { trait: 'Curiosity', value: 91 },
                  { trait: 'Resilience', value: 88 },
                  { trait: 'Creativity', value: 76 },
                ].map((item) => (
                  <div key={item.trait}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">{item.trait}</span>
                      <span className="text-white/30">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white/50 text-sm font-semibold mb-3">CLONE INFO</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <span className="text-white/40 text-sm">Model</span>
                  <span className="text-white/60 text-sm">mimo-v2.5-pro</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <span className="text-white/40 text-sm">Status</span>
                  <span className="text-emerald-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/[0.03]">
                  <span className="text-white/40 text-sm">Voice Clone</span>
                  <span className="text-amber-400 text-sm">Pro Plan Required</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/40 text-sm">Created</span>
                  <span className="text-white/60 text-sm">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">Recent Activity 📊</h2>
          <div className="space-y-4">
            {[
              { icon: '🧠', text: 'Clone created', time: 'Today', color: 'text-violet-400' },
              { icon: '📝', text: `${memoryCount} memories stored`, time: 'Ongoing', color: 'text-fuchsia-400' },
              { icon: '💬', text: `${chatCount} chat messages`, time: 'Ongoing', color: 'text-cyan-400' },
              { icon: '⚡', text: 'Free plan active', time: 'Current', color: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.02] last:border-0">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <p className="text-white/60 text-sm">{item.text}</p>
                </div>
                <span className="text-white/20 text-xs">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
