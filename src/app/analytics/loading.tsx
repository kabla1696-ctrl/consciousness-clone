'use client'

export default function AnalyticsLoading() {
  return (
    <main className="min-h-screen relative" style={{ background: '#050510' }}>
      {/* Navbar skeleton */}
      <nav className="fixed top-0 w-full z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
            <div className="h-5 w-40 rounded bg-white/5 shimmer" />
          </div>
          <div className="flex gap-6 items-center">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-16 rounded bg-white/3 shimmer" />
            ))}
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto relative z-10 pb-16 md:pb-8">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-6 w-24 rounded-full bg-white/5 shimmer mb-4" />
          <div className="h-14 w-64 rounded-lg bg-white/5 shimmer mb-3" />
          <div className="h-5 w-48 rounded bg-white/3 shimmer" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
              <div className="h-10 w-10 mx-auto rounded-xl bg-white/5 shimmer mb-3" />
              <div className="h-10 w-16 mx-auto rounded-lg bg-white/5 shimmer mb-2" />
              <div className="h-3 w-20 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Two column layout skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Category breakdown */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
              <div className="h-5 w-32 rounded bg-white/5 shimmer" />
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2.5">
                    <div className="h-3.5 w-20 rounded bg-white/5 shimmer" />
                    <div className="h-3 w-8 rounded bg-white/3 shimmer" />
                  </div>
                  <div className="w-full h-3 bg-white/[0.03] rounded-full">
                    <div className="h-3 rounded-full bg-white/5 shimmer" style={{ width: `${80 - i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood distribution */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
              <div className="h-5 w-28 rounded bg-white/5 shimmer" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 w-28 rounded-xl bg-white/5 shimmer border border-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>

        {/* Recent activity skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
            <div className="h-5 w-32 rounded bg-white/5 shimmer" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5 px-4 rounded-xl">
                <div className="w-11 h-11 rounded-xl bg-white/5 shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full rounded bg-white/5 shimmer" />
                  <div className="h-3 w-32 rounded bg-white/3 shimmer" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/5 shimmer" />
              </div>
            ))}
          </div>
        </div>

        {/* Insights skeleton */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
            <div className="h-5 w-24 rounded bg-white/5 shimmer" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="h-7 w-7 rounded bg-white/5 shimmer" />
                <div className="h-4 flex-1 rounded bg-white/5 shimmer" />
              </div>
            ))}
          </div>
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
