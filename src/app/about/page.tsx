'use client'

import Link from 'next/link'

export default function About() {
  const stats = [
    { icon: '👥', value: '10K+', label: 'Active Users' },
    { icon: '🌐', value: '45', label: 'Languages' },
    { icon: '⚡', value: '120+', label: 'Features' },
    { icon: '🧠', value: '∞', label: 'Memories Stored' },
  ]

  const values = [
    { icon: '🔐', title: 'Privacy First', desc: 'Your data belongs to you. We use end-to-end encryption and never sell your information. Your consciousness is your own.' },
    { icon: '💡', title: 'Innovation', desc: 'Pushing the boundaries of AI to create the most lifelike digital consciousness. We ship fast and iterate relentlessly.' },
    { icon: '♿', title: 'Accessibility', desc: 'Consciousness preservation should be available to everyone. That\'s why every feature is free, forever.' },
    { icon: '💜', title: 'Empathy', desc: 'We build with heart. Every feature is designed to strengthen human connection, not replace it.' },
  ]

  const team = [
    { name: 'Aria Chen', role: 'CEO & Co-Founder', avatar: '👩‍💼', bio: 'Former neuroscientist turned entrepreneur. Passionate about digital immortality.' },
    { name: 'Marcus Rivera', role: 'CTO & Co-Founder', avatar: '👨‍💻', bio: '15 years in distributed systems. Built infrastructure at scale for three unicorns.' },
    { name: 'Dr. Yuki Tanaka', role: 'Head of AI', avatar: '👩‍🔬', bio: 'PhD in computational neuroscience. Published 40+ papers on consciousness modeling.' },
    { name: 'Sam Okafor', role: 'Lead Designer', avatar: '🎨', bio: 'Award-winning designer focused on creating humane, beautiful digital experiences.' },
  ]

  const timeline = [
    { year: '2024', title: 'Founded', desc: 'Started with a wild idea: what if your consciousness could live forever?' },
    { year: '2025', title: 'Beta Launch', desc: 'Opened to 1,000 beta testers. Overwhelming response — 10K signups in the first week.' },
    { year: '2026', title: 'Public Launch', desc: 'Full platform launch with 120+ features, voice cloning, and multi-language support.' },
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
          <div className="text-center mb-20">
            <div className="text-8xl mb-6">🧠</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Consciousness Clone</span>
            </h1>
            <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto">
              Preserving human consciousness for future generations.
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-2xl border border-violet-500/20 p-10 mb-16 text-center" style={{ background: 'rgba(139, 92, 246, 0.03)', backdropFilter: 'blur(20px)' }}>
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-white/50 text-lg max-w-3xl mx-auto leading-relaxed">
              We believe every human consciousness is priceless — a universe of experiences, memories, wisdom, and love.
              Our mission is to give everyone the ability to preserve their mind digitally, so their stories, voice, and essence
              can live on for generations to come.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.06] p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.01)' }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">{stat.value}</div>
                <div className="text-white/30 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">What We Stand For</h2>
            <p className="text-white/30 text-center mb-10">The principles that guide everything we build</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="rounded-xl border border-white/[0.06] p-6 hover:border-violet-500/30 transition group"
                  style={{ background: 'rgba(255,255,255,0.01)' }}
                >
                  <div className="text-3xl mb-3">{value.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-violet-400 transition">{value.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">Our Journey</h2>
            <p className="text-white/30 text-center mb-10">From idea to reality</p>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-fuchsia-500/50 to-transparent" />
              {timeline.map((item, i) => (
                <div key={item.year} className="relative pl-16 pb-10 last:pb-0">
                  <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border-4 border-[#050510]" />
                  <div className="rounded-xl border border-white/[0.06] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="text-sm text-violet-400 font-semibold mb-1">{item.year}</div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-white/30 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-4">Meet the Team</h2>
            <p className="text-white/30 text-center mb-10">The humans building digital immortality</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="rounded-xl border border-white/[0.06] p-6 text-center hover:border-violet-500/30 transition group"
                  style={{ background: 'rgba(255,255,255,0.01)' }}
                >
                  <div className="text-5xl mb-3">{member.avatar}</div>
                  <h3 className="font-semibold mb-1 group-hover:text-violet-400 transition">{member.name}</h3>
                  <div className="text-violet-400/70 text-xs mb-3">{member.role}</div>
                  <p className="text-white/30 text-xs leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="rounded-2xl border border-white/[0.04] p-10" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-4">Join Us on This Journey</h3>
              <p className="text-white/40 max-w-lg mx-auto mb-6">
                Start building your consciousness clone today. It&apos;s free, it&apos;s private, and it might just change how you think about legacy.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-10 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-lg font-bold hover:opacity-90 transition"
              >
                Get Started Free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
