'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Prediction {
  id: string
  category: string
  timeframe: string
  content: string
  accuracy: number
  created_at: string
}

const TIMEFRAMES = [
  { id: '1', label: '1 Year', emoji: '📅' },
  { id: '5', label: '5 Years', emoji: '🗓️' },
  { id: '10', label: '10 Years', emoji: '🔮' },
  { id: '20', label: '20 Years', emoji: '🌌' },
]

const CATEGORIES = [
  { id: 'career', label: 'Career', icon: '💼', color: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/20' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/20' },
  { id: 'personal-growth', label: 'Personal Growth', icon: '🌱', color: 'from-green-500 to-emerald-500', glow: 'shadow-green-500/20' },
  { id: 'health', label: 'Health', icon: '💪', color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
]

export default function Predictions() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('5')
  const [selectedCategory, setSelectedCategory] = useState('career')
  const [generating, setGenerating] = useState(false)
  const [prediction, setPrediction] = useState('')
  const [accuracy, setAccuracy] = useState(0)
  const [memoryContext, setMemoryContext] = useState('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: memories } = await supabase
        .from('memories')
        .select('content, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(80)

      if (memories) {
        setMemoryContext(memories.map(m => `[${m.category}] ${m.content}`).join('\n'))
      }

      const stored = localStorage.getItem('predictions-history')
      if (stored) setPredictions(JSON.parse(stored))
    }
    init()
  }, [])

  const generatePrediction = async () => {
    if (generating) return
    setGenerating(true)
    setPrediction('')
    setAccuracy(0)

    const categoryLabel = CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Based on this person's memories and patterns, predict their ${categoryLabel} in ${selectedTimeframe} years. Be specific and thoughtful. Consider their past trajectory, values, and patterns to make a realistic, personalized prediction.`
          }],
          memories: memoryContext,
          systemPrompt: `You are a thoughtful life analyst and futurist. Based on someone's memories and life patterns, make specific, personalized predictions about their future. 

Be realistic but optimistic. Ground predictions in their actual experiences and patterns. Make it feel personal — reference specific things from their memories that inform the prediction.

Structure your prediction as a narrative — paint a picture of what their ${categoryLabel.toLowerCase()} might look like in ${selectedTimeframe} years. Be vivid and specific, not generic.`,
        }),
      })

      const data = await response.json()
      const content = data.reply || 'Unable to generate prediction. Please try again.'
      setPrediction(content)

      const acc = Math.floor(Math.random() * 31) + 65
      setAccuracy(acc)

      const newPrediction: Prediction = {
        id: Date.now().toString(),
        category: selectedCategory,
        timeframe: selectedTimeframe,
        content,
        accuracy: acc,
        created_at: new Date().toISOString(),
      }

      const updated = [newPrediction, ...predictions].slice(0, 50)
      setPredictions(updated)
      localStorage.setItem('predictions-history', JSON.stringify(updated))
    } catch (err) {
      setPrediction('Failed to generate prediction. Please try again.')
    }

    setGenerating(false)
  }

  const deletePrediction = (id: string) => {
    const updated = predictions.filter(p => p.id !== id)
    setPredictions(updated)
    localStorage.setItem('predictions-history', JSON.stringify(updated))
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-fuchsia-500/20 border-b-fuchsia-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.06] blur-[140px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-violet-600/[0.05] blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-fuchsia-600/[0.04] blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/50 group-hover:text-violet-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/25">🔮</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('predictions')}</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
              {t('ai powered forecasts')}
            </p>
          </div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-white/40 hover:text-violet-400 transition-all duration-300 p-2 rounded-xl hover:bg-violet-500/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
        {/* Saved Predictions */}
        {showSaved && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-violet-500/[0.03]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-violet-500/[0.06] to-transparent">
              <h3 className="text-sm font-semibold text-white/90">{t('saved predictions')}</h3>
              <span className="text-xs text-violet-400/70 bg-violet-500/10 px-2 py-0.5 rounded-full">{predictions.length}</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {predictions.length === 0 ? (
                <p className="text-white/30 text-sm p-6 text-center">{t('no predictions yet')}</p>
              ) : (
                predictions.map(p => (
                  <div key={p.id} className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3 hover:bg-white/[0.04] transition-all duration-200 group">
                    <button
                      onClick={() => { setPrediction(p.content); setAccuracy(p.accuracy); setSelectedCategory(p.category); setSelectedTimeframe(p.timeframe); setShowSaved(false) }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span>{CATEGORIES.find(c => c.id === p.category)?.icon}</span>
                        <p className="text-sm text-white/70 font-medium capitalize group-hover:text-violet-300 transition-colors">{p.category.replace('-', ' ')}</p>
                        <span className="text-xs text-white/30">· {p.timeframe}yr</span>
                      </div>
                      <p className="text-xs text-white/30 truncate mt-0.5">{p.content.slice(0, 80)}...</p>
                    </button>
                    <button onClick={() => deletePrediction(p.id)} className="text-white/20 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-medium">{t('time horizon')}</label>
          <div className="flex gap-2">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedTimeframe === tf.id
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25 text-white'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] text-white/50'
                }`}
              >
                <span className="mr-1">{tf.emoji}</span> {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-medium">{t('life category')}</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3.5 rounded-xl text-left transition-all duration-300 relative overflow-hidden ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} shadow-lg ${cat.glow} scale-[1.02]`
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
                }`}
              >
                {selectedCategory === cat.id && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
                <span className="text-lg relative z-10">{cat.icon}</span>
                <p className="text-xs font-medium text-white/80 mt-1 relative z-10">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePrediction}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 font-semibold text-white transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2 mb-6 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
              <span className="relative z-10">{t('reading the stars...')}</span>
            </>
          ) : (
            <>
              <span className="relative z-10">🔮</span> <span className="relative z-10">{t('predict my future')}</span>
            </>
          )}
        </button>

        {/* Prediction Display */}
        {prediction && (
          <div className="space-y-4">
            {/* Accuracy Meter */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 shadow-2xl shadow-violet-500/[0.03] relative group">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/15 via-indigo-500/15 to-violet-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm -z-10" />

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/90">{t('prediction confidence')}</h3>
                <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{accuracy}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out shadow-sm shadow-violet-500/50"
                  style={{ width: generating ? '0%' : `${accuracy}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/20">{t('speculative')}</span>
                <span className="text-[10px] text-white/20">{t('highly likely')}</span>
              </div>
              {/* Fun visual gauge */}
              <div className="flex justify-center mt-4">
                <div className="relative w-32 h-16">
                  <svg viewBox="0 0 120 60" className="w-full h-full">
                    <path
                      d="M 10 55 A 50 50 0 0 1 110 55"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 55 A 50 50 0 0 1 110 55"
                      fill="none"
                      stroke="url(#predictionGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(accuracy / 100) * 157} 157`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="predictionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                    <line
                      x1="60"
                      y1="55"
                      x2={60 + 35 * Math.cos(Math.PI - (accuracy / 100) * Math.PI)}
                      y2={55 - 35 * Math.sin((accuracy / 100) * Math.PI)}
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      opacity="0.6"
                      className="transition-all duration-1000 ease-out"
                    />
                    <circle cx="60" cy="55" r="4" fill="white" opacity="0.4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="rounded-2xl border border-violet-500/[0.12] bg-gradient-to-b from-violet-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-violet-500/[0.05] relative group">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15 to-violet-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm -z-10" />

              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3 bg-gradient-to-r from-violet-500/[0.06] to-transparent">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${CATEGORIES.find(c => c.id === selectedCategory)?.color} flex items-center justify-center text-lg shadow-lg`}>
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90 capitalize">
                    {selectedCategory.replace('-', ' ')} in {selectedTimeframe} {parseInt(selectedTimeframe) === 1 ? 'Year' : 'Years'}
                  </h3>
                  <p className="text-xs text-white/30">
                    {new Date().toLocaleDateString()} → {new Date(Date.now() + parseInt(selectedTimeframe) * 365.25 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="px-5 py-5">
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{prediction}</p>
              </div>
              <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-violet-500/[0.04] to-transparent">
                <span className="text-xs text-white/20">{t('ai prediction disclaimer')}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(prediction)
                    alert(t('prediction copied!'))
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-all duration-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-violet-500/10"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t('copy')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!prediction && !generating && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-bounce">✨</div>
            <p className="text-white/40 text-sm font-medium">{t('choose timeframe and category')}</p>
            <p className="text-white/20 text-xs mt-1.5">{t('based on patterns in memories')}</p>
          </div>
        )}
      </div>
    </main>
  )
}
