'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const t = useT()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <main className="min-h-screen bg-[#030108] flex flex-col page-transition relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/12 blur-[110px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[30%] w-[250px] h-[250px] rounded-full bg-pink-500/8 blur-[80px] animate-pulse" style={{ animationDelay: '2.5s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Back button */}
      <div className="pt-4 px-4 safe-top relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/30 text-sm tap-feedback hover:text-white/60 transition-colors duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('back')}
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20 relative z-10">
        <div className="text-center mb-10">
          {/* Glowing icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 blur-lg opacity-50 animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-fuchsia-500/80 to-violet-500/80 backdrop-blur-sm flex items-center justify-center text-4xl border border-white/10 shadow-xl shadow-fuchsia-500/20">
              🧬
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">{t('create your clone')}</h1>
          <p className="text-white/25 text-sm mt-2 tracking-wide">{t('start your digital immortality journey')}</p>
        </div>

        {/* Glassmorphism form card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/10 to-pink-500/20 rounded-3xl blur-xl opacity-60" />
          <form onSubmit={handleSignup} className="relative space-y-4 bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-6 shadow-2xl shadow-black/40">
            <div className="space-y-1">
              <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium pl-1">{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-white/20 text-base focus:outline-none focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/10 focus:shadow-lg focus:shadow-fuchsia-500/10 transition-all duration-300"
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium pl-1">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-white/20 text-base focus:outline-none focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/10 focus:shadow-lg focus:shadow-fuchsia-500/10 transition-all duration-300"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoCapitalize="none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium pl-1">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder:text-white/20 text-base focus:outline-none focus:border-fuchsia-500/40 focus:ring-2 focus:ring-fuchsia-500/10 focus:shadow-lg focus:shadow-fuchsia-500/10 transition-all duration-300"
                placeholder="Min 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/[0.08] border border-red-500/20 py-2.5 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl font-semibold text-base tap-feedback disabled:opacity-40 overflow-hidden group transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-fuchsia-600 bg-[length:200%_100%] group-hover:animate-[shimmer_2s_ease-in-out_infinite] transition-all" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-fuchsia-400/20 to-violet-400/20 blur-xl" />
              <span className="relative z-10">{loading ? t('creating') : t('create account')}</span>
            </button>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/20 text-sm">
            {t('already have an account')}{' '}
            <Link href="/login" className="text-fuchsia-400 font-medium hover:text-fuchsia-300 transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(232,121,249,0.4)]">
              {t('login')}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
