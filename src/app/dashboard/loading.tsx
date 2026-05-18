export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#050510' }}>
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-8 w-64 rounded-lg bg-white/5 shimmer mb-3" />
        <div className="h-4 w-96 rounded-lg bg-white/3 shimmer" />
      </div>

      {/* Stats section skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-20 rounded bg-white/5 shimmer" />
              <div className="h-8 w-8 rounded-lg bg-white/5 shimmer" />
            </div>
            <div className="h-7 w-28 rounded-lg bg-white/5 shimmer mb-2" />
            <div className="h-3 w-36 rounded bg-white/3 shimmer" />
          </div>
        ))}
      </div>

      {/* Features grid skeleton */}
      <div className="mb-6">
        <div className="h-6 w-40 rounded-lg bg-white/5 shimmer mb-6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 group"
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="h-12 w-12 rounded-xl bg-white/5 shimmer shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-32 rounded bg-white/5 shimmer mb-2" />
                <div className="h-3 w-full rounded bg-white/3 shimmer" />
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="h-3 w-full rounded bg-white/3 shimmer" />
              <div className="h-3 w-4/5 rounded bg-white/3 shimmer" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-white/3 shimmer" />
              <div className="h-8 w-20 rounded-lg bg-white/5 shimmer" />
            </div>
          </div>
        ))}
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
  );
}
