'use client'

export default function MoodTrackerLoading() {
  return (
    <main className="min-h-screen bg-[#050510] page-transition pb-24">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="h-5 w-28 rounded bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Today's mood card skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 text-center space-y-4">
          <div className="h-5 w-32 mx-auto rounded bg-white/5 shimmer" />
          <div className="flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl bg-white/5 shimmer" />
            ))}
          </div>
          <div className="h-12 w-full rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-3 text-center">
              <div className="text-2xl mb-1">
                <div className="h-7 w-10 mx-auto rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2.5 w-14 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Weekly chart skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
          <div className="h-5 w-24 rounded bg-white/5 shimmer mb-4" />
          <div className="flex items-end justify-between gap-2 h-32">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-white/5 shimmer" style={{ height: `${30 + Math.random() * 70}%` }} />
                <div className="h-2.5 w-6 rounded bg-white/3 shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Mood history skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-28 rounded bg-white/5 shimmer" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 rounded bg-white/5 shimmer" />
                <div className="h-3 w-32 rounded bg-white/3 shimmer" />
              </div>
              <div className="h-3 w-16 rounded bg-white/3 shimmer" />
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
