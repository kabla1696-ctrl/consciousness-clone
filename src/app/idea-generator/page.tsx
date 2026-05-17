'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Idea {
  id: string
  text: string
  category: string
  saved: boolean
  timestamp: string
}

const CATEGORIES = [
  { key: 'writing', label: 'Writing', icon: '✍️', color: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.15)' },
  { key: 'business', label: 'Business', icon: '💼', color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.15)' },
  { key: 'art', label: 'Art', icon: '🎨', color: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.15)' },
  { key: 'cooking', label: 'Cooking', icon: '🍳', color: 'from-red-500 to-orange-500', glow: 'rgba(239,68,68,0.15)' },
  { key: 'travel', label: 'Travel', icon: '✈️', color: 'from-sky-500 to-blue-500', glow: 'rgba(14,165,233,0.15)' },
  { key: 'learning', label: 'Learning', icon: '📚', color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.15)' },
]

const STORAGE_KEY = 'consciousness-ideas'

export default function IdeaGeneratorPage() {
  const t = useT()
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

  const activeCat = CATEGORIES.find(c => c.key === selectedCategory)

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
        <div className="w-10 h-10 rounded-full border-2 border-violet-500/60 border-t-transparent animate-spin shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-amber-600/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-fuchsia-600/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0a1a]/70 border-b border-white/[0.06] shadow-[0_1px_30px_rgba(0,0,0,0.4)]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 -ml-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <span className="text-base">💡</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">{t('idea generator')}</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs px-3.5 py-1.5 rounded-lg tap-feedback backdrop-blur-md border transition-all duration-300 ${
              showHistory
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]'
                : 'text-white/40 bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.12]'
            }`}
          >
            {showHistory ? '✕' : '📋 History'}
          </button>
        </div>
      </header>

      <div className="relative z-10 px-4 py-5 pb-24 space-y-5">
        {/* Category Selector */}
        <div>
          <label className="text-xs text-white/40 mb-2.5 block font-medium tracking-wide">Choose a category</label>
          <div className="grid grid-cols-3 gap-2.5">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`relative group flex flex-col items-center gap-1.5 p-3.5 rounded-xl tap-feedback transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'scale-[1.03]'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  {isSelected && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-[0.08]`} />
                      <div className={`absolute inset-0 border-2 border-gradient rounded-xl`} style={{ borderColor: 'rgba(139, 92, 246, 0.35)' }} />
                      <div className="absolute inset-0 rounded-xl" style={{ boxShadow: `inset 0 0 20px ${cat.glow}, 0 0 15px ${cat.glow}` }} />
                    </>
                  )}
                  <span className="text-2xl relative z-10" style={isSelected ? { filter: `drop-shadow(0 0 8px ${cat.glow})` } : {}}>{cat.icon}</span>
                  <span className={`text-xs relative z-10 font-medium ${isSelected ? 'text-violet-300' : 'text-white/40'}`}>
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom prompt */}
        <div>
          <label className="text-xs text-white/40 mb-1.5 block font-medium tracking-wide">Any specific theme? (optional)</label>
          <div className="relative">
            <input
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g., ideas for a rainy day, something for beginners..."
              className="w-full backdrop-blur-md bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-violet-500/[0.02] to-fuchsia-500/[0.02]" />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full relative group overflow-hidden rounded-xl disabled:opacity-40"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 bg-[length:200%_100%] group-hover:animate-[shimmer_2s_linear_infinite] transition-all" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-[1px] rounded-[11px] bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 group-hover:from-violet-500/90 group-hover:to-fuchsia-500/90 transition-all" />
          <div className="relative text-white font-semibold py-3.5 flex items-center justify-center gap-2">
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <span>{t('brainstorm')}...</span>
              </>
            ) : (
              <span className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">✨ {t('generate')}</span>
            )}
          </div>
        </button>

        {/* Current Ideas */}
        {currentIdeas.length > 0 && !showHistory && (
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
              Your Ideas
            </h2>
            <div className="space-y-2.5">
              {currentIdeas.map((idea, i) => {
                const catInfo = CATEGORIES.find(c => c.key === idea.category)
                const isSaved = savedIdeas.some(s => s.id === idea.id)
                return (
                  <div
                    key={idea.id}
                    className="group rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:border-violet-500/20 hover:bg-white/[0.05] transition-all duration-300 shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
                    style={{ animation: `fadeInUp 0.3s ease ${i * 0.08}s both` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-base">{catInfo?.icon || '💡'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 leading-relaxed">{idea.text}</p>
                      </div>
                      <button
                        onClick={() => toggleSave(idea)}
                        className={`text-lg tap-feedback shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isSaved
                            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : 'text-white/20 hover:text-white/40 hover:bg-white/[0.04]'
                        }`}
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
          <div>
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
              Saved Ideas ({savedIdeas.length})
            </h2>
            <div className="space-y-2.5">
              {savedIdeas.slice(0, 10).map(idea => {
                const catInfo = CATEGORIES.find(c => c.key === idea.category)
                return (
                  <div
                    key={idea.id}
                    className="rounded-xl backdrop-blur-xl bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] border border-amber-500/[0.12] p-3.5 shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:border-amber-500/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs">{catInfo?.icon || '💡'}</span>
                      </div>
                      <p className="text-xs text-white/55 flex-1 leading-relaxed">{idea.text}</p>
                      <button
                        onClick={() => deleteSaved(idea.id)}
                        className="text-xs text-white/20 hover:text-red-400 tap-feedback shrink-0 w-6 h-6 rounded-md hover:bg-red-500/10 flex items-center justify-center transition-all"
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
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              Generation History ({history.length})
            </h2>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-2xl opacity-40">📋</span>
                </div>
                <p className="text-white/25 text-sm">No ideas generated yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map(idea => {
                  const catInfo = CATEGORIES.find(c => c.key === idea.category)
                  const isSaved = savedIdeas.some(s => s.id === idea.id)
                  return (
                    <div
                      key={idea.id}
                      className="rounded-xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] p-3.5 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs">{catInfo?.icon || '💡'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/55 leading-relaxed">{idea.text}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/25 border border-white/[0.05]">{catInfo?.label}</span>
                            <span className="text-[10px] text-white/15">
                              {new Date(idea.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSave(idea)}
                          className={`text-sm tap-feedback shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all duration-300 ${
                            isSaved
                              ? 'text-amber-400 bg-amber-500/10'
                              : 'text-white/20 hover:text-white/40 hover:bg-white/[0.04]'
                          }`}
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
          <div className="text-center py-14">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 text-6xl blur-2xl opacity-20">💡</div>
              <div className="text-6xl relative" style={{ filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.25))' }}>💡</div>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-2">{t('creative ideas')}</h2>
            <p className="text-white/25 text-sm max-w-sm mx-auto leading-relaxed">
              {t('creative ideas')}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  )
}
