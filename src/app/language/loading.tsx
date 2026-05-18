'use client'

export default function LanguageLoading() {
  return (
    <main className="min-h-screen pb-24 md:pb-8" style={{ background: '#050510' }}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
          <div className="h-5 w-5 rounded bg-white/5 shimmer" />
          <div className="h-5 w-20 rounded bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 pb-24 md:pb-8 relative z-10 space-y-6">
        {/* Current language card skeleton */}
        <div className="rounded-xl border border-blue-500/20 p-5" style={{ background: 'rgba(59,130,246,0.03)' }}>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded bg-white/5 shimmer" />
            <div className="space-y-2">
              <div className="h-5 w-24 rounded bg-white/5 shimmer" />
              <div className="h-3 w-32 rounded bg-white/3 shimmer" />
            </div>
          </div>
        </div>

        {/* Search bar skeleton */}
        <div className="h-11 w-full rounded-xl bg-white/5 shimmer border border-white/[0.06]" />

        {/* Language list skeleton */}
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-8 h-8 rounded bg-white/5 shimmer" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-28 rounded bg-white/5 shimmer" />
                <div className="h-3 w-20 rounded bg-white/3 shimmer" />
              </div>
              <div className="h-5 w-12 rounded-full bg-white/5 shimmer" />
              <div className="w-5 h-5 rounded bg-white/5 shimmer" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(124, 58, 237, 0.06) 40%,
            rgba(168, 85, 247, 0.1) 50%,
            rgba(124, 58, 237, 0.06) 60%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer-slide 1.8s ease-in-out infinite;
        }
        @keyframes shimmer-slide {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </main>
  )
}
