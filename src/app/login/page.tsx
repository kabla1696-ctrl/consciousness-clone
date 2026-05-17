'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-browser'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[#050510]">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2e] to-[#050510]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30">🧠</div>
            <span className="text-2xl font-bold">Consciousness Clone</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-white/40">Sign in to your digital self</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-white/[0.06] p-8 space-y-5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-violet-400 hover:underline">Sign up free</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
