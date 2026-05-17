'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Share() {
  const [user, setUser] = useState<any>(null)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState({
    showName: true,
    showTraits: true,
    showMemoryCount: true,
    allowChat: false,
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setShareLink(`https://consciousness-clone.vercel.app/clone/${user.id.slice(0, 8)}`)
    }
    init()
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-3xl mx-auto pb-20">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-4xl font-bold mb-4">Share Your Clone</h1>
          <p className="text-white/30 text-lg">Let others interact with your digital consciousness</p>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl border border-violet-500/30 p-8 mb-10" style={{ background: 'rgba(139, 92, 246, 0.03)' }}>
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl mb-4">
              {userName.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold">{userName}&apos;s Clone</h2>
            <p className="text-white/30 text-sm mt-1">Digital Consciousness</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg font-bold text-violet-400">Active</div>
              <div className="text-white/30 text-xs">Status</div>
            </div>
            <div className="py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg font-bold text-fuchsia-400">mimo</div>
              <div className="text-white/30 text-xs">AI Model</div>
            </div>
            <div className="py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-lg font-bold text-cyan-400">v2.5</div>
              <div className="text-white/30 text-xs">Version</div>
            </div>
          </div>
        </div>

        {/* Share Link */}
        <div className="rounded-2xl border border-white/[0.04] p-6 mb-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h3 className="text-lg font-bold mb-4">Your Public Link</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 text-sm"
            />
            <button
              onClick={copyLink}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="rounded-2xl border border-white/[0.04] p-6 mb-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h3 className="text-lg font-bold mb-6">Privacy Settings 🔒</h3>
          <div className="space-y-4">
            {[
              { key: 'showName', label: 'Show my name', desc: 'Display your name on the public profile' },
              { key: 'showTraits', label: 'Show personality traits', desc: 'Let others see your clone\'s personality' },
              { key: 'showMemoryCount', label: 'Show memory count', desc: 'Display how many memories your clone has' },
              { key: 'allowChat', label: 'Allow others to chat', desc: 'Let visitors talk to your clone (read-only)' },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                <div>
                  <h4 className="text-sm font-medium">{setting.label}</h4>
                  <p className="text-white/30 text-xs mt-0.5">{setting.desc}</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, [setting.key]: !settings[setting.key as keyof typeof settings] })}
                  className={`relative w-12 h-6 rounded-full transition ${settings[setting.key as keyof typeof settings] ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${settings[setting.key as keyof typeof settings] ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Share */}
        <div className="rounded-2xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h3 className="text-lg font-bold mb-6">Share on Social Media 📱</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Twitter', icon: '🐦', color: 'from-blue-500 to-blue-600' },
              { name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-green-600' },
              { name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-700' },
              { name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-800' },
            ].map((social) => (
              <button
                key={social.name}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${social.color} font-semibold hover:opacity-90 transition`}
              >
                {social.icon} {social.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
