'use client'

export default function AchievementsLoading() {
  return (
    <main className="min-h-screen pb-24" style={{ background: '#050510' }}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="h-5 w-28 rounded bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 text-center">
              <div className="h-7 w-10 mx-auto rounded bg-white/5 shimmer mb-1" />
              <div className="h-2.5 w-14 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Progress bar skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
          <div className="flex justify-between mb-2">
            <div className="h-3 w-16 rounded bg-white/3 shimmer" />
            <div className="h-3 w-10 rounded bg-white/3 shimmer" />
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full">
            <div className="h-3 w-1/3 rounded-full bg-white/5 shimmer" />
          </div>
        </div>

        {/* Category filter skeleton */}
        <div className="flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-white/5 shimmer" />
          ))}
        </div>

        {/* Achievement cards skeleton */}
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 shimmer flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-28 rounded bg-white/5 shimmer" />
                    <div className="h-4 w-14 rounded-full bg-white/5 shimmer" />
                  </div>
                  <div className="h-3 w-40 rounded bg-white/3 shimmer" />
                  <div className="mt-2">
                    <div className="w-full h-2 bg-white/5 rounded-full">
                      <div className="h-2 rounded-full bg-white/5 shimmer" style={{ width: `${20 + i * 10}%` }} />
                    </div>
                    <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1" />
                  </div>
                </div>
              </div>
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
