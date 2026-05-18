'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface Memory {
  id: string
  content: string
  category: string
  created_at: string
}

interface Story {
  id: string
  memoryId: string
  memoryContent: string
  style: string
  story: string
  created_at: string
}

const STYLES = [
  { id: 'novel', label: 'Novel', icon: '📖', desc: 'Literary narrative', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
  { id: 'poem', label: 'Poem', icon: '🪶', desc: 'Verse & rhythm', gradient: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', glow: 'shadow-violet-500/20' },
  { id: 'letter', label: 'Letter', icon: '✉️', desc: 'Personal epistolary', gradient: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
  { id: 'news', label: 'News', icon: '📰', desc: 'Journalistic piece', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
]

export default function MemoryStories() {
  const t = useT();
  const [user, setUser] = useState<User | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [selectedStyle, setSelectedStyle] = useState('novel')
  const [generating, setGenerating] = useState(false)
  const [currentStory, setCurrentStory] = useState('')
  const [stories, setStories] = useState<Story[]>([])
  const [showStories, setShowStories] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data } = await supabase
        .from('memories')
        .select('id, content, category, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setMemories(data as Memory[])

      const stored = localStorage.getItem('memory-stories-collection')
      if (stored) setStories(JSON.parse(stored))
    }
    init()
  }, [])

  const getStylePrompt = (style: string) => {
    switch (style) {
      case 'novel':
        return 'Transform this memory into a beautiful novel excerpt. Use rich prose, vivid descriptions, literary devices, and deep emotional resonance. Write in third person or first person — whichever serves the story better. Include dialogue if appropriate. Make it feel like a passage from a bestselling literary novel.'
      case 'poem':
        return 'Transform this memory into a beautiful poem. Use evocative imagery, rhythm, and emotional depth. The poem should capture the essence and feeling of the memory, not just the facts. Free verse or structured — whatever serves the moment best.'
      case 'letter':
        return 'Transform this memory into a heartfelt letter. Write as if the person is telling this story to someone dear to them — a friend, a future self, or a loved one. Be intimate, honest, and warm. Include the emotional weight of the experience.'
      case 'news':
        return 'Transform this memory into a compelling news article or magazine feature piece. Use journalistic style — headline, lead paragraph, quotes, narrative structure. Make it read like a feature in The New Yorker or The Atlantic. Find the universal human interest angle.'
      default:
        return 'Transform this memory into a beautiful story.'
    }
  }

  const generateStory = async () => {
    if (!selectedMemory || generating) return
    setGenerating(true)
    setCurrentStory('')

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Memory: "${selectedMemory.content}"\n\nCategory: ${selectedMemory.category}\n\n${getStylePrompt(selectedStyle)}`
          }],
          memories: '',
          systemPrompt: 'You are a masterful storyteller and writer. Transform personal memories into beautiful literary works. Be creative, evocative, and emotionally authentic. Output only the story — no meta-commentary.',
        }),
      })

      const data = await response.json()
      const story = data.reply || 'Unable to generate story. Please try again.'
      setCurrentStory(story)

      const newStory: Story = {
        id: Date.now().toString(),
        memoryId: selectedMemory.id,
        memoryContent: selectedMemory.content,
        style: selectedStyle,
        story,
        created_at: new Date().toISOString(),
      }

      const updated = [newStory, ...stories]
      setStories(updated)
      localStorage.setItem('memory-stories-collection', JSON.stringify(updated))
    } catch (err) {
      setCurrentStory('Failed to generate story. Please try again.')
    }

    setGenerating(false)
  }

  const downloadStory = () => {
    if (!currentStory) return
    const styleLabel = STYLES.find(s => s.id === selectedStyle)?.label || 'Story'
    const blob = new Blob([`${styleLabel}: A Memory Story\n\n${currentStory}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memory-story-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteStory = (id: string) => {
    const updated = stories.filter(s => s.id !== id)
    setStories(updated)
    localStorage.setItem('memory-stories-collection', JSON.stringify(updated))
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-rose-500/30 border-t-rose-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-amber-500/20 border-b-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose-600/[0.06] blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-amber-600/[0.05] blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-violet-600/[0.05] blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.06] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/50 group-hover:text-rose-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-sm shadow-lg shadow-rose-500/25">📖</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('memory stories')}</h1>
            <p className="text-[10px] text-rose-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
              {t('ai writes')}
            </p>
          </div>
          <button
            onClick={() => setShowStories(!showStories)}
            className="text-white/40 hover:text-rose-400 transition-all duration-300 p-2 rounded-xl hover:bg-rose-500/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full relative z-10">
        {/* Story Collection */}
        {showStories && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-2xl shadow-rose-500/[0.03]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-rose-500/[0.06] to-transparent">
              <h3 className="text-sm font-semibold text-white/90">{t('narrative')}</h3>
              <span className="text-xs text-rose-400/70 bg-rose-500/10 px-2 py-0.5 rounded-full">{stories.length} stories</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {stories.length === 0 ? (
                <p className="text-white/30 text-sm p-6 text-center">{t('chapters')}</p>
              ) : (
                stories.map(s => (
                  <div key={s.id} className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-3 hover:bg-white/[0.04] transition-all duration-200 group">
                    <button
                      onClick={() => { setCurrentStory(s.story); setSelectedStyle(s.style); setShowStories(false) }}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm text-white/70 font-medium truncate group-hover:text-rose-300 transition-colors">{s.memoryContent.slice(0, 60)}...</p>
                      <p className="text-xs text-white/30 capitalize">{s.style} · {new Date(s.created_at).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => deleteStory(s.id)} className="text-white/20 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
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

        {/* Memory Selector */}
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-medium">Select a Memory</label>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left hover:border-rose-500/30 transition-all duration-300 backdrop-blur-xl group"
          >
            {selectedMemory ? (
              <div>
                <p className="text-sm text-white/80 truncate">{selectedMemory.content}</p>
                <p className="text-xs text-rose-400 capitalize mt-0.5">{selectedMemory.category}</p>
              </div>
            ) : (
              <p className="text-white/30 text-sm group-hover:text-white/40 transition-colors">Choose a memory to transform...</p>
            )}
          </button>

          {showPicker && (
            <div className="mt-2 rounded-xl border border-white/[0.08] bg-[#0a0a1a]/90 backdrop-blur-2xl max-h-48 overflow-y-auto shadow-2xl shadow-black/50">
              {memories.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No memories found</p>
              ) : (
                memories.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMemory(m); setShowPicker(false) }}
                    className="w-full px-4 py-3 text-left border-b border-white/[0.04] hover:bg-white/[0.05] transition-all duration-200 group"
                  >
                    <p className="text-sm text-white/70 truncate group-hover:text-white/90 transition-colors">{m.content}</p>
                    <p className="text-xs text-white/30 capitalize">{m.category}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider font-medium">Story Style</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3.5 rounded-xl text-left transition-all duration-300 relative overflow-hidden ${
                  selectedStyle === style.id
                    ? `bg-gradient-to-r ${style.gradient} border ${style.border} shadow-lg ${style.glow}`
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
                }`}
              >
                {selectedStyle === style.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-transparent" />
                )}
                <span className="text-lg relative z-10">{style.icon}</span>
                <p className="text-sm font-medium text-white/80 mt-1 relative z-10">{style.label}</p>
                <p className="text-xs text-white/30 relative z-10">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateStory}
          disabled={generating || !selectedMemory}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 font-semibold text-white transition-all duration-300 disabled:opacity-30 flex items-center justify-center gap-2 mb-6 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
              <span className="relative z-10">Writing Story...</span>
            </>
          ) : (
            <>
              <span className="relative z-10">✨</span> <span className="relative z-10">Transform into Story</span>
            </>
          )}
        </button>

        {/* Story Display */}
        {currentStory && (
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-rose-500/[0.06] via-white/[0.02] to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-rose-500/[0.03]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-rose-500/[0.06] to-transparent">
              <h3 className="text-sm font-semibold text-white/90 capitalize">
                {STYLES.find(s => s.id === selectedStyle)?.icon} {STYLES.find(s => s.id === selectedStyle)?.label}
              </h3>
              <button
                onClick={downloadStory}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-all duration-200 px-2.5 py-1 rounded-lg hover:bg-rose-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: selectedStyle === 'novel' ? 'Georgia, serif' : undefined }}>
                {currentStory}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentStory && !generating && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-bounce">📝</div>
            <p className="text-white/40 text-sm font-medium">Select a memory and style to create a story</p>
            <p className="text-white/20 text-xs mt-1.5">Your memories, reimagined as literature</p>
          </div>
        )}
      </div>
    </main>
  )
}
