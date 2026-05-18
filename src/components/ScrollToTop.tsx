'use client'

import React, { useEffect, useState } from 'react'

const ScrollToTop = React.memo(function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className={`
        fixed bottom-6 right-6 z-50
        flex h-12 w-12 items-center justify-center
        rounded-full
        bg-gradient-to-br from-violet-500 to-fuchsia-500
        text-white shadow-lg shadow-violet-500/30
        transition-all duration-300
        hover:scale-110 hover:shadow-violet-500/50
        active:scale-95
        animate-[scroll-btn-in_300ms_ease-out]
      `}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>

      <style jsx global>{`
        @keyframes scroll-btn-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </button>
  )
})

export default ScrollToTop
