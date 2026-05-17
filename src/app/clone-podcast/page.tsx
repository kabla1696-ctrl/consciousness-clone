'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Episode {
  id: string
  title: string
  script: string
  created_at: string
}

export default function ClonePodcast() {
  const [user, setUser] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [currentScript, setCurrentScript] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [memoryContext, setMemoryContext] = useState('')
  const [showEpisodes, setShowEpisodes] = useState(false)

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

      const stored = localStorage.getItem('clone-podcast-episodes')
      if (stored) setEpisodes(JSON.parse(stored))
    }
    init()
  }, [])

  const generateEpisode = async () => {
    if (generating || !memoryContext) return
    setGenerating(true)
    setCurrentScript('')

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: 'Create a 2-minute podcast episode script about this person\'s life story. Include intro, highlights, and outro. Style: warm, engaging, NPR-like.'
          }],
          memories: memoryContext,
          systemPrompt: 'You are a podcast scriptwriter. Create engaging, warm, NPR-style podcast scripts based on the person\'s memories. Format with clear sections: [INTRO MUSIC], [HOST], [SEGMENT], etc. Make it feel personal and authentic.',
        }),
      })

      const data = await response.json()
      const script = data.reply || 'Unable to generate episode. Please try again.'
      setCurrentScript(script)

      const title = `Episode — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      setCurrentTitle(title)

      const newEpisode: Episode = {
        id: Date.now().toString(),
        title,
        script,
        created_at: new Date().toISOString(),
      }

      const updated = [newEpisode, ...episodes]
      setEpisodes(updated)
      localStorage.setItem('clone-podcast-episodes', JSON.stringify(updated))
    } catch (err) {
      setCurrentScript('Failed to generate episode. Please try again.')
    }

    setGenerating(false)
  }

  const shareEpisode = () => {
    if (navigator.share && currentScript) {
      navigator.share({ title: currentTitle || 'My Clone Podcast', text: currentScript })
    } else if (currentScript) {
      navigator.clipboard.writeText(currentScript)
      alert('Script copied to clipboard!')
    }
  }

  const deleteEpisode = (id: string) => {
    const updated = episodes.filter(e => e.id !== id)
    setEpisodes(updated)
    localStorage.setItem('clone-podcast-episodes', JSON.stringify(updated))
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🎙️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Clone Podcast</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              AI-generated episodes
            </p>
          </div>
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="text-white/40 hover:text-violet-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* Episodes List Panel */}
        {showEpisodes && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Past Episodes</h3>
              <span className="text-xs text-white/30">{episodes.length} episodes</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {episodes.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No episodes yet</p>
              ) : (
                episodes.map(ep => (
                  <div key={ep.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center gap-3 hover:bg-white/[0.02] transition">
                    <button
                      onClick={() => { setCurrentScript(ep.script); setCurrentTitle(ep.title); setShowEpisodes(false) }}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm text-white/70 font-medium truncate">{ep.title}</p>
                      <p className="text-xs text-white/30">{new Date(ep.created_at).toLocaleDateString()}</p>
                    </button>
                    <button onClick={() => deleteEpisode(ep.id)} className="text-white/20 hover:text-red-400 transition p-1">
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

        {/* Podcast Player UI */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-violet-500/10 to-transparent overflow-hidden mb-6">
          {/* Album Art */}
          <div className="aspect-square max-h-64 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-indigo-600/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-violet-500/20"
                  style={{
                    width: `${60 + i * 40}px`,
                    height: `${60 + i * 40}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    animation: `pulse ${2 + i * 0.5}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 text-center">
              <div className="text-5xl mb-2">🎙️</div>
              <p className="text-white/50 text-sm font-medium">Consciousness Clone</p>
              <p className="text-violet-400/70 text-xs mt-1">The Podcast</p>
            </div>
          </div>

          {/* Player Controls (Visual Only) */}
          <div className="px-6 py-4">
            <h3 className="text-white/90 font-semibold text-center mb-3">
              {currentTitle || 'Generate Your First Episode'}
            </h3>
            <div className="flex items-center gap-4 justify-center mb-3">
              <button className="text-white/30 hover:text-white/60 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>
              <button className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-violet-500/20">
                <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button className="text-white/30 hover:text-white/60 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-1">
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full" style={{ width: '0%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/20">
              <span>0:00</span>
              <span>2:00</span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateEpisode}
          disabled={generating || !memoryContext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 mb-4"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Episode...
            </>
          ) : (
            <>
              <span>🎙️</span> Generate Episode
            </>
          )}
        </button>

        {/* Script Display */}
        {currentScript && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Episode Script</h3>
              <button
                onClick={shareEpisode}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>
            <div className="px-4 py-4 max-h-96 overflow-y-auto">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{currentScript}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentScript && !generating && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎧</div>
            <p className="text-white/30 text-sm">Generate your first episode to hear your story</p>
            <p className="text-white/20 text-xs mt-1">Based on your saved memories</p>
          </div>
        )}
      </div>
    </main>
  )
}
