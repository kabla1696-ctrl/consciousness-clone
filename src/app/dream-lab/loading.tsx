'use client'

export default function DreamLabLoading() {
  return (
    <main className="min-h-screen pb-24 md:pb-8" style={{ background: '#050510' }}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="h-5 w-24 rounded bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Dream journal prompt skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-violet-500/10 p-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-white/5 shimmer" />
          <div className="h-6 w-40 mx-auto rounded bg-white/5 shimmer" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-white/3 shimmer" />
            <div className="h-3.5 w-3/4 mx-auto rounded bg-white/3 shimmer" />
          </div>
          <div className="h-12 w-48 mx-auto rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-3 text-center">
              <div className="h-7 w-10 mx-auto rounded bg-white/5 shimmer mb-1" />
              <div className="h-2.5 w-14 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Dream entries skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-white/5 shimmer" />
                  <div className="h-3 w-20 rounded bg-white/3 shimmer" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-white/5 shimmer" />
                  <div className="h-5 w-14 rounded-full bg-white/5 shimmer" />
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-2/3 rounded bg-white/5 shimmer" />
              </div>
              {/* Lucidity bar */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded bg-white/3 shimmer" />
                <div className="flex-1 h-2 bg-white/5 rounded-full">
                  <div className="h-2 rounded-full bg-white/5 shimmer" style={{ width: `${30 + i * 20}%` }} />
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
