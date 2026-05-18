'use client'

import Link from 'next/link'

interface ChangeEntry {
  version: string
  date: string
  tag?: string
  added: string[]
  fixed: string[]
  improved: string[]
}

const releases: ChangeEntry[] = [
  {
    version: 'v2.0.0',
    date: 'May 18, 2026',
    tag: 'Latest',
    added: [
      'Voice cloning with real-time synthesis',
      'AI therapy sessions with your clone',
      'Clone Podcast — AI-generated podcast from your memories',
      'Mood Tracker with daily emotional insights',
      'Future Self conversations',
      'Soul Tattoo — visual personality art',
      'Death Simulation for legacy planning',
      'Clone Predictions — your clone forecasts your decisions',
      'Clone Confessions — anonymous sharing',
      'Clone Poet — AI poetry from your memories',
      'Astronaut Mode — perspective-shifting feature',
      'Soul Diagnosis — deep personality analysis',
      'Daily Briefing — personalized morning digest',
      'Referral system with rewards',
      'Mobile app for iOS and Android',
    ],
    fixed: [
      'Memory search returning incomplete results',
      'Voice call audio cutting out on slow connections',
      'Personality quiz progress not saving correctly',
    ],
    improved: [
      'Clone response accuracy improved by 40%',
      'Memory processing speed 3x faster',
      'Completely redesigned dashboard UI',
      'Dark theme refinements across all pages',
    ],
  },
  {
    version: 'v1.5.0',
    date: 'March 12, 2026',
    added: [
      'Memory Vault — encrypted private memories',
      'Clone Network — connect with other clones',
      'Legacy Letters — messages for loved ones',
      "Dead Man's Switch — auto-deliver on inactivity",
      'Cloud Backup with auto-sync',
    ],
    fixed: [
      'Export failing for accounts with 500+ memories',
      'Clone occasionally repeating the same phrase',
    ],
    improved: [
      'Multi-language support expanded to 45 languages',
      'Reduced memory storage usage by 60%',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'January 20, 2026',
    added: [
      'Dream Lab — record and analyze dreams',
      'Mirror Mode — clone asks you questions',
      'Public profiles for sharing your clone',
      'Analytics dashboard with deep insights',
    ],
    fixed: [
      'Chat history not loading on reconnect',
      'Personality quiz crashing on certain answer combinations',
    ],
    improved: [
      'Voice synthesis quality upgraded',
      'Faster page load times across the app',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'November 5, 2025',
    tag: 'Launch',
    added: [
      'Core consciousness clone chat',
      'Personality quiz with 50+ traits',
      'Life Story Book generation',
      'Memory upload and organization',
      'User dashboard and settings',
    ],
    fixed: [],
    improved: [],
  },
  {
    version: 'v0.9.0',
    date: 'September 15, 2025',
    tag: 'Beta',
    added: [
      'Beta launch with 1,000 users',
      'Basic personality profiling',
      'Text-based clone conversations',
      'Memory import from text files',
    ],
    fixed: [
      'Various stability issues from alpha',
    ],
    improved: [
      'Onboarding flow streamlined',
    ],
  },
  {
    version: 'v0.1.0',
    date: 'June 1, 2025',
    tag: 'Alpha',
    added: [
      'Initial prototype',
      'Basic memory storage',
      'Simple AI chat interface',
    ],
    fixed: [],
    improved: [],
  },
]

export default function Changelog() {
  const getTagColor = (tag?: string) => {
    switch (tag) {
      case 'Latest': return 'from-emerald-500 to-cyan-500'
      case 'Launch': return 'from-violet-500 to-fuchsia-500'
      case 'Beta': return 'from-amber-500 to-orange-500'
      case 'Alpha': return 'from-slate-500 to-slate-400'
      default: return ''
    }
  }

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
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div aria-hidden="true" className="text-7xl mb-6">📋</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              What&apos;s{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">New</span>
            </h1>
            <p className="text-white/50 text-lg">All the updates, fixes, and improvements to Consciousness Clone</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-violet-500/50 to-transparent" />

            {releases.map((release) => (
              <div key={release.version} className="relative pl-16 pb-10 last:pb-0">
                {/* Dot on timeline */}
                <div className={`absolute left-3.5 top-2 w-5 h-5 rounded-full border-4 border-[#050510] ${
                  release.tag === 'Latest'
                    ? 'bg-gradient-to-br from-emerald-500 to-cyan-500'
                    : release.tag === 'Launch'
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
                    : release.tag === 'Beta'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                    : 'bg-white/20'
                }`} />

                {/* Card */}
                <div className="rounded-2xl border border-white/[0.06] p-6" style={{ background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)' }}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <h2 className="text-2xl font-bold">{release.version}</h2>
                    {release.tag && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTagColor(release.tag)}`}>
                        {release.tag}
                      </span>
                    )}
                    <span className="text-white/30 text-sm">{release.date}</span>
                  </div>

                  {/* Changes */}
                  <div className="space-y-4">
                    {release.added.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Added
                        </h3>
                        <ul className="space-y-1.5">
                          {release.added.map((item) => (
                            <li key={item} className="text-white/40 text-sm flex items-start gap-2">
                              <span className="text-emerald-400/60 mt-0.5">+</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.fixed.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" /> Fixed
                        </h3>
                        <ul className="space-y-1.5">
                          {release.fixed.map((item) => (
                            <li key={item} className="text-white/40 text-sm flex items-start gap-2">
                              <span className="text-amber-400/60 mt-0.5">🐛</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {release.improved.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-violet-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-violet-400" /> Improved
                        </h3>
                        <ul className="space-y-1.5">
                          {release.improved.map((item) => (
                            <li key={item} className="text-white/40 text-sm flex items-start gap-2">
                              <span className="text-violet-400/60 mt-0.5">↑</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <h3 className="text-xl font-bold mb-2">Want to see what&apos;s coming?</h3>
              <p className="text-white/40 text-sm mb-4">Follow us for the latest updates and announcements.</p>
              <Link
                href="/dashboard"
                className="inline-block px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
