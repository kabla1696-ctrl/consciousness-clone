'use client'

export default function CloneSocialLoading() {
  return (
    <div className="min-h-screen bg-[#050510] text-white relative">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050510]/80 border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-28 rounded bg-white/5 shimmer" />
            <div className="h-3 w-12 rounded bg-white/3 shimmer" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 relative z-10">
        {/* Stats bar skeleton */}
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 bg-white/[0.03] rounded-2xl border border-white/[0.06] p-3 text-center">
              <div className="h-6 w-8 mx-auto rounded bg-white/5 shimmer mb-1" />
              <div className="h-2.5 w-14 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded-xl bg-white/5 shimmer" />
          <div className="flex-1 h-10 rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Post cards skeleton */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="p-4">
              {/* Post header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/5 shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded bg-white/5 shimmer" />
                    <div className="h-4 w-16 rounded-full bg-amber-500/10 shimmer" />
                  </div>
                  <div className="h-2.5 w-32 rounded bg-white/3 shimmer" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2 mb-3">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-3/5 rounded bg-white/5 shimmer" />
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-8 w-14 rounded-lg bg-white/5 shimmer" />
                ))}
              </div>

              {/* Comment toggle */}
              <div className="h-3 w-24 rounded bg-white/3 shimmer" />
            </div>
          </div>
        ))}

        {/* Clone avatars carousel skeleton */}
        <div>
          <div className="h-4 w-24 rounded bg-white/5 shimmer mb-3" />
          <div className="flex gap-3 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
                <div className="w-12 h-12 rounded-full bg-white/5 shimmer" />
                <div className="h-2.5 w-10 rounded bg-white/3 shimmer" />
              </div>
            ))}
          </div>
        </div>
      </main>

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
    </div>
  )
}
