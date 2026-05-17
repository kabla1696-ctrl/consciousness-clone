'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Chapter {
  title: string
  emoji: string
  content: string
}

const CHAPTER_TITLES = [
  { title: 'Childhood', emoji: '🧒', prompt: 'early childhood, family life, and formative years' },
  { title: 'Education', emoji: '🎓', prompt: 'school years, learning experiences, and academic journey' },
  { title: 'Career', emoji: '💼', prompt: 'professional life, work experiences, and career growth' },
  { title: 'Relationships', emoji: '❤️', prompt: 'love, friendships, and meaningful connections' },
  { title: 'Achievements', emoji: '🏆', prompt: 'accomplishments, milestones, and proud moments' },
  { title: 'Lessons', emoji: '📖', prompt: 'wisdom gained, mistakes made, and life lessons learned' },
]

export default function LifeStory() {
  const [user, setUser] = useState<any>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [generating, setGenerating] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [memoryCount, setMemoryCount] = useState(0)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      // Count memories
      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      setMemoryCount(count || 0)

      // Check for cached story
      const { data: cached } = await supabase
        .from('memories')
        .select('content')
        .eq('user_id', user.id)
        .eq('category', 'life_story')
        .order('created_at', { ascending: false })
        .limit(1)

      if (cached && cached.length > 0) {
        try {
          const parsed = JSON.parse(cached[0].content)
          if (parsed.chapters && Array.isArray(parsed.chapters)) {
            setChapters(parsed.chapters)
            setGenerated(true)
          }
        } catch {}
      }
    }
    init()
  }, [])

  const generateLifeStory = async () => {
    if (!user) return
    setGenerating(true)
    setChapters([])
    setCurrentChapter(0)

    try {
      // Fetch all memories
      const { data: memories } = await supabase
        .from('memories')
        .select('content, category, mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!memories || memories.length === 0) {
        setGenerating(false)
        return
      }

      const memoryText = memories.map(m => `[${m.category}] ${m.content}`).join('\n')
      const newChapters: Chapter[] = []

      for (let i = 0; i < CHAPTER_TITLES.length; i++) {
        setCurrentChapter(i)
        const chap = CHAPTER_TITLES[i]

        const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `You are a skilled biographer. Based on these personal memories, write a beautiful, narrative chapter about ${chap.prompt}.

Memories:
${memoryText}

Write in first person, as if the person is telling their own story. Be warm, reflective, and literary. 3-4 paragraphs. Make it feel like a real autobiography chapter. Do NOT use markdown headers — just flowing prose.`
            }],
            memories: memoryText,
          }),
        })

        const data = await response.json()
        newChapters.push({
          title: chap.title,
          emoji: chap.emoji,
          content: data.reply || 'This chapter awaits your memories...',
        })

        // Update state incrementally
        setChapters([...newChapters])
      }

      // Cache the story as a memory
      await supabase.from('memories').insert({
        user_id: user.id,
        content: JSON.stringify({ chapters: newChapters }),
        category: 'life_story',
        mood: '📖',
      })

      setGenerated(true)
    } catch (err) {
      console.error('Failed to generate life story:', err)
    }

    setGenerating(false)
  }

  const downloadAsText = () => {
    setDownloading(true)

    const title = `My Life Story\n${user?.email?.split('@')[0] || 'A Personal Journey'}\n${'='.repeat(40)}\n\n`
    const text = chapters.map(ch =>
      `${ch.emoji} ${ch.title}\n${'-'.repeat(30)}\n${ch.content}\n\n`
    ).join('\n')

    const blob = new Blob([title + text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-life-story.txt'
    a.click()
    URL.revokeObjectURL(url)

    setTimeout(() => setDownloading(false), 1000)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold">Life Story</h1>
        </div>
      </header>

      <div className="pt-4 px-4 max-w-3xl mx-auto pb-24">
        {/* Hero */}
        {!generated && !generating && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📖</div>
            <h1 className="text-4xl font-bold mb-3">Your Life Story</h1>
            <p className="text-white/40 text-lg mb-2">
              AI weaves your memories into a beautiful autobiography
            </p>
            <p className="text-white/20 text-sm mb-8">
              {memoryCount} memories available to draw from
            </p>

            {memoryCount === 0 ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                <p className="text-amber-400">You need some memories first!</p>
                <Link href="/memories" className="text-violet-400 text-sm mt-2 inline-block hover:underline">
                  Add memories →
                </Link>
              </div>
            ) : (
              <button
                onClick={generateLifeStory}
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold text-lg hover:opacity-90 transition"
              >
                ✨ Generate My Life Story
              </button>
            )}
          </div>
        )}

        {/* Generating Progress */}
        {generating && (
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">✍️</div>
              <h2 className="text-2xl font-bold mb-2">Writing your story...</h2>
              <p className="text-white/40">Chapter {currentChapter + 1} of {CHAPTER_TITLES.length}</p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-white/30 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentChapter) / CHAPTER_TITLES.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(currentChapter / CHAPTER_TITLES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Chapter Status */}
            <div className="space-y-2">
              {CHAPTER_TITLES.map((chap, i) => (
                <div
                  key={chap.title}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${i < chapters.length ? 'bg-emerald-500/5 border border-emerald-500/10' : i === currentChapter ? 'bg-violet-500/5 border border-violet-500/10' : 'border border-white/[0.03]'}`}
                >
                  <span className="text-lg">{chap.emoji}</span>
                  <span className={`flex-1 text-sm ${i < chapters.length ? 'text-emerald-400' : i === currentChapter ? 'text-violet-400' : 'text-white/20'}`}>
                    {chap.title}
                  </span>
                  {i < chapters.length ? (
                    <span className="text-emerald-400 text-sm">✓</span>
                  ) : i === currentChapter ? (
                    <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Preview of completed chapters */}
            {chapters.length > 0 && (
              <div className="mt-8 space-y-6">
                {chapters.map((chapter, i) => (
                  <div key={i} className="animate-fadeIn">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{chapter.emoji}</span>
                      <h3 className="text-lg font-semibold">{chapter.title}</h3>
                    </div>
                    <p className="text-white/60 leading-relaxed text-sm">{chapter.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Story */}
        {generated && !generating && (
          <div>
            {/* Title Page */}
            <div className="text-center py-12 mb-8">
              <div className="text-6xl mb-4">📖</div>
              <h1 className="text-4xl font-bold mb-2">My Life Story</h1>
              <p className="text-white/30">
                {user?.email?.split('@')[0] || 'A Personal Journey'}
              </p>
              <p className="text-white/20 text-sm mt-1">
                Generated from {memoryCount} memories
              </p>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={generateLifeStory}
                  className="px-5 py-2.5 border border-white/[0.06] rounded-lg hover:bg-white/[0.02] transition text-sm text-white/50"
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={downloadAsText}
                  disabled={downloading}
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 transition text-sm"
                >
                  {downloading ? 'Downloading...' : '📥 Download as Text'}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
              <span className="text-white/20 text-xs tracking-widest">CHAPTERS</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
            </div>

            {/* Chapters */}
            <div className="space-y-16">
              {chapters.map((chapter, i) => (
                <article key={i} className="relative">
                  {/* Chapter Number */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-2xl mr-2">{chapter.emoji}</span>
                      <h2 className="text-2xl font-bold inline">{chapter.title}</h2>
                    </div>
                  </div>

                  {/* Chapter Content */}
                  <div className="pl-14">
                    <div className="text-white/70 leading-[1.9] text-[15px] space-y-4">
                      {chapter.content.split('\n\n').map((paragraph, j) => (
                        <p key={j} className={j === 0 ? 'first-letter:text-3xl first-letter:font-bold first-letter:text-violet-400 first-letter:mr-1 first-letter:float-left' : ''}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Chapter Divider */}
                  {i < chapters.length - 1 && (
                    <div className="flex justify-center mt-12">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/30" />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/20" />
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/10" />
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* End */}
            <div className="text-center py-16">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-white/30 text-sm">The End</p>
              <p className="text-white/20 text-xs mt-2">
                This story was generated from your personal memories.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
