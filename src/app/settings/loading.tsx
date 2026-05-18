'use client'

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Title skeleton */}
        <div className="h-7 w-32 rounded bg-white/5 shimmer mb-8" />

        {/* Accent color section skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div className="h-4 w-24 rounded bg-white/5 shimmer uppercase tracking-wider" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 shimmer" />
                <div className="h-3 w-10 rounded bg-white/3 shimmer" />
              </div>
            ))}
          </div>
          <div className="h-14 w-full rounded-xl bg-white/5 shimmer" />
        </div>

        {/* Sound effects section skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div className="h-4 w-28 rounded bg-white/5 shimmer uppercase tracking-wider" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-white/5 shimmer" />
            <div className="h-7 w-12 rounded-full bg-white/5 shimmer" />
          </div>
        </div>

        {/* Notifications section skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div className="h-4 w-28 rounded bg-white/5 shimmer uppercase tracking-wider" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-white/5 shimmer" />
            <div className="h-7 w-12 rounded-full bg-white/5 shimmer" />
          </div>
        </div>

        {/* Data section skeleton */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 space-y-4">
          <div className="h-4 w-16 rounded bg-white/5 shimmer uppercase tracking-wider" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-4 w-32 rounded bg-white/5 shimmer" />
              <div className="h-8 w-20 rounded-lg bg-white/5 shimmer" />
            </div>
          ))}
        </div>

        {/* Danger zone skeleton */}
        <div className="bg-red-500/[0.03] rounded-2xl border border-red-500/20 p-5 space-y-4">
          <div className="h-4 w-24 rounded bg-white/5 shimmer" />
          <div className="h-10 w-full rounded-xl bg-white/5 shimmer" />
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
    </div>
  )
}
