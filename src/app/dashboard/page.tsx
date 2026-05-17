'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { FEATURES, CATEGORIES } from '../../lib/features-data'
import { useT } from '../../lib/language-context'

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
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Floating Orbs Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-150px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', animation: 'orb1 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)', animation: 'orb2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animation: 'orb3 18s ease-in-out infinite' }} />
        {isLoaded && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full bg-violet-400/20" style={{
            left: `${10 + (i * 7.5) % 90}%`,
            top: `${5 + (i * 13) % 85}%`,
            animation: `float-subtle ${4 + (i % 4) * 2}s ease-in-out ${i * 0.5}s infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">
                {typeof window !== 'undefined' && localStorage.getItem('cc_profile_pic') ? <img src={localStorage.getItem('cc_profile_pic')!} alt="" className="w-full h-full object-cover" /> : '🧠'}
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-20" />
            </div>
            <span className="text-base font-bold tracking-tight">Consciousness Clone</span>
          </div>
          <button onClick={logout} className="text-white/30 text-xs tap-feedback px-3 py-1.5 rounded-lg glass hover:text-white/50 transition-colors">
            {t('logout')}
          </button>
        </div>
      </header>

      <div className="relative z-10 px-4 py-4 pb-24 md:pb-8 scroll-container">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {t('hey')}, {userName} <span className="inline-block" style={{ animation: 'float-subtle 3s ease-in-out infinite' }}>👋</span>
          </h1>
          <p className="text-shimmer text-sm font-medium mt-1">{t('your digital consciousness dashboard')}</p>
          <p className="text-white/20 text-xs mt-0.5">{FEATURES.length} {t('features')} • {t('your clone awaits')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: memoryCount, label: t('memories'), color: 'text-violet-400', bar: 'from-violet-500/30' },
            { value: chatCount, label: t('chat'), color: 'text-fuchsia-400', bar: 'from-fuchsia-500/30' },
            { value: '∞', label: t('immortal'), color: 'text-emerald-400', bar: 'from-emerald-500/30' },
          ].map((s, i) => (
            <div key={s.label} className="rounded-2xl glass-strong p-4 text-center glow-pulse-hover transition-all duration-300 hover:scale-[1.03] cursor-default">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-white/25 text-[10px] font-medium uppercase tracking-wider mt-1">{s.label}</div>
              <div className={`w-full h-0.5 bg-gradient-to-r ${s.bar} to-transparent rounded-full mt-2`} />
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('search features')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-strong text-sm text-white/90 placeholder-white/20 outline-none focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide" style={{ touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-2 w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20'
                    : 'glass text-white/40 hover:text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filteredFeatures.map((f, i) => (
            <Link key={f.href} href={f.href} className="tap-feedback block">
              <div
                className="float-card rounded-2xl glass p-4 transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden h-full"
                style={{ animationDelay: `${(i % 6) * -1}s` }}
              >
                <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" style={{ background: f.glow }} />
                <div className="relative">
                  <div className="text-2xl mb-2.5">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-white/90">{f.title}</h3>
                  <p className="text-white/25 text-[11px] mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Link>
          ))}
          {filteredFeatures.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-white/20 text-sm">{t('no features match')}</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('All') }} className="text-violet-400 text-xs mt-2 hover:underline">{t('clear filters')}</button>
            </div>
          )}
        </div>

        {/* Upgrade Banner */}
        <Link href="/pricing" className="block rounded-2xl p-4 tap-feedback mb-6 group relative" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.08))', border: '1px solid rgba(139,92,246,0.15)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-violet-400">{t('upgrade to pro')}</h3>
              <p className="text-white/25 text-xs">{t('unlimited memories')}</p>
            </div>
            <svg className="w-5 h-5 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>
      </div>


    </main>
  )
}
