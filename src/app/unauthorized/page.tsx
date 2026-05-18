'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function UnauthorizedContent() {
  const [mounted, setMounted] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  useEffect(() => {
    setMounted(true)
  }, [])

  const loginHref = redirect
    ? `/login?redirect=${encodeURIComponent(redirect)}`
    : '/login'

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#050510' }}
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent)',
            top: '-15%',
            left: '-10%',
            animation: 'float-orb 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #a855f7, transparent)',
            bottom: '-10%',
            right: '-5%',
            animation: 'float-orb 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div
        className={`relative z-10 text-center px-6 max-w-md w-full transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Animated lock icon */}
        <div
          className="mb-8"
          style={{
            animation: mounted ? 'float-lock 3s ease-in-out infinite' : 'none',
          }}
        >
          <div className="relative inline-block">
            <svg
              className="w-24 h-24 mx-auto"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lock body */}
              <rect
                x="5"
                y="11"
                width="14"
                height="10"
                rx="2"
                fill="url(#lock-gradient)"
                opacity="0.3"
                stroke="url(#lock-gradient)"
                strokeWidth="1.5"
              />
              {/* Lock shackle - animated */}
              <path
                d="M8 11V7a4 4 0 0 1 8 0v4"
                stroke="url(#lock-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                className="origin-[12px_11px]"
                style={{
                  animation: mounted
                    ? 'lock-shackle 4s ease-in-out infinite'
                    : 'none',
                }}
              />
              {/* Keyhole */}
              <circle cx="12" cy="15" r="1.5" fill="#a855f7" opacity="0.8" />
              <rect
                x="11.25"
                y="16"
                width="1.5"
                height="2.5"
                rx="0.75"
                fill="#a855f7"
                opacity="0.8"
              />
              <defs>
                <linearGradient
                  id="lock-gradient"
                  x1="5"
                  y1="7"
                  x2="19"
                  y2="21"
                >
                  <stop stopColor="#7c3aed" />
                  <stop offset="0.5" stopColor="#a855f7" />
                  <stop offset="1" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glow effect */}
            <div
              className="absolute inset-0 -z-10 blur-2xl opacity-30"
              style={{
                background:
                  'radial-gradient(circle, #a855f7, transparent 70%)',
              }}
            />
          </div>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              background:
                'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: mounted
                ? 'gradient-text 4s ease infinite'
                : 'none',
            }}
          >
            Authentication Required
          </h1>

          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Please sign in to continue.
            <br />
            Your consciousness awaits. 🔐
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href={loginHref}
              className="block w-full px-6 py-3 rounded-xl font-medium text-white text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 text-sm"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              }}
            >
              🔑 Sign In
            </Link>

            <Link
              href="/signup"
              className="block w-full px-6 py-3 rounded-xl font-medium text-white/60 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80 transition-all duration-300 hover:scale-105 text-sm text-center"
            >
              ✨ Create Account
            </Link>
          </div>

          <p className="text-white/15 text-xs mt-6">
            New to Consciousness Clone? Sign up to begin your digital journey.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float-lock {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes lock-shackle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: '#050510' }}
        >
          <div className="text-white/20 text-sm">Loading...</div>
        </div>
      }
    >
      <UnauthorizedContent />
    </Suspense>
  )
}
