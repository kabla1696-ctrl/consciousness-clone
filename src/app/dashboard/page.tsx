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

      <div className="px-4 py-4 pb-24">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Hey, {userName} 👋</h1>
          <p className="text-white/30 text-sm">Your digital consciousness</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="text-2xl font-bold text-violet-400">{memoryCount}</div>
            <div className="text-white/30 text-xs">Memories</div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]">
            <div className="text-2xl font-bold text-fuchsia-400">{chatCount}</div>
            <div className="text-white/30 text-xs">Messages</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-6">
          <Link href="/chat" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">💬</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Talk to Clone</h3>
              <p className="text-white/30 text-xs">Chat with your consciousness</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/memories" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">📝</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Memories</h3>
              <p className="text-white/30 text-xs">Store your life experiences</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/personality" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">🧬</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Personality Quiz</h3>
              <p className="text-white/30 text-xs">Define your clone&apos;s traits</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/analytics" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Analytics</h3>
              <p className="text-white/30 text-xs">Insights about your clone</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/voice" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">🎤</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Voice Clone</h3>
              <p className="text-white/30 text-xs">Make your clone sound like you</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/referral" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">🎁</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Refer & Earn</h3>
              <p className="text-white/30 text-xs">Get free Pro by inviting friends</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link href="/share" className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] tap-feedback">
            <div className="text-2xl">🔗</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Share Clone</h3>
              <p className="text-white/30 text-xs">Let others meet your consciousness</p>
            </div>
            <svg className="w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Upgrade Banner */}
        <Link href="/pricing" className="block rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 tap-feedback">
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
      <nav className="fixed bottom-0 left-0 right-0 bg-[#050510]/95 backdrop-blur-xl border-t border-white/[0.04] safe-bottom">
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
