'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase-browser'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <main className="min-h-screen bg-[#050510] flex flex-col page-transition">
      {/* Back button */}
      <div className="pt-4 px-4 safe-top">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 text-sm tap-feedback">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pb-20">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl mb-4">
            🧠
          </div>
          <h1 className="text-2xl font-bold">Create Your Clone</h1>
          <p className="text-white/30 text-sm mt-1">Start your digital immortality journey</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 text-base"
              placeholder="Your Name"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 text-base"
              placeholder="Email"
              required
              autoComplete="email"
              autoCapitalize="none"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-white/25 text-base"
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold text-base tap-feedback disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-white/30 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-violet-400 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
