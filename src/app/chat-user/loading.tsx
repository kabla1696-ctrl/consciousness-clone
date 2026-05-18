'use client'

export default function ChatUserLoading() {
  return (
    <main className="min-h-screen bg-[#050510] flex flex-col" style={{ background: 'linear-gradient(180deg, #050510, #080818)' }}>
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06]" style={{ background: 'rgba(5,5,16,0.9)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 shimmer" />
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-white/5 shimmer" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white/5 shimmer border-2 border-[#050510]" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-24 rounded bg-white/5 shimmer" />
            <div className="h-2 w-14 rounded bg-white/3 shimmer" />
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/5 shimmer" />
          <div className="w-9 h-9 rounded-lg bg-white/5 shimmer" />
        </div>
      </header>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-hidden px-4 py-4 relative z-10" style={{ paddingBottom: '100px' }}>
        {/* Date separator */}
        <div className="flex items-center justify-center my-4">
          <div className="h-5 w-16 rounded-full bg-white/5 shimmer" />
        </div>

        {/* Received messages */}
        <div className="flex items-start gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-white/5 shimmer flex-shrink-0 mt-1" />
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 space-y-2">
              <div className="h-3.5 w-40 rounded bg-white/5 shimmer" />
            </div>
            <div className="h-2 w-10 rounded bg-white/3 shimmer" />
          </div>
        </div>

        <div className="flex items-start gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full flex-shrink-0 mt-1" />
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 space-y-2">
              <div className="h-3.5 w-52 rounded bg-white/5 shimmer" />
              <div className="h-3.5 w-32 rounded bg-white/5 shimmer" />
            </div>
            <div className="h-2 w-10 rounded bg-white/3 shimmer" />
          </div>
        </div>

        {/* Sent messages */}
        <div className="flex justify-end mb-1.5">
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/[0.06] px-3.5 py-2.5">
              <div className="h-3.5 w-36 rounded bg-white/5 shimmer" />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <div className="h-2 w-10 rounded bg-white/3 shimmer" />
              <div className="h-2 w-4 rounded bg-white/3 shimmer" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-1.5">
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/[0.06] px-3.5 py-2.5 space-y-2">
              <div className="h-3.5 w-48 rounded bg-white/5 shimmer" />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <div className="h-2 w-10 rounded bg-white/3 shimmer" />
              <div className="h-2 w-4 rounded bg-white/3 shimmer" />
            </div>
          </div>
        </div>

        {/* Received message */}
        <div className="flex items-start gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-white/5 shimmer flex-shrink-0 mt-1" />
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5">
              <div className="h-3.5 w-28 rounded bg-white/5 shimmer" />
            </div>
            <div className="h-2 w-10 rounded bg-white/3 shimmer" />
          </div>
        </div>

        {/* Date separator */}
        <div className="flex items-center justify-center my-4">
          <div className="h-5 w-20 rounded-full bg-white/5 shimmer" />
        </div>

        {/* More messages */}
        <div className="flex items-start gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-white/5 shimmer flex-shrink-0 mt-1" />
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 space-y-2">
              <div className="h-3.5 w-44 rounded bg-white/5 shimmer" />
              <div className="h-3.5 w-28 rounded bg-white/5 shimmer" />
            </div>
            <div className="h-2 w-10 rounded bg-white/3 shimmer" />
          </div>
        </div>

        <div className="flex justify-end mb-1.5">
          <div className="max-w-[75%] space-y-1">
            <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/[0.06] px-3.5 py-2.5">
              <div className="h-3.5 w-32 rounded bg-white/5 shimmer" />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <div className="h-2 w-10 rounded bg-white/3 shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Input bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 backdrop-blur-xl border-t border-white/[0.06]" style={{ background: 'rgba(5,5,16,0.95)' }}>
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
          <div className="flex-1 h-11 rounded-2xl bg-white/5 shimmer border border-white/[0.06]" />
          <div className="w-10 h-10 rounded-xl bg-white/5 shimmer" />
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
