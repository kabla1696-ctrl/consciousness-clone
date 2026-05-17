'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Idea {
  id: string
  text: string
  category: string
  saved: boolean
  timestamp: string
}

const CATEGORIES = [
  { key: 'writing', label: 'Writing', icon: '✍️', color: 'from-blue-500 to-cyan-500' },
  { key: 'business', label: 'Business', icon: '💼', color: 'from-amber-500 to-orange-500' },
  { key: 'art', label: 'Art', icon: '🎨', color: 'from-pink-500 to-rose-500' },
  { key: 'cooking', label: 'Cooking', icon: '🍳', color: 'from-red-500 to-orange-500' },
  { key: 'travel', label: 'Travel', icon: '✈️', color: 'from-sky-500 to-blue-500' },
  { key: 'learning', label: 'Learning', icon: '📚', color: 'from-emerald-500 to-teal-500' },
]

const STORAGE_KEY = 'consciousness-ideas'

export default function IdeaGeneratorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('writing')
  const [generating, setGenerating] = useState(false)
  const [currentIdeas, setCurrentIdeas] = useState<Idea[]>([])
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([])
  const [history, setHistory] = useState<Idea[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.saved) setSavedIdeas(parsed.saved)
        if (parsed.history) setHistory(parsed.history)
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ saved: savedIdeas, history }))
    }
  }, [savedIdeas, history, loading])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const catInfo = CATEGORIES.find(c => c.key === selectedCategory)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate 5 creative and unique ${catInfo?.label || selectedCategory} ideas. ${customPrompt ? `Additional context: ${customPrompt}.` : ''} Make them practical, inspiring, and diverse. Return as a JSON array of 5 strings. Only return valid JSON, no markdown or explanation.`,
        }),
      })
      const data = await res.json()

      let ideas: string[] = []
      try {
        let parsed = data.reply || data.content || ''
        const jsonMatch = parsed.match(/\[[\s\S]*\]/)
        if (jsonMatch) parsed = jsonMatch[0]
        ideas = JSON.parse(parsed)
      } catch {
        // Fallback ideas
        const fallback: Record<string, string[]> = {
          writing: ['Write a short story from the perspective of your childhood pet', 'Create a poem using only song titles', 'Write a letter to your future self 10 years from now', 'Describe your perfect day in exactly 100 words', 'Write a mini-mystery set in your neighborhood'],
          business: ['Create a subscription box for local artisan goods', 'Build an app that connects neighbors for skill swaps', 'Start a micro-newsletter for your niche hobby', 'Design a product that solves a daily annoyance', 'Launch a weekend workshop series in your community'],
          art: ['Create a series of portraits using only geometric shapes', 'Make art from recycled materials found in one walk', 'Paint the same scene in 4 different emotional styles', 'Design a font inspired by your handwriting', 'Create a visual diary — one drawing per day for a week'],
          cooking: ['Recreate your grandmother\'s recipe with a modern twist', 'Cook a meal using only 5 ingredients from your pantry', 'Try a cuisine you\'ve never cooked before this weekend', 'Create a signature dish that represents your personality', 'Host a themed dinner party with dishes from a fictional world'],
          travel: ['Plan a "staycation" exploring hidden gems in your own city', 'Create a food tour of your neighborhood', 'Visit a place within 2 hours you\'ve never been to', 'Plan a trip around a single theme (coffee, street art, history)', 'Recreate a travel experience from a movie you love'],
          learning: ['Learn the basics of a new language in 30 days', 'Take an online course in something completely unrelated to your work', 'Read a book from a genre you never choose', 'Watch a documentary about a topic you know nothing about', 'Learn a new skill by teaching it to someone else'],
        }
        ideas = fallback[selectedCategory] || fallback.writing
      }

      const newIdeas: Idea[] = ideas.slice(0, 5).map((text, i) => ({
        id: `${Date.now()}-${i}`,
        text: typeof text === 'string' ? text : String(text),
        category: selectedCategory,
        saved: false,
        timestamp: new Date().toISOString(),
      }))

      setCurrentIdeas(newIdeas)
      setHistory(prev => [...newIdeas, ...prev].slice(0, 50))
    } catch {
      setCurrentIdeas([{
        id: Date.now().toString(),
        text: 'Could not generate ideas. Please try again.',
        category: selectedCategory,
        saved: false,
        timestamp: new Date().toISOString(),
      }])
    }
    setGenerating(false)
  }

  const toggleSave = (idea: Idea) => {
    if (savedIdeas.find(s => s.id === idea.id)) {
      setSavedIdeas(prev => prev.filter(s => s.id !== idea.id))
      setCurrentIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, saved: false } : i))
      setHistory(prev => prev.map(i => i.id === idea.id ? { ...i, saved: false } : i))
    } else {
      const saved = { ...idea, saved: true }
      setSavedIdeas(prev => [saved, ...prev])
      setCurrentIdeas(prev => prev.map(i => i.id === idea.id ? { ...i, saved: true } : i))
      setHistory(prev => prev.map(i => i.id === idea.id ? { ...i, saved: true } : i))
    }
  }

  const deleteSaved = (id: string) => {
    setSavedIdeas(prev => prev.filter(s => s.id !== id))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h1 className="text-lg font-bold">Idea Generator</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs px-3 py-1.5 rounded-lg tap-feedback ${
              showHistory ? 'bg-violet-500/20 text-violet-400' : 'text-white/40 bg-white/[0.04]'
            }`}
          >
            {showHistory ? '✕' : '📋 History'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Category Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block">Choose a category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl tap-feedback ${
                  selectedCategory === cat.key
                    ? 'bg-violet-500/15 border-2 border-violet-500/40 scale-[1.02]'
                    : 'bg-white/[0.02] border border-white/[0.06]'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-xs ${selectedCategory === cat.key ? 'text-violet-400 font-semibold' : 'text-white/40'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt */}
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-1 block">Any specific theme? (optional)</label>
          <input
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            placeholder="e.g., ideas for a rainy day, something for beginners..."
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3.5 rounded-xl tap-feedback disabled:opacity-40 mb-6"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              Generating ideas...
            </span>
          ) : (
            '✨ Generate Ideas'
          )}
        </button>

        {/* Current Ideas */}
        {currentIdeas.length > 0 && !showHistory && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              💡 Your Ideas
            </h2>
            <div className="space-y-2">
              {currentIdeas.map((idea, i) => {
                const catInfo = CATEGORIES.find(c => c.key === idea.category)
                const isSaved = savedIdeas.some(s => s.id === idea.id)
                return (
                  <div
                    key={idea.id}
                    className="rounded-xl border border-white/[0.06] p-4 bg-white/[0.02]"
                    style={{ animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{catInfo?.icon || '💡'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70">{idea.text}</p>
                      </div>
                      <button
                        onClick={() => toggleSave(idea)}
                        className={`text-lg tap-feedback shrink-0 ${isSaved ? 'text-amber-400' : 'text-white/20'}`}
                      >
                        {isSaved ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Saved Ideas */}
        {!showHistory && savedIdeas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              ⭐ Saved Ideas ({savedIdeas.length})
            </h2>
            <div className="space-y-2">
              {savedIdeas.slice(0, 10).map(idea => {
                const catInfo = CATEGORIES.find(c => c.key === idea.category)
                return (
                  <div
                    key={idea.id}
                    className="rounded-xl border border-amber-500/20 p-3 bg-amber-500/[0.03]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-sm mt-0.5">{catInfo?.icon || '💡'}</span>
                      <p className="text-xs text-white/60 flex-1">{idea.text}</p>
                      <button
                        onClick={() => deleteSaved(idea.id)}
                        className="text-xs text-white/20 hover:text-red-400 tap-feedback shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* History View */}
        {showHistory && (
          <div>
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
              📋 Generation History ({history.length})
            </h2>
            {history.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No ideas generated yet</p>
            ) : (
              <div className="space-y-2">
                {history.map(idea => {
                  const catInfo = CATEGORIES.find(c => c.key === idea.category)
                  const isSaved = savedIdeas.some(s => s.id === idea.id)
                  return (
                    <div
                      key={idea.id}
                      className="rounded-xl border border-white/[0.06] p-3 bg-white/[0.02]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{catInfo?.icon || '💡'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/60">{idea.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/20">{catInfo?.label}</span>
                            <span className="text-[10px] text-white/15">
                              {new Date(idea.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSave(idea)}
                          className={`text-sm tap-feedback shrink-0 ${isSaved ? 'text-amber-400' : 'text-white/20'}`}
                        >
                          {isSaved ? '⭐' : '☆'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {currentIdeas.length === 0 && savedIdeas.length === 0 && !showHistory && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-lg font-bold mb-2">Spark Your Creativity</h2>
            <p className="text-white/30 text-sm max-w-sm mx-auto">
              Pick a category and let your AI clone generate personalized creative ideas based on your personality and interests.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
