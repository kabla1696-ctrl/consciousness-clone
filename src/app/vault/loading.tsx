'use client'

export default function VaultLoading() {
  return (
    <main className="min-h-screen pb-24 md:pb-8 relative" style={{ background: '#050510' }}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-red-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="h-5 w-20 rounded bg-white/5 shimmer" />
          <div className="flex-1" />
          <div className="h-7 w-14 rounded-lg bg-white/5 shimmer" />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-3 text-center">
              <div className="h-6 w-10 mx-auto rounded bg-white/5 shimmer mb-1" />
              <div className="h-3 w-14 mx-auto rounded bg-white/3 shimmer" />
            </div>
          ))}
        </div>

        {/* Add button skeleton */}
        <div className="h-12 w-full rounded-xl bg-white/5 shimmer" />

        {/* Vault entries skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-xl border border-red-500/10 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-white/5 shimmer" />
                  <div className="h-3 w-16 rounded bg-white/5 shimmer" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-8 rounded bg-white/3 shimmer" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-4/5 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-28 rounded bg-white/3 shimmer mt-2" />
            </div>
          ))}
        </div>

        {/* Nuclear option skeleton */}
        <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/[0.03]">
          <div className="h-4 w-32 rounded bg-white/5 shimmer mb-2" />
          <div className="h-3 w-48 rounded bg-white/3 shimmer mb-3" />
          <div className="h-10 w-full rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Info skeleton */}
        <div className="space-y-1 text-center">
          <div className="h-2.5 w-48 mx-auto rounded bg-white/3 shimmer" />
          <div className="h-2.5 w-32 mx-auto rounded bg-white/3 shimmer" />
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
