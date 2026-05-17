'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  category: string
}

type QuizState = 'loading' | 'ready' | 'playing' | 'finished'

export default function CloneQuiz() {
  const [user, setUser] = useState<any>(null)
  const [state, setState] = useState<QuizState>('loading')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setState('ready')
    }
    init()
  }, [])

  const generateQuestions = async () => {
    if (!user) return
    setGenerating(true)
    setError('')

    try {
      // Fetch user's memories
      const { data: memories } = await supabase
        .from('memories')
        .select('content, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (!memories || memories.length < 3) {
        setError('Add at least 3 memories before playing the quiz! 📝')
        setGenerating(false)
        return
      }

      const memoryContext = memories.map((m, i) =>
        `[${m.category || 'general'}] ${m.content}`
      ).join('\n')

      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Based on these memories about me, generate exactly 10 multiple-choice quiz questions that test how well my AI clone knows me. Each question should have 4 options with one correct answer.

Format your response as a JSON array like this:
[
  {
    "question": "What is my favorite food?",
    "options": ["Pizza", "Sushi", "Pasta", "Burgers"],
    "correctIndex": 1,
    "category": "Food"
  }
]

Make the wrong answers plausible but clearly wrong. Mix categories: preferences, experiences, habits, relationships, opinions, etc.

Memories:
${memoryContext}`,
          }],
          memories: memoryContext,
          task: 'quiz_generation',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate questions')

      const data = await response.json()
      let parsed: QuizQuestion[]

      try {
        // Try to parse JSON from the reply
        const jsonMatch = data.reply.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch {
        // Fallback: generate basic questions from memories
        parsed = generateFallbackQuestions(memories)
      }

      if (parsed.length < 5) {
        parsed = generateFallbackQuestions(memories)
      }

      setQuestions(parsed.slice(0, 10))
      setAnswers(new Array(Math.min(parsed.length, 10)).fill(null))
      setState('playing')
    } catch (err) {
      console.error('Quiz generation error:', err)
      setError('Failed to generate questions. Try again!')
    }

    setGenerating(false)
  }

  const generateFallbackQuestions = (memories: any[]): QuizQuestion[] => {
    const shuffled = [...memories].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10).map((mem, i) => {
      const otherMems = shuffled.filter((_, j) => j !== i).slice(0, 3)
      return {
        question: `Which of these is one of your memories?`,
        options: [mem.content.slice(0, 80), ...otherMems.map((m: any) => m.content.slice(0, 80))].sort(() => Math.random() - 0.5),
        correctIndex: 0,
        category: mem.category || 'General',
      }
    })
  }

  const selectAnswer = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
    setShowResult(true)

    const isCorrect = index === questions[currentIndex].correctIndex
    const newScore = isCorrect ? score + 1 : score
    if (isCorrect) setScore(newScore)

    const newAnswers = [...answers]
    newAnswers[currentIndex] = index
    setAnswers(newAnswers)

    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        // Quiz finished
        finishQuiz(newScore)
      }
    }, 1500)
  }

  const finishQuiz = async (finalScore: number) => {
    setState('finished')

    // Save result
    if (user) {
      await supabase.from('clone_quiz_results').insert({
        user_id: user.id,
        score: finalScore,
        total_questions: questions.length,
        category: 'mixed',
      })
    }
  }

  const shareResults = async () => {
    const text = `🧠 My Consciousness Clone knows me ${Math.round((score / questions.length) * 100)}%! ${score}/${questions.length} correct. How well does YOUR clone know you? #ConsciousnessClone`
    if (navigator.share) {
      try {
        await navigator.share({ text, title: 'Clone Quiz Results' })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      alert('Results copied to clipboard! 📋')
    }
  }

  const restartQuiz = () => {
    setState('ready')
    setQuestions([])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setError('')
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const progress = questions.length > 0 ? ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100 : 0
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🧩</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Clone Quiz</h1>
            <p className="text-[10px] text-white/40">How well does your clone know you?</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/40 text-sm">Loading...</p>
          </div>
        )}

        {/* Ready State */}
        {state === 'ready' && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-5xl mb-6">
              🧩
            </div>
            <h2 className="text-2xl font-bold mb-2">Clone Quiz</h2>
            <p className="text-white/40 text-sm mb-2 max-w-xs">
              Test how well your AI clone knows you! 10 questions generated from your memories.
            </p>
            <p className="text-white/25 text-xs mb-8">
              ⚡ Requires at least 3 stored memories
            </p>

            {error && (
              <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={generateQuestions}
              disabled={generating}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-base tap-feedback disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  🎮 Start Quiz
                </>
              )}
            </button>

            <p className="text-white/20 text-xs mt-4">Questions are AI-generated from your memories</p>
          </div>
        )}

        {/* Playing State */}
        {state === 'playing' && questions.length > 0 && (
          <div>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/40 text-xs">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-violet-400 text-xs font-medium">
                  Score: {score}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Category Badge */}
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs">
                {questions[currentIndex].category}
              </span>
            </div>

            {/* Question */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6">
              <h3 className="text-lg font-semibold text-center leading-relaxed">
                {questions[currentIndex].question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentIndex].options.map((option, i) => {
                const isCorrect = i === questions[currentIndex].correctIndex
                const isSelected = selectedAnswer === i
                const isWrong = showResult && isSelected && !isCorrect

                let borderColor = 'border-white/[0.06]'
                let bgColor = 'bg-white/[0.02]'
                let textColor = 'text-white/80'

                if (showResult) {
                  if (isCorrect) {
                    borderColor = 'border-emerald-500/40'
                    bgColor = 'bg-emerald-500/10'
                    textColor = 'text-emerald-400'
                  } else if (isWrong) {
                    borderColor = 'border-red-500/40'
                    bgColor = 'bg-red-500/10'
                    textColor = 'text-red-400'
                  } else {
                    borderColor = 'border-white/[0.03]'
                    bgColor = 'bg-white/[0.01]'
                    textColor = 'text-white/20'
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border ${borderColor} ${bgColor} text-left tap-feedback transition-all duration-200`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${showResult && isCorrect ? 'bg-emerald-500/20' : 'bg-white/[0.04]'} flex items-center justify-center text-xs font-medium ${textColor}`}>
                        {showResult && isCorrect ? '✓' : showResult && isWrong ? '✗' : String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-sm ${textColor}`}>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className="mt-4 text-center">
                <span className={`text-sm font-medium ${selectedAnswer === questions[currentIndex].correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedAnswer === questions[currentIndex].correctIndex ? '✅ Correct!' : '❌ Wrong!'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Finished State */}
        {state === 'finished' && (
          <div className="flex flex-col items-center text-center py-8">
            {/* Score Circle */}
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-40 h-40 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.04)" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / questions.length)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{percentage}%</span>
                <span className="text-white/30 text-xs mt-1">Knows You</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {percentage >= 80 ? '🧠 Your Clone Knows You!' :
               percentage >= 50 ? '🤔 Getting There...' :
               '📝 Need More Memories!'}
            </h2>
            <p className="text-white/40 text-sm mb-2">
              {score} out of {questions.length} correct
            </p>
            <p className="text-white/25 text-xs mb-8">
              {percentage >= 80 ? 'Your consciousness clone is well-trained!' :
               percentage >= 50 ? 'Add more memories to improve accuracy.' :
               'Your clone needs more data to know you better.'}
            </p>

            {/* Answer Summary */}
            <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
              <h3 className="text-sm font-medium text-white/60 mb-3">Answer Summary</h3>
              <div className="grid grid-cols-5 gap-2">
                {answers.map((answer, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                      answer === questions[i]?.correctIndex
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/20 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
              <button
                onClick={shareResults}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold tap-feedback flex items-center justify-center gap-2"
              >
                📤 Share Results
              </button>
              <button
                onClick={restartQuiz}
                className="w-full py-4 rounded-xl border border-white/[0.06] bg-white/[0.02] font-semibold tap-feedback flex items-center justify-center gap-2 text-white/60"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
