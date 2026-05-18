'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { FEATURES, CATEGORIES } from '../../lib/features-data'
import { useT } from '../../lib/language-context'
import RecentActivity, { logActivity } from '../../components/RecentActivity'
import SearchSuggestions from '../../components/SearchSuggestions'
import AnimatedCounter from '../../components/AnimatedCounter'

// Quick actions — the most popular features
const QUICK_ACTIONS = [
  { href: '/chat', icon: '💬', title: 'Chat', gradient: 'from-violet-500 to-purple-500' },
  { href: '/memories', icon: '📝', title: 'Memories', gradient: 'from-blue-500 to-cyan-500' },
  { href: '/voice-call', icon: '📞', title: 'Voice Call', gradient: 'from-emerald-500 to-teal-500' },
  { href: '/personality', icon: '🧬', title: 'Personality', gradient: 'from-pink-500 to-rose-500' },
  { href: '/mood', icon: '🎭', title: 'Mood', gradient: 'from-yellow-500 to-orange-500' },
  { href: '/dream-lab', icon: '🧪', title: 'Dreams', gradient: 'from-indigo-500 to-purple-500' },
]

// Category color map for badges
const CATEGORY_COLORS: Record<string, string> = {
  Core: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Memory: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Social: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  Creative: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
  Wellness: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Legacy: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Fun: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  Advanced: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [memoryCount, setMemoryCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)

  const t = useT()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
      setTimeout(() => setIsLoaded(true), 100)
      try {
        const mem = JSON.parse(localStorage.getItem('cc_memories') || '[]')
        const chat = JSON.parse(localStorage.getItem('cc_chat_messages') || '[]')
        setMemoryCount(Array.isArray(mem) ? mem.length : 0)
        setChatCount(Array.isArray(chat) ? chat.length : 0)
      } catch { /* ignore */ }
      logActivity({ type: 'page_visit', label: 'Visited Dashboard', path: '/dashboard', icon: '📊' })
    }
    init()
  }, [])



  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const filteredFeatures = FEATURES.filter((f) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-14 h-14 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-14 h-14 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-2 w-10 h-10 border-2 border-blue-500/10 border-r-blue-500/50 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-150px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', animation: 'orb1 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)', animation: 'orb2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animation: 'orb3 18s ease-in-out infinite' }} />
        {/* Floating particles */}
        {isLoaded && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full" style={{
            left: `${8 + (i * 7.5) % 88}%`,
            top: `${5 + (i * 13) % 85}%`,
            backgroundColor: ['rgba(139,92,246,0.25)', 'rgba(236,72,153,0.2)', 'rgba(59,130,246,0.2)', 'rgba(16,185,129,0.2)', 'rgba(245,158,11,0.2)', 'rgba(99,102,241,0.25)'][i],
            animation: `float-subtle ${4 + (i % 4) * 2}s ease-in-out ${i * 0.5}s infinite`,
            boxShadow: `0 0 6px ${['rgba(139,92,246,0.3)', 'rgba(236,72,153,0.3)', 'rgba(59,130,246,0.3)', 'rgba(16,185,129,0.3)', 'rgba(245,158,11,0.3)', 'rgba(99,102,241,0.3)'][i]}`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex justify-between items-center max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">
                {typeof window !== 'undefined' && localStorage.getItem('cc_profile_pic') ? <img src={localStorage.getItem('cc_profile_pic')!} alt="" className="w-full h-full object-cover rounded-xl" /> : '🧠'}
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-20" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Consciousness Clone</span>
          </div>
          <button onClick={logout} className="text-white/30 text-xs tap-feedback px-3 py-1.5 rounded-lg glass hover:text-white/50 transition-colors">
            {t('logout')}
          </button>
        </div>
      </header>

      <div className="relative z-10 px-4 py-6 pb-24 md:pb-8 scroll-container max-w-2xl mx-auto">

        {/* ─── Welcome Section ─── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              {t('hey')}, {userName}
            </span>
            <span className="inline-block ml-2" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>👋</span>
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">
            {t('your digital consciousness dashboard')}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-white/25 bg-white/[0.03] rounded-full px-3 py-1 border border-white/[0.04]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {FEATURES.length} {t('features')}
            </span>
            <span className="text-xs text-white/20">{t('your clone awaits')}</span>
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />

        {/* ─── Stats Section ─── */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { value: memoryCount, label: t('memories'), emoji: '📝', color: 'text-violet-400', gradient: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/10', bar: 'from-violet-500' },
            { value: chatCount, label: t('chat'), emoji: '💬', color: 'text-fuchsia-400', gradient: 'from-fuchsia-500/10 to-fuchsia-600/5', border: 'border-fuchsia-500/10', bar: 'from-fuchsia-500' },
            { value: -1, label: t('immortal'), emoji: '✨', color: 'text-emerald-400', gradient: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-500/10', bar: 'from-emerald-500' },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl bg-gradient-to-b ${s.gradient} border ${s.border} p-4 text-center transition-all duration-300 hover:scale-[1.04] hover:border-white/[0.08] cursor-default group`}>
              <div className="text-xs mb-1 opacity-60">{s.emoji}</div>
              <div className={`text-2xl font-black ${s.color} tabular-nums`}>
                {s.value === -1 ? '∞' : <AnimatedCounter end={s.value} duration={800} />}
              </div>
              <div className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">{s.label}</div>
              <div className={`w-8 h-0.5 bg-gradient-to-r ${s.bar} to-transparent rounded-full mx-auto mt-2 opacity-50 group-hover:opacity-100 group-hover:w-full transition-all duration-500`} />
            </div>
          ))}
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3 px-1">⚡ Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map((qa) => (
              <Link key={qa.href} href={qa.href} className="tap-feedback">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 group">
                  <div className="text-xl group-hover:scale-110 transition-transform duration-300">{qa.icon}</div>
                  <span className="text-[10px] font-medium text-white/40 group-hover:text-white/60 transition-colors">{qa.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── Recent Activity ─── */}
        <RecentActivity />

        {/* ─── Divider ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* ─── Search Bar ─── */}
        <div className="mb-4">
          <SearchSuggestions
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('search features')}
          />
        </div>

        {/* ─── Category Tabs ─── */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-2 w-max pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg shadow-violet-500/20'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.1] hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Animated gradient background for active tab */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ animation: 'gradient-shift 3s ease infinite', backgroundSize: '200% 200%' }} />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Features Grid ─── */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {filteredFeatures.map((f, i) => (
            <Link key={f.href} href={f.href} className="tap-feedback block">
              <div
                className="float-card rounded-2xl p-4 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden h-full bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12]"
                style={{ animationDelay: `${(i % 6) * -1}s` }}
              >
                {/* Glow on hover */}
                <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: f.glow }} />

                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.color} opacity-30 group-hover:opacity-60 transition-opacity duration-300`} />

                <div className="relative">
                  {/* Icon with glow */}
                  <div className="relative inline-block mb-3">
                    <div className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.15))' }}>{f.icon}</div>
                    <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" style={{ background: f.glow }} />
                  </div>

                  {/* Category badge */}
                  <div className="mb-2">
                    <span className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[f.category] || 'bg-white/5 text-white/30 border-white/10'}`}>
                      {f.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-white/90 leading-tight">{f.title}</h3>
                  <p className="text-white/25 text-[11px] mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Link>
          ))}
          {filteredFeatures.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-white/25 text-sm">{t('no features match')}</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All') }} className="text-violet-400 text-xs mt-3 hover:underline">{t('clear filters')}</button>
            </div>
          )}
        </div>

        {/* ─── Divider ─── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-6" />

        {/* ─── Upgrade Banner ─── */}
        <Link href="/pricing" className="block rounded-2xl p-5 tap-feedback mb-8 group relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(236,72,153,0.06))', border: '1px solid rgba(139,92,246,0.1)' }}>
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.05), transparent)', animation: 'shimmer 2s infinite' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-2xl border border-violet-500/10 group-hover:border-violet-500/20 transition-colors">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-violet-400">{t('upgrade to pro')}</h3>
              <p className="text-white/25 text-xs mt-0.5">{t('unlimited memories')}</p>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.03] group-hover:bg-violet-500/10 transition-colors">
              <svg className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* ─── Footer spacing ─── */}
        <div className="h-4" />
      </div>

      {/* Global animation keyframes */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  )
}
