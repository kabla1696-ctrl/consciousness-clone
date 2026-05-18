'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface LazyLoadProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export default function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
}: LazyLoadProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true)
      setHasLoaded(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        minHeight: !hasLoaded ? '80px' : undefined,
      }}
    >
      {hasLoaded ? (
        children
      ) : (
        <div className="skeleton" style={{ height: '80px', width: '100%' }} />
      )}
    </div>
  )
}
