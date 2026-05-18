'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const ONBOARDING_KEY = 'onboarding-completed'

interface Step {
  emoji: string
  title: string
  description: string
  gradient: string
  iconBg: string
}

const steps: Step[] = [
  {
    emoji: '🧠',
    title: 'Welcome to Consciousness Clone',
    description:
      'Your journey into digital immortality begins here. We capture the essence of who you are — your thoughts, memories, and personality.',
    gradient: 'from-purple-900 via-indigo-900 to-blue-900',
    iconBg: 'from-purple-500 to-indigo-500',
  },
  {
    emoji: '🔐',
    title: 'Your Digital Memory',
    description:
      'Every conversation, every thought, every memory — securely stored in your personal vault. Your consciousness, preserved forever.',
    gradient: 'from-blue-900 via-cyan-900 to-teal-900',
    iconBg: 'from-blue-500 to-cyan-500',
  },
  {
    emoji: '💬',
    title: 'Talk to Your Clone',
    description:
      'Have natural conversations with your digital self. Ask questions, share ideas, or just chat — your clone learns and grows with you.',
    gradient: 'from-teal-900 via-emerald-900 to-green-900',
    iconBg: 'from-teal-500 to-emerald-500',
  },
  {
    emoji: '♾️',
    title: 'Live Forever',
    description:
      'Your consciousness transcends time. Share your wisdom with future generations. Leave a legacy that never fades.',
    gradient: 'from-green-900 via-amber-900 to-orange-900',
    iconBg: 'from-green-500 to-amber-500',
  },
  {
    emoji: '🚀',
    title: 'Get Started',
    description:
      'Begin your journey to digital immortality. Create your consciousness clone and start building your forever legacy.',
    gradient: 'from-orange-900 via-rose-900 to-purple-900',
    iconBg: 'from-orange-500 to-rose-500',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Redirect if already completed
  useEffect(() => {
    try {
      if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
        router.replace('/dashboard')
      }
    } catch {}
  }, [router])

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length || animating) return
      setAnimating(true)
      setCurrentStep(index)
      setTimeout(() => setAnimating(false), 350)
    },
    [animating]
  )

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, goToStep])

  const prev = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const complete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {}
    router.replace('/dashboard')
  }, [router])

  const skip = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true')
    } catch {}
    router.replace('/dashboard')
  }, [router])

  // Touch/swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Only horizontal swipes (ignore vertical scrolls)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0) {
          next() // swipe left → next
        } else {
          prev() // swipe right → prev
        }
      }
    },
    [next, prev]
  )

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-gradient-to-br ${step.gradient} transition-all duration-700 ease-in-out`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      {!isLast && (
        <button
          onClick={skip}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          Skip
        </button>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {/* Icon with animation */}
        <div
          className={`mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${step.iconBg} shadow-2xl transition-all duration-500 ${
            animating ? 'scale-75 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            animation: animating ? 'none' : 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <span className="text-6xl" role="img" aria-label={step.title}>
            {step.emoji}
          </span>
        </div>

        {/* Title */}
        <h1
          className={`mb-4 text-center text-3xl font-bold text-white transition-all duration-500 delay-100 ${
            animating
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          {step.title}
        </h1>

        {/* Description */}
        <p
          className={`max-w-sm text-center text-base leading-relaxed text-white/70 transition-all duration-500 delay-200 ${
            animating
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          {step.description}
        </p>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-6 pb-12">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'h-2.5 w-8 bg-white'
                  : 'h-2.5 w-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex w-full max-w-xs gap-3 px-4">
          {currentStep > 0 && (
            <button
              onClick={prev}
              className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Back
            </button>
          )}

          {isLast ? (
            <button
              onClick={complete}
              className="flex-1 rounded-2xl bg-white py-3.5 font-semibold text-black shadow-lg shadow-white/20 transition hover:bg-white/90 active:scale-95"
            >
              Get Started ✨
            </button>
          ) : (
            <button
              onClick={next}
              className="flex-1 rounded-2xl bg-white/15 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
            >
              Continue
            </button>
          )}
        </div>
      </div>

      {/* Keyframe styles */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1),
              0 0 60px rgba(255, 255, 255, 0.05);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.2),
              0 0 80px rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  )
}
