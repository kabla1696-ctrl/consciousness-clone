'use client'

type SkeletonVariant = 'grid' | 'list' | 'chat' | 'form' | 'article'

interface PageSkeletonProps {
  variant?: SkeletonVariant
  title?: string
}

function ShimmerBar({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-white/5 shimmer rounded ${className}`} style={style} />
}

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-white/5 shimmer" />
        <ShimmerBar className="h-5 w-28" />
      </div>
    </header>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 space-y-3">
          <div className="w-full aspect-square rounded-xl bg-white/5 shimmer" />
          <ShimmerBar className="h-4 w-3/4" />
          <ShimmerBar className="h-3 w-1/2" />
          <div className="flex items-center gap-2">
            <ShimmerBar className="h-6 w-16 rounded-full" />
            <ShimmerBar className="h-6 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 shimmer flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <ShimmerBar className="h-4 w-3/5" />
              <ShimmerBar className="h-3 w-4/5" />
            </div>
            <ShimmerBar className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {/* Date separator */}
      <div className="flex justify-center">
        <ShimmerBar className="h-5 w-20 rounded-full" />
      </div>

      {/* Received */}
      {[...Array(3)].map((_, i) => (
        <div key={`recv-${i}`} className="flex items-start gap-2">
          <div className="w-7 h-7 rounded-full bg-white/5 shimmer flex-shrink-0 mt-1" />
          <div className="max-w-[70%] space-y-1">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 space-y-2">
              <ShimmerBar className="h-3.5" style={{ width: `${100 + i * 40}px` }} />
              {i === 1 && <ShimmerBar className="h-3.5 w-32" />}
            </div>
            <ShimmerBar className="h-2 w-10" />
          </div>
        </div>
      ))}

      {/* Sent */}
      {[...Array(2)].map((_, i) => (
        <div key={`sent-${i}`} className="flex justify-end">
          <div className="max-w-[70%] space-y-1">
            <div className="rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-white/[0.06] px-3.5 py-2.5">
              <ShimmerBar className="h-3.5" style={{ width: `${120 + i * 60}px` }} />
            </div>
            <div className="flex items-center gap-1 justify-end">
              <ShimmerBar className="h-2 w-10" />
              <ShimmerBar className="h-2 w-4" />
            </div>
          </div>
        </div>
      ))}

      {/* More received */}
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-white/5 shimmer flex-shrink-0 mt-1" />
        <div className="max-w-[70%] space-y-1">
          <div className="rounded-2xl rounded-bl-md bg-white/[0.05] border border-white/[0.06] px-3.5 py-2.5 space-y-2">
            <ShimmerBar className="h-3.5 w-44" />
            <ShimmerBar className="h-3.5 w-28" />
          </div>
          <ShimmerBar className="h-2 w-10" />
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
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title area */}
      <div className="space-y-2">
        <ShimmerBar className="h-7 w-48" />
        <ShimmerBar className="h-4 w-64" />
      </div>

      {/* Form fields */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <ShimmerBar className="h-3 w-20" />
          <div className="h-12 rounded-xl bg-white/5 shimmer border border-white/[0.06]" />
        </div>
      ))}

      {/* Textarea */}
      <div className="space-y-2">
        <ShimmerBar className="h-3 w-24" />
        <div className="h-32 rounded-xl bg-white/5 shimmer border border-white/[0.06]" />
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4">
        <div className="space-y-2">
          <ShimmerBar className="h-4 w-28" />
          <ShimmerBar className="h-3 w-40" />
        </div>
        <div className="w-12 h-7 rounded-full bg-white/5 shimmer" />
      </div>

      {/* Submit button */}
      <div className="h-12 rounded-xl bg-white/5 shimmer" />
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-3">
        <ShimmerBar className="h-8 w-4/5" />
        <ShimmerBar className="h-8 w-3/5" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/5 shimmer" />
        <div className="space-y-2">
          <ShimmerBar className="h-4 w-28" />
          <ShimmerBar className="h-3 w-36" />
        </div>
      </div>

      {/* Cover image */}
      <div className="w-full aspect-video rounded-2xl bg-white/5 shimmer" />

      {/* Paragraphs */}
      <div className="space-y-4">
        <div className="space-y-2">
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-11/12" />
          <ShimmerBar className="h-4 w-4/5" />
        </div>

        {/* Subheading */}
        <ShimmerBar className="h-6 w-2/5 mt-6" />

        <div className="space-y-2">
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-3/4" />
        </div>

        {/* Blockquote */}
        <div className="border-l-2 border-violet-500/30 pl-4 space-y-2">
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-5/6" />
        </div>

        <div className="space-y-2">
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-full" />
          <ShimmerBar className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

const variantComponents: Record<SkeletonVariant, React.ComponentType> = {
  grid: GridSkeleton,
  list: ListSkeleton,
  chat: ChatSkeleton,
  form: FormSkeleton,
  article: ArticleSkeleton,
}

export default function PageSkeleton({ variant = 'list', title }: PageSkeletonProps) {
  const VariantComponent = variantComponents[variant]

  return (
    <main className="min-h-screen pb-24 md:pb-8" style={{ background: '#050510' }}>
      <HeaderSkeleton />

      <div className="px-4 py-6 space-y-6 relative z-10">
        {title && (
          <div className="space-y-2">
            <ShimmerBar className="h-7 w-40" />
            <ShimmerBar className="h-4 w-56" />
          </div>
        )}
        <VariantComponent />
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
