'use client'

/* ------------------------------------------------------------------ */
/*  Cached features list                                               */
/* ------------------------------------------------------------------ */

const CACHED_FEATURES = [
  { icon: '🧠', label: 'Previously loaded conversations' },
  { icon: '🎭', label: 'Clone personality profiles' },
  { icon: '📖', label: 'Saved memory stories' },
  { icon: '⚙️', label: 'App settings & preferences' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Animated connection-lost illustration */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-purple-500/10 animate-pulse" />

          {/* Wifi-off icon */}
          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-sm border border-white/10">
            <span className="text-5xl" role="img" aria-label="Offline">
              📡
            </span>
          </div>

          {/* Floating signal waves (decorative) */}
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-purple-500/20 animate-bounce" />
          <div className="absolute -bottom-1 -left-3 h-4 w-4 rounded-full bg-indigo-500/20 animate-bounce [animation-delay:200ms]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          You&apos;re Offline
        </h1>

        {/* Subtitle */}
        <p className="text-purple-300/60 text-lg mb-8">
          Your consciousness is resting…
        </p>

        {/* Status card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-300/80">
              Connection lost
            </span>
          </div>

          <p className="text-sm text-purple-200/50 mb-5">
            Some features are still available from your local cache:
          </p>

          <ul className="space-y-3">
            {CACHED_FEATURES.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 border border-white/5"
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-purple-100/70">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Retry button */}
        <button
          onClick={() => window.location.reload()}
          className="
            inline-flex items-center gap-2 rounded-xl
            bg-gradient-to-r from-purple-500 to-indigo-500
            px-6 py-3 text-sm font-semibold text-white
            shadow-lg shadow-purple-500/25
            hover:shadow-purple-500/40 hover:brightness-110
            active:scale-[0.98] transition-all duration-200
          "
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>

        {/* Footer note */}
        <p className="mt-6 text-xs text-purple-400/30">
          Reconnect to access all features
        </p>
      </div>
    </main>
  )
}
