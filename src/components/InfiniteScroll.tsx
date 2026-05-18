'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface InfiniteScrollProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loadMore: () => Promise<void>
  hasMore: boolean
  threshold?: number
  className?: string
}

export default function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  threshold = 200,
  className = '',
}: InfiniteScrollProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    try {
      await loadMore()
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, loadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          handleLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore, hasMore, isLoading, threshold])

  return (
    <div className={className}>
      {items.map((item, index) => renderItem(item, index))}

      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-8 h-8 border-2 border-fuchsia-500/20 border-b-fuchsia-500 rounded-full animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
            />
          </div>
          <span className="ml-3 text-white/30 text-sm">Loading more...</span>
        </div>
      )}

      {/* No more items message */}
      {!hasMore && items.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="px-4 text-white/20 text-xs font-medium">No more items</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      )}

      {/* Empty state */}
      {!hasMore && items.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-white/25 text-sm">Nothing here yet</p>
        </div>
      )}
    </div>
  )
}
