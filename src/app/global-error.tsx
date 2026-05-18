'use client'

import { useEffect, useState } from 'react'
import { errorMonitor } from '../lib/error-monitor'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    errorMonitor.captureError(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
          style={{ background: '#050510' }}
        >
          {/* Background gradient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
              style={{
                background: 'radial-gradient(circle, #ef4444, transparent)',
                top: '-15%',
                left: '-10%',
                animation: 'float-orb 8s ease-in-out infinite',
              }}
            />
            <div
              className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
              style={{
                background: 'radial-gradient(circle, #f97316, transparent)',
                bottom: '-10%',
                right: '-5%',
                animation: 'float-orb 10s ease-in-out infinite reverse',
              }}
            />
            <div
              className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
              style={{
                background: 'radial-gradient(circle, #a855f7, transparent)',
                top: '40%',
                left: '50%',
                animation: 'float-orb 12s ease-in-out infinite',
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
            className={`relative z-10 text-center px-6 max-w-lg w-full transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Animated error icon */}
            <div
              className="text-8xl mb-6"
              style={{
                animation: mounted
                  ? 'float-brain 3s ease-in-out infinite'
                  : 'none',
              }}
            >
              ⚠️
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
                className="text-3xl font-bold mb-3"
                style={{
                  background:
                    'linear-gradient(135deg, #ef4444, #f97316, #f59e0b)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: mounted
                    ? 'gradient-text 4s ease infinite'
                    : 'none',
                }}
              >
                Something Went Wrong
              </h1>

              <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                Your consciousness encountered an unexpected glitch.
                <br />
                Don&apos;t worry — even digital minds hiccup sometimes. ✨
              </p>

              {/* Expandable error details */}
              <div className="mb-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1.5 mx-auto"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${
                      showDetails ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {showDetails ? 'Hide' : 'Show'} Error Details
                </button>

                {showDetails && (
                  <div
                    className="mt-3 p-4 rounded-xl text-left overflow-auto max-h-40"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <p className="text-xs text-red-400/80 font-mono break-all">
                      {error.message || 'Unknown error'}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-white/20 mt-2 font-mono">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    window.location.href = '/'
                  }}
                  className="px-5 py-2.5 rounded-xl font-medium text-white/60 bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80 transition-all duration-300 hover:scale-105 text-sm"
                >
                  🏠 Go Home
                </button>
                <button
                  onClick={() => reset()}
                  className="px-5 py-2.5 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 text-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, #7c3aed, #a855f7)',
                  }}
                >
                  🔄 Try Again
                </button>
              </div>
            </div>

            {/* Subtle footer */}
            <p className="text-white/10 text-xs mt-6">
              If this persists, the digital cosmos might need a moment.
            </p>
          </div>

          <style>{`
            @keyframes float-brain {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            @keyframes float-orb {
              0%, 100% { transform: translate(0, 0); }
              50% { transform: translate(30px, -30px); }
            }
            @keyframes gradient-text {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>
        </div>
      </body>
    </html>
  )
}
