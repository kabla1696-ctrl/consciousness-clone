'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050510' }}>
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">😵</div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-white/40 text-sm mb-8">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-all active:scale-95"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="px-6 py-2.5 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
