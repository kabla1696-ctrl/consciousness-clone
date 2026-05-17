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

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#d946ef' : '#06b6d4',
            '--duration': `${Math.random() * 10 + 7}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="ambient-orb ambient-orb-violet" style={{ width: 280, height: 280, top: '10%', right: '-8%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 220, height: 220, bottom: '15%', left: '-5%' }} />
    </div>
  )
}

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
        const jsonMatch = data.reply.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      } catch {
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

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        finishQuiz(newScore)
      }
    }, 1500)
  }

  const finishQuiz = async (finalScore: number) => {
    setState('finished')
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
      try { await navigator.share({ text, title: 'Clone Quiz Results' }) } catch {}
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
      <main className="min-h-screen animated-gradient-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const progress = questions.length > 0 ? ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100 : 0
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition">
      <Particles />

      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(5, 5, 16, 0.85)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-lg hover:bg-white/[0.04] transition-all">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">🧩</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Clone Quiz</h1>
            <p className="text-[10px] text-white/30">How well does your clone know you?</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto relative z-10">
        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white/30 text-sm">Loading...</p>
          </div>
        )}

        {/* Ready State */}
        {state === 'ready' && (
          <div className="flex flex-col items-center text-center py-8 animate-slide-up">
            <div className="relative mb-8">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-6xl shadow-2xl shadow-violet-500/10">
                🧩
              </div>
              <div className="absolute inset-0 bg-violet-500/10 rounded-3xl blur-2xl" />
            </div>
            <h2 className="text-3xl font-black gradient-text mb-2">Clone Quiz</h2>
            <p className="text-white/30 text-sm mb-2 max-w-xs leading-relaxed">
              Test how well your AI clone knows you! 10 questions generated from your memories.
            </p>
            <p className="text-white/15 text-xs mb-8">
              ⚡ Requires at least 3 stored memories
            </p>

            {error && (
              <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-4 mb-6 glass-card">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={generateQuestions}
              disabled={generating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold text-base glow-btn disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>🎮 Start Quiz</>
              )}
            </button>

            <p className="text-white/10 text-xs mt-4">Questions are AI-generated from your memories</p>
          </div>
        )}

        {/* Playing State */}
        {state === 'playing' && questions.length > 0 && (
          <div className="animate-slide-up">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/30 text-xs font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-violet-400 text-xs font-bold">
                  Score: {score}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden premium-progress">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
                  }}
                />
              </div>
            </div>

            {/* Category Badge */}
            <div className="flex justify-center mb-5">
              <span className="px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                {questions[currentIndex].category}
              </span>
            </div>

            {/* Question */}
            <div className="glass-card p-7 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-3xl" />
              <h3 className="text-xl font-bold text-center leading-relaxed text-white/90">
                {questions[currentIndex].question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 stagger-children">
              {questions[currentIndex].options.map((option, i) => {
                const isCorrect = i === questions[currentIndex].correctIndex
                const isSelected = selectedAnswer === i
                const isWrong = showResult && isSelected && !isCorrect

                let borderColor = 'border-white/[0.06]'
                let bgColor = 'bg-white/[0.02]'
                let textColor = 'text-white/80'
                let shadowStyle = {}

                if (showResult) {
                  if (isCorrect) {
                    borderColor = 'border-emerald-500/50'
                    bgColor = 'bg-emerald-500/10'
                    textColor = 'text-emerald-400'
                    shadowStyle = { boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)' }
                  } else if (isWrong) {
                    borderColor = 'border-red-500/50'
                    bgColor = 'bg-red-500/10'
                    textColor = 'text-red-400'
                    shadowStyle = { boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' }
                  } else {
                    borderColor = 'border-white/[0.02]'
                    bgColor = 'bg-white/[0.01]'
                    textColor = 'text-white/15'
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(i)}
                    disabled={showResult}
                    className={`w-full p-5 rounded-2xl border ${borderColor} ${bgColor} text-left transition-all duration-300 hover-lift`}
                    style={shadowStyle}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl ${showResult && isCorrect ? 'bg-emerald-500/20' : showResult && isWrong ? 'bg-red-500/20' : 'bg-white/[0.04]'} flex items-center justify-center text-xs font-bold ${textColor} transition-all`}>
                        {showResult && isCorrect ? '✓' : showResult && isWrong ? '✗' : String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-sm font-medium ${textColor} transition-all`}>{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Feedback */}
            {showResult && (
              <div className="mt-5 text-center animate-slide-up">
                <span className={`text-base font-bold ${selectedAnswer === questions[currentIndex].correctIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedAnswer === questions[currentIndex].correctIndex ? '✅ Correct!' : '❌ Wrong!'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Finished State */}
        {state === 'finished' && (
          <div className="flex flex-col items-center text-center py-8 animate-slide-up">
            {/* Score Circle */}
            <div className="relative w-44 h-44 mb-8">
              <svg className="w-44 h-44 -rotate-90" viewBox="0 0 128 128">
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
                <span className="text-5xl font-black gradient-text">{percentage}%</span>
                <span className="text-white/25 text-xs mt-1 font-medium">Knows You</span>
              </div>
              <div className="absolute inset-0 bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            <h2 className="text-3xl font-black mb-2">
              {percentage >= 80 ? '🧠 Your Clone Knows You!' :
               percentage >= 50 ? '🤔 Getting There...' :
               '📝 Need More Memories!'}
            </h2>
            <p className="text-white/30 text-base mb-2 font-medium">
              {score} out of {questions.length} correct
            </p>
            <p className="text-white/15 text-xs mb-8 max-w-xs">
              {percentage >= 80 ? 'Your consciousness clone is well-trained!' :
               percentage >= 50 ? 'Add more memories to improve accuracy.' :
               'Your clone needs more data to know you better.'}
            </p>

            {/* Answer Summary */}
            <div className="w-full glass-card p-5 mb-6">
              <h3 className="text-sm font-semibold text-white/50 mb-3">Answer Summary</h3>
              <div className="grid grid-cols-5 gap-2">
                {answers.map((answer, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 ${
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
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-bold glow-btn flex items-center justify-center gap-2"
              >
                📤 Share Results
              </button>
              <button
                onClick={restartQuiz}
                className="w-full py-4 rounded-2xl glass-card font-semibold flex items-center justify-center gap-2 text-white/50 hover:text-white/70 hover:border-violet-500/20 transition-all"
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
