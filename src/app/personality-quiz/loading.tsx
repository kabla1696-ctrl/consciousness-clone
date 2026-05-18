'use client'

export default function PersonalityQuizLoading() {
  return (
    <main className="min-h-screen bg-[#050510] page-transition pb-24">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="h-5 w-32 rounded bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Intro card skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-white/5 shimmer" />
          <div className="h-6 w-48 mx-auto rounded bg-white/5 shimmer" />
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded bg-white/3 shimmer" />
            <div className="h-3.5 w-4/5 mx-auto rounded bg-white/3 shimmer" />
          </div>
          <div className="h-12 w-40 mx-auto rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Progress bar skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
          <div className="flex justify-between mb-2">
            <div className="h-3 w-20 rounded bg-white/3 shimmer" />
            <div className="h-3 w-10 rounded bg-white/3 shimmer" />
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full">
            <div className="h-2.5 w-1/4 rounded-full bg-white/5 shimmer" />
          </div>
        </div>

        {/* Question card skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-5">
          <div className="h-5 w-8 rounded bg-white/5 shimmer mb-2" />
          <div className="h-6 w-full rounded bg-white/5 shimmer" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 w-full rounded-xl bg-white/5 shimmer border border-white/[0.06]" />
            ))}
          </div>
        </div>

        {/* Nav buttons skeleton */}
        <div className="flex gap-3">
          <div className="flex-1 h-12 rounded-xl bg-white/5 shimmer" />
          <div className="flex-1 h-12 rounded-xl bg-white/5 shimmer" />
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
