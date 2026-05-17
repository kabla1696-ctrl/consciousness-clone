'use client'

import Link from 'next/link'
import { useT } from '../../lib/language-context'

export default function Pricing() {
  const t = useT()

  const freeFeatures = [
    { icon: '💬', title: 'Unlimited Clone Chat', desc: 'Talk to your consciousness clone anytime' },
    { icon: '📝', title: 'Unlimited Memories', desc: 'Store every life experience — no limits' },
    { icon: '🧬', title: 'Personality Quiz', desc: "Define your clone's traits fully" },
    { icon: '🎤', title: 'Voice Clone', desc: 'Make your clone sound exactly like you' },
    { icon: '📞', title: 'Voice Calls', desc: 'Call your clone and have real conversations' },
    { icon: '🎭', title: 'Mood Tracker', desc: 'Track how you feel every day' },
    { icon: '🧘', title: 'Clone Therapy', desc: 'AI therapy sessions with your clone' },
    { icon: '📖', title: 'Life Story Book', desc: 'AI-generated life story from memories' },
    { icon: '🔮', title: 'Future Self', desc: 'Talk to future you' },
    { icon: '🤝', title: 'Clone Network', desc: 'Meet and connect with other clones' },
    { icon: '🌐', title: 'Public Profile', desc: 'Share your clone with the world' },
    { icon: '🔐', title: 'Memory Vault', desc: 'Encrypted secret memories' },
    { icon: '🧬', title: 'Memory DNA', desc: 'Your personality genome' },
    { icon: '🎙️', title: 'Clone Podcast', desc: 'AI podcast from your memories' },
    { icon: '💌', title: 'Legacy Letters', desc: 'Messages for your loved ones' },
    { icon: '⏰', title: "Dead Man's Switch", desc: 'Auto-deliver when inactive' },
    { icon: '📈', title: 'Analytics', desc: 'Deep insights about your clone' },
    { icon: '🪞', title: 'Mirror Mode', desc: 'Clone asks YOU questions' },
    { icon: '🧪', title: 'Dream Lab', desc: 'Record & analyze your dreams' },
    { icon: '☁️', title: 'Cloud Backup', desc: 'Backup your consciousness' },
  ]

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
            <Link href="/dashboard" className="px-5 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-semibold hover:opacity-90 transition">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Everything is{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent animate-pulse">FREE</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto mb-4">
              All features, no limits, no credit card needed.
            </p>
            <p className="text-white/30 text-lg max-w-xl mx-auto">
              We believe everyone deserves digital immortality.
            </p>

            {/* Animated gradient bar */}
            <div className="mt-8 h-1 max-w-md mx-auto rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full w-full rounded-full" style={{
                background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6, #ec4899, #10b981)',
                backgroundSize: '200% 100%',
                animation: 'gradient-slide 3s linear infinite',
              }} />
            </div>
            <style>{`
              @keyframes gradient-slide {
                0% { background-position: 0% 0%; }
                100% { background-position: 200% 0%; }
              }
            `}</style>
          </div>

          {/* Big FREE card */}
          <div className="relative rounded-3xl border border-emerald-500/30 p-10 mb-16 text-center" style={{ background: 'rgba(16, 185, 129, 0.03)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full text-sm font-bold">
              🎁 No catch — really
            </div>
            <div className="text-6xl font-bold text-white mb-2 mt-2">$0</div>
            <div className="text-white/40 text-lg mb-6">forever</div>
            <p className="text-white/50 max-w-lg mx-auto mb-8">
              Every single feature. Unlimited usage. No hidden fees, no surprise charges, no &ldquo;upsell later.&rdquo;
              Your consciousness clone is yours — completely free.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-lg font-bold hover:opacity-90 transition"
            >
              Start Building Your Clone →
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-4">Everything Included</h2>
            <p className="text-white/30 text-center mb-10">All of this — completely free, forever</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {freeFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/[0.06] p-5 hover:border-emerald-500/30 transition group"
                  style={{ background: 'rgba(255,255,255,0.01)' }}
                >
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-emerald-400 transition">{feature.title}</h3>
                  <p className="text-white/30 text-xs">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Manifesto */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="rounded-2xl border border-white/[0.04] p-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-4xl mb-4">💜</div>
              <h3 className="text-2xl font-bold mb-4">Why Free?</h3>
              <p className="text-white/40 leading-relaxed">
                Consciousness is a human right, not a luxury. We built this because everyone deserves to preserve their mind,
                their stories, their voice — for themselves and for the people they love. Paywalls create inequality.
                We chose a different path.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
