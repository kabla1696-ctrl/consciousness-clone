'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PAGES = [
  { path: '/dashboard', label: 'Home' },
  { path: '/clone-feed', label: 'Feed' },
  { path: '/clone-connect', label: 'Chat' },
  { path: '/vault', label: 'Vault' },
  { path: '/profile', label: 'Profile' },
]

const MIN_SWIPE_DISTANCE = 80

export default function SwipeNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const isHorizontalRef = useRef<boolean | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const currentIndex = PAGES.findIndex((p) =>
    pathname === p.path || pathname.startsWith(p.path + '/')
  )
  const canSwipeLeft = currentIndex < PAGES.length - 1
  const canSwipeRight = currentIndex > 0

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      startXRef.current = touch.clientX
      startYRef.current = touch.clientY
      isHorizontalRef.current = null
      setDirection(null)
      setIsSwiping(true)
    },
    []
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping) return

      const touch = e.touches[0]
      const deltaX = touch.clientX - startXRef.current
      const deltaY = touch.clientY - startYRef.current

      // Determine direction on first significant move
      if (isHorizontalRef.current === null) {
        if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
          isHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY)
        }
        return
      }

      // If vertical scroll, don't interfere
      if (!isHorizontalRef.current) return

      e.preventDefault()

      // Only allow swipe if there's a page to navigate to
      if (deltaX < 0 && !canSwipeLeft) return
      if (deltaX > 0 && !canSwipeRight) return

      setDirection(deltaX < 0 ? 'left' : 'right')

      // Rubber-band effect
      const absDelta = Math.abs(deltaX)
      const rubberBand =
        absDelta > MIN_SWIPE_DISTANCE
          ? MIN_SWIPE_DISTANCE + (absDelta - MIN_SWIPE_DISTANCE) * 0.3
          : absDelta

      setSwipeOffset((deltaX < 0 ? -1 : 1) * Math.min(rubberBand, 150))
    },
    [isSwiping, canSwipeLeft, canSwipeRight]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return
    setIsSwiping(false)

    const absOffset = Math.abs(swipeOffset)

    if (absOffset >= MIN_SWIPE_DISTANCE && direction) {
      if (direction === 'left' && canSwipeLeft) {
        router.push(PAGES[currentIndex + 1].path)
      } else if (direction === 'right' && canSwipeRight) {
        router.push(PAGES[currentIndex - 1].path)
      }
    }

    setSwipeOffset(0)
    setDirection(null)
    isHorizontalRef.current = null
  }, [
    isSwiping,
    swipeOffset,
    direction,
    canSwipeLeft,
    canSwipeRight,
    currentIndex,
    router,
  ])

  if (!isMobile) return <>{children}</>

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slide container */}
      <div
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
      >
        {children}
      </div>

      {/* Page indicator dots */}
      <div className="fixed bottom-20 left-0 right-0 z-[90] flex justify-center gap-1.5 pointer-events-none md:hidden">
        {PAGES.map((page, i) => (
          <div
            key={page.path}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-5 h-1.5 bg-gradient-to-r from-violet-500 to-pink-500'
                : 'w-1.5 h-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
