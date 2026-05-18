'use client'

export default function ChatLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-[#050510] relative">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3 max-w-3xl mx-auto">
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-32 rounded bg-white/5 shimmer" />
            <div className="h-2 w-16 rounded bg-white/3 shimmer" />
          </div>
        </div>
      </header>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-hidden px-4 pt-4 pb-28">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Clone message - left aligned */}
          <div className="flex justify-start">
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-white/5 shimmer" />
                <div className="h-2 w-10 rounded bg-white/3 shimmer" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] px-4 py-3 space-y-2">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-4/5 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1 ml-1" />
            </div>
          </div>

          {/* User message - right aligned */}
          <div className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/[0.06] px-4 py-3">
                <div className="h-3.5 w-48 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1 mr-1 ml-auto" />
            </div>
          </div>

          {/* Clone message - left aligned */}
          <div className="flex justify-start">
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-white/5 shimmer" />
                <div className="h-2 w-10 rounded bg-white/3 shimmer" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] px-4 py-3 space-y-2">
                <div className="h-3.5 w-full rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-3/5 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1 ml-1" />
            </div>
          </div>

          {/* User message - right aligned */}
          <div className="flex justify-end">
            <div className="max-w-[75%]">
              <div className="rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-white/[0.06] px-4 py-3 space-y-2">
                <div className="h-3.5 w-40 rounded bg-white/5 shimmer" />
                <div className="h-3.5 w-24 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1 mr-1 ml-auto" />
            </div>
          </div>

          {/* Clone message - left aligned */}
          <div className="flex justify-start">
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-white/5 shimmer" />
                <div className="h-2 w-10 rounded bg-white/3 shimmer" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06] px-4 py-3">
                <div className="h-3.5 w-56 rounded bg-white/5 shimmer" />
              </div>
              <div className="h-2 w-12 rounded bg-white/3 shimmer mt-1 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Input bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050510]/90 backdrop-blur-2xl border-t border-white/[0.03]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-2">
            <div className="flex-1 h-12 rounded-xl bg-white/3 shimmer" />
            <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
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
