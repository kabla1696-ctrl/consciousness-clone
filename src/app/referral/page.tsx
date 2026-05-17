'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Referral() {
  const [user, setUser] = useState<any>(null)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState(0)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setReferralCode(`CLONE-${user.id.slice(0, 8).toUpperCase()}`)
    }
    init()
  }, [])

  const copyCode = () => {
    navigator.clipboard.writeText(`https://consciousness-clone.vercel.app/signup?ref=${referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rewards = [
    { referrals: 1, reward: 'Bronze Badge + 100 Points', icon: '🎁' },
    { referrals: 3, reward: 'Silver Badge + 500 Points', icon: '⭐' },
    { referrals: 5, reward: 'Gold Badge + 1000 Points', icon: '💎' },
    { referrals: 10, reward: 'Diamond Badge + 2500 Points', icon: '👑' },
    { referrals: 25, reward: 'Legend Badge + 5000 Points', icon: '🚀' },
  ]

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-4xl font-bold mb-4">Refer Friends, Earn Rewards</h1>
          <p className="text-white/30 text-lg">Share Consciousness Clone and earn points & badges</p>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl border border-violet-500/30 p-8 mb-10" style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={`https://consciousness-clone.vercel.app/signup?ref=${referralCode}`}
              readOnly
              className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/60 text-sm"
            />
            <button
              onClick={copyCode}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-white/20 text-sm mt-3">Share this link with friends. When they sign up, you both earn rewards!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-violet-400">{referrals}</div>
            <div className="text-white/30 text-sm mt-1">Referrals</div>
          </div>
          <div className="rounded-xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-fuchsia-400">{referralCode}</div>
            <div className="text-white/30 text-sm mt-1">Your Code</div>
          </div>
          <div className="rounded-xl border border-white/[0.04] p-6 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="text-3xl font-bold text-amber-400">{referrals * 100}</div>
            <div className="text-white/30 text-sm mt-1">Points Earned</div>
          </div>
        </div>

        {/* Rewards Tiers */}
        <div className="rounded-2xl border border-white/[0.04] p-8 mb-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">Reward Tiers 🏆</h2>
          <div className="space-y-4">
            {rewards.map((tier, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${referrals >= tier.referrals ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/[0.04]'}`}>
                <div className="text-3xl">{tier.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{tier.referrals} Referrals</h3>
                  <p className="text-white/40 text-sm">{tier.reward}</p>
                </div>
                {referrals >= tier.referrals ? (
                  <span className="text-emerald-400 text-sm font-semibold">✓ Unlocked</span>
                ) : (
                  <span className="text-white/20 text-sm">{tier.referrals - referrals} more</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">Share on Social Media 📱</h2>
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
