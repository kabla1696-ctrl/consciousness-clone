'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  { id: 'career', label: 'Career', icon: '💼', color: 'from-blue-500 to-indigo-500' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: 'from-rose-500 to-pink-500' },
  { id: 'personal-growth', label: 'Personal Growth', icon: '🌱', color: 'from-green-500 to-emerald-500' },
  { id: 'health', label: 'Health', icon: '💪', color: 'from-amber-500 to-orange-500' },
]

export default function Predictions() {
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

      // Generate a fun "accuracy" score (random between 65-95)
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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🔮</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Predictions</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              AI-powered forecasts
            </p>
          </div>
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-white/40 hover:text-violet-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Saved Predictions */}
        {showSaved && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Saved Predictions</h3>
              <span className="text-xs text-white/30">{predictions.length}</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {predictions.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No predictions yet</p>
              ) : (
                predictions.map(p => (
                  <div key={p.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center gap-3 hover:bg-white/[0.02] transition">
                    <button
                      onClick={() => { setPrediction(p.content); setAccuracy(p.accuracy); setSelectedCategory(p.category); setSelectedTimeframe(p.timeframe); setShowSaved(false) }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span>{CATEGORIES.find(c => c.id === p.category)?.icon}</span>
                        <p className="text-sm text-white/70 font-medium capitalize">{p.category.replace('-', ' ')}</p>
                        <span className="text-xs text-white/30">· {p.timeframe}yr</span>
                      </div>
                      <p className="text-xs text-white/30 truncate mt-0.5">{p.content.slice(0, 80)}...</p>
                    </button>
                    <button onClick={() => deletePrediction(p.id)} className="text-white/20 hover:text-red-400 transition p-1">
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
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Time Horizon</label>
          <div className="flex gap-2">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                  selectedTimeframe === tf.id
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] text-white/50'
                }`}
              >
                <span className="mr-1">{tf.emoji}</span> {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Life Category</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl text-left transition ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} shadow-lg`
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <p className="text-xs font-medium text-white/80 mt-1">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePrediction}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 mb-6"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Reading the Stars...
            </>
          ) : (
            <>
              <span>🔮</span> Predict My Future
            </>
          )}
        </button>

        {/* Prediction Display */}
        {prediction && (
          <div className="space-y-4">
            {/* Accuracy Meter */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">Prediction Confidence</h3>
                <span className="text-lg font-bold text-violet-400">{accuracy}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000 ease-out"
                  style={{ width: generating ? '0%' : `${accuracy}%` }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-white/20">Speculative</span>
                <span className="text-[10px] text-white/20">Highly Likely</span>
              </div>
              {/* Fun visual gauge */}
              <div className="flex justify-center mt-4">
                <div className="relative w-32 h-16">
                  <svg viewBox="0 0 120 60" className="w-full h-full">
                    {/* Background arc */}
                    <path
                      d="M 10 55 A 50 50 0 0 1 110 55"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <path
                      d="M 10 55 A 50 50 0 0 1 110 55"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(accuracy / 100) * 157} 157`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                    {/* Needle */}
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
            <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${CATEGORIES.find(c => c.id === selectedCategory)?.color} flex items-center justify-center text-lg`}>
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/80 capitalize">
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
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-xs text-white/20">AI prediction · For entertainment only</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(prediction)
                    alert('Prediction copied!')
                  }}
                  className="text-xs text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!prediction && !generating && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-white/30 text-sm">Choose a timeframe and category to see your future</p>
            <p className="text-white/20 text-xs mt-1">Based on patterns in your memories</p>
          </div>
        )}
      </div>
    </main>
  )
}
