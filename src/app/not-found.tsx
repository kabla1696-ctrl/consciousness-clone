'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FEATURES } from '../lib/features-data';

// Popular pages for quick navigation
const POPULAR_PAGES = [
  { href: '/dashboard', icon: '📊', title: 'Dashboard' },
  { href: '/chat', icon: '💬', title: 'Chat' },
  { href: '/vault', icon: '🔐', title: 'Vault' },
  { href: '/memories', icon: '📝', title: 'Memories' },
  { href: '/personality', icon: '🧬', title: 'Personality' },
  { href: '/mood', icon: '🎭', title: 'Mood' },
]

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[m][n]
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // "Did you mean?" suggestions based on URL path
  const suggestions = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ''
    if (!lastSegment) return []

    const normalized = lastSegment.toLowerCase().replace(/-/g, ' ')

    return FEATURES
      .map(f => ({
        ...f,
        distance: Math.min(
          levenshtein(normalized, f.title.toLowerCase()),
          levenshtein(normalized, f.href.replace('/', '').replace(/-/g, ' ')),
          f.title.toLowerCase().includes(normalized) || normalized.includes(f.title.toLowerCase()) ? 0 : 99
        )
      }))
      .filter(f => f.distance <= 5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
  }, [pathname])

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent)',
            top: '-10%',
            left: '-10%',
            animation: 'float-orb 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #a855f7, transparent)',
            bottom: '-5%',
            right: '-5%',
            animation: 'float-orb 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #c084fc, transparent)',
            top: '40%',
            left: '60%',
            animation: 'float-orb 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Floating elements */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {['🧠', '✨', '💭', '🔮', '⚡', '🌀'].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                left: `${10 + (i * 15) % 80}%`,
                top: `${15 + (i * 17) % 70}%`,
                animation: `float-element ${5 + (i % 3) * 2}s ease-in-out ${i * 0.8}s infinite`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 text-center px-6 max-w-lg w-full">
        {/* Animated brain emoji */}
        <div
          className={`text-8xl mb-6 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ animation: mounted ? 'float-brain 3s ease-in-out infinite' : 'none' }}
        >
          🧠
        </div>

        {/* 404 gradient text */}
        <h1
          className={`text-9xl font-black mb-3 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc, #e879f9)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: mounted ? 'gradient-text 4s ease infinite' : 'none',
          }}
        >
          404
        </h1>

        {/* Page not found */}
        <h2
          className={`text-2xl font-semibold text-white mb-2 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Page Not Found
        </h2>

        <p
          className={`text-gray-400 mb-8 text-sm transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          This consciousness doesn&apos;t exist... yet ✨
        </p>

        {/* Did you mean? suggestions */}
        {suggestions.length > 0 && (
          <div
            className={`mb-6 transition-all duration-700 delay-[450ms] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Did you mean?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300 text-sm text-white/60 hover:text-white/90 group"
                >
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                  <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className={`mb-8 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search features..."
              className="w-full px-5 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Popular pages */}
        <div
          className={`mb-8 transition-all duration-700 delay-[550ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xs text-white/25 uppercase tracking-wider mb-3">Popular Pages</p>
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_PAGES.map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.05] transition-all duration-300 hover:scale-105 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{p.icon}</span>
                <span className="text-[10px] font-medium text-white/35 group-hover:text-white/60 transition-colors">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div
          className={`flex gap-3 justify-center transition-all duration-700 delay-[600ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-medium text-white/60 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80 transition-all duration-300 hover:scale-105 text-sm"
          >
            ← Go Back
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 text-sm"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            }}
          >
            🏠 Go Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-brain {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-element {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-20px) rotate(10deg); opacity: 0.2; }
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
