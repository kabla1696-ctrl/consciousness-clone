'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  { id: 'novel', label: 'Novel', icon: '📖', desc: 'Literary narrative' },
  { id: 'poem', label: 'Poem', icon: '🪶', desc: 'Verse & rhythm' },
  { id: 'letter', label: 'Letter', icon: '✉️', desc: 'Personal epistolary' },
  { id: 'news', label: 'News', icon: '📰', desc: 'Journalistic piece' },
]

export default function MemoryStories() {
  const [user, setUser] = useState<any>(null)
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

      if (data) setMemories(data)

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
        headers: { 'Content-Type': 'application/json' },
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">📖</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Memory Stories</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              Memories turned into art
            </p>
          </div>
          <button
            onClick={() => setShowStories(!showStories)}
            className="text-white/40 hover:text-violet-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Story Collection */}
        {showStories && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Story Collection</h3>
              <span className="text-xs text-white/30">{stories.length} stories</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {stories.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No stories yet</p>
              ) : (
                stories.map(s => (
                  <div key={s.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center gap-3 hover:bg-white/[0.02] transition">
                    <button
                      onClick={() => { setCurrentStory(s.story); setSelectedStyle(s.style); setShowStories(false) }}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm text-white/70 font-medium truncate">{s.memoryContent.slice(0, 60)}...</p>
                      <p className="text-xs text-white/30 capitalize">{s.style} · {new Date(s.created_at).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => deleteStory(s.id)} className="text-white/20 hover:text-red-400 transition p-1">
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
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Select a Memory</label>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left hover:border-violet-500/30 transition"
          >
            {selectedMemory ? (
              <div>
                <p className="text-sm text-white/80 truncate">{selectedMemory.content}</p>
                <p className="text-xs text-violet-400 capitalize mt-0.5">{selectedMemory.category}</p>
              </div>
            ) : (
              <p className="text-white/30 text-sm">Choose a memory to transform...</p>
            )}
          </button>

          {showPicker && (
            <div className="mt-2 rounded-xl border border-white/[0.06] bg-[#0a0a1a] max-h-48 overflow-y-auto">
              {memories.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No memories found</p>
              ) : (
                memories.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMemory(m); setShowPicker(false) }}
                    className="w-full px-4 py-3 text-left border-b border-white/[0.03] hover:bg-white/[0.03] transition"
                  >
                    <p className="text-sm text-white/70 truncate">{m.content}</p>
                    <p className="text-xs text-white/30 capitalize">{m.category}</p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Style Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Story Style</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 rounded-xl text-left transition ${
                  selectedStyle === style.id
                    ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/40'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <span className="text-lg">{style.icon}</span>
                <p className="text-sm font-medium text-white/80 mt-1">{style.label}</p>
                <p className="text-xs text-white/30">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateStory}
          disabled={generating || !selectedMemory}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 mb-6"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Writing Story...
            </>
          ) : (
            <>
              <span>✨</span> Transform into Story
            </>
          )}
        </button>

        {/* Story Display */}
        {currentStory && (
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-violet-500/5 to-transparent overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80 capitalize">
                {STYLES.find(s => s.id === selectedStyle)?.icon} {STYLES.find(s => s.id === selectedStyle)?.label}
              </h3>
              <button
                onClick={downloadStory}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition"
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
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-white/30 text-sm">Select a memory and style to create a story</p>
            <p className="text-white/20 text-xs mt-1">Your memories, reimagined as literature</p>
          </div>
        )}
      </div>
    </main>
  )
}
