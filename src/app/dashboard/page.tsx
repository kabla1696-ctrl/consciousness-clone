'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Dashboard() {
  const [memories] = useState(12)
  const [cloneReady] = useState(true)

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">Consciousness Clone</Link>
          <div className="flex gap-4 items-center">
            <Link href="/memories" className="text-white/60 hover:text-white transition">Memories</Link>
            <Link href="/chat" className="text-white/60 hover:text-white transition">Chat</Link>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">A</div>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto">
        {/* Welcome */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, Abir 👋</h1>
          <p className="text-white/60 text-lg">Your digital consciousness is growing.</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Memories', value: memories, icon: '📝' },
            { label: 'Clone Status', value: cloneReady ? 'Active' : 'Training', icon: '🧠' },
            { label: 'Voice Samples', value: '3', icon: '🎤' },
            { label: 'Personality Score', value: '67%', icon: '🧬' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/memories" className="glass rounded-2xl p-8 hover:bg-white/10 transition group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">📝</div>
            <h3 className="text-xl font-semibold mb-2">Add Memory</h3>
            <p className="text-white/60">Write a new memory, upload voice or photo.</p>
          </Link>
          <Link href="/chat" className="glass rounded-2xl p-8 hover:bg-white/10 transition group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">💬</div>
            <h3 className="text-xl font-semibold mb-2">Talk to Your Clone</h3>
            <p className="text-white/60">Chat with your AI consciousness.</p>
          </Link>
          <div className="glass rounded-2xl p-8 hover:bg-white/10 transition group cursor-pointer">
            <div className="text-4xl mb-4 group-hover:scale-110 transition">🎤</div>
            <h3 className="text-xl font-semibold mb-2">Record Voice</h3>
            <p className="text-white/60">Add voice samples to improve cloning.</p>
          </div>
        </div>

        {/* Recent Memories */}
        <h2 className="text-2xl font-bold mb-6">Recent Memories</h2>
        <div className="space-y-4">
          {[
            { text: 'Today I felt really happy because...', time: '2 hours ago', mood: '😊' },
            { text: 'My childhood memory of summer vacation...', time: '1 day ago', mood: '🌅' },
            { text: 'Advice I would give to my younger self...', time: '3 days ago', mood: '💡' },
          ].map((memory, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition cursor-pointer">
              <div className="text-2xl">{memory.mood}</div>
              <div className="flex-1">
                <p className="text-white/80">{memory.text}</p>
                <p className="text-white/40 text-sm mt-1">{memory.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
