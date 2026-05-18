'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

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
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [generating, setGenerating] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [generated, setGenerated] = useState(false)
  const [memoryCount, setMemoryCount] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [bookOpen, setBookOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setMemoryCount(count || 0)

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

  // Reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const winHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY / winHeight
      setScrollProgress(Math.min(scrolled * 100, 100))
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const generateLifeStory = async () => {
    if (!user) return
    setGenerating(true)
    setChapters([])
    setCurrentChapter(0)

    try {
      const { data: memories } = await supabase
        .from('memories')
        .select('content, category, mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!memories || memories.length === 0) { setGenerating(false); return }

      const memoryText = memories.map(m => `[${m.category}] ${m.content}`).join('\n')
      const newChapters: Chapter[] = []

      for (let i = 0; i < CHAPTER_TITLES.length; i++) {
        setCurrentChapter(i)
        const chap = CHAPTER_TITLES[i]

        const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
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
        newChapters.push({ title: chap.title, emoji: chap.emoji, content: data.reply || 'This chapter awaits your memories...' })
        setChapters([...newChapters])
      }

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
    const text = chapters.map(ch => `${ch.emoji} ${ch.title}\n${'-'.repeat(30)}\n${ch.content}\n\n`).join('\n')
    const blob = new Blob([title + text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'my-life-story.txt'; a.click()
    URL.revokeObjectURL(url)
    setTimeout(() => setDownloading(false), 1000)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">📖</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      <style jsx global>{`
        @keyframes page-turn { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-180deg); } }
        @keyframes book-open { 0% { transform: perspective(1000px) rotateY(-30deg) scale(0.9); } 100% { transform: perspective(1000px) rotateY(0deg) scale(1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes glow-pulse { 0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.4), 0 0 60px rgba(217,70,239,0.2); } }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
        .animate-book-open { animation: book-open 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-shimmer { background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.1) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
        .leather-texture { background: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(88,28,135,0.05) 25%, rgba(139,92,246,0.08) 50%, rgba(88,28,135,0.05) 75%, rgba(139,92,246,0.08) 100%); border: 2px solid rgba(139,92,246,0.15); position: relative; }
        .leather-texture::before { content: ''; position: absolute; inset: 4px; border: 1px solid rgba(139,92,246,0.1); border-radius: inherit; pointer-events: none; }
        .leather-texture::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px); border-radius: inherit; pointer-events: none; }
        .decorative-border { position: relative; }
        .decorative-border::before { content: ''; position: absolute; top: -1px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent); }
        .decorative-border::after { content: ''; position: absolute; bottom: -1px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent); }
        .drop-cap::first-letter { float: left; font-size: 3.5em; line-height: 0.8; padding-right: 0.1em; padding-top: 0.05em; color: #8b5cf6; font-weight: bold; font-family: Georgia, serif; }
        .reading-progress { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, #8b5cf6, #d946ef, #8b5cf6); background-size: 200% 100%; animation: shimmer 2s infinite; z-index: 100; transition: width 0.3s; }
      `}</style>

      {/* Reading Progress Bar */}
      {generated && <div className="reading-progress" style={{ width: `${scrollProgress}%` }} />}

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 group">
            <svg className="w-6 h-6 text-white/60 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('life story')}</h1>
          {generated && (
            <div className="flex-1 flex justify-end gap-2">
              <button onClick={generateLifeStory} className="text-xs text-white/30 hover:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-white/[0.02] transition-all">🔄 Regen</button>
              <button onClick={downloadAsText} disabled={downloading} className="text-xs text-violet-400 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all">
                {downloading ? 'Saving...' : '📥 Download'}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="pt-4 px-4 max-w-3xl mx-auto pb-24">
        {/* Hero — Book Cover */}
        {!generated && !generating && (
          <div className="text-center py-12 animate-slide-up">
            {/* Book Cover */}
            <div className="inline-block mb-8">
              <div className="leather-texture w-56 h-72 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-2xl shadow-violet-500/10 animate-glow-pulse">
                <div className="text-5xl">📖</div>
                <div className="text-center px-4">
                  <h2 className="text-xl font-bold text-white/90 font-serif">My Life Story</h2>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent mx-auto my-2" />
                  <p className="text-xs text-white/40 font-serif italic">
                    {user?.email?.split('@')[0] || 'A Personal Journey'}
                  </p>
                </div>
                <div className="absolute bottom-4 text-[10px] text-white/20 font-serif">~ A Memoir ~</div>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Your Life Story</h1>
            <p className="text-white/40 text-lg mb-2">{t('ai generated')}</p>
            <p className="text-white/20 text-sm mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                ✨ {memoryCount} memories available
              </span>
            </p>

            {memoryCount === 0 ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 max-w-sm mx-auto">
                <p className="text-amber-400">You need some memories first!</p>
                <Link href="/memories" className="text-violet-400 text-sm mt-2 inline-block hover:underline">Add memories →</Link>
              </div>
            ) : (
              <button onClick={() => { setBookOpen(true); generateLifeStory(); }}
                className="relative overflow-hidden px-10 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl font-semibold text-lg hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all group">
                <span className="relative z-10">✨ {t('write story')}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
        )}

        {/* Generating Progress */}
        {generating && (
          <div className="py-8 animate-slide-up">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="text-5xl animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>✍️</div>
                <div className="absolute -inset-3 bg-violet-500/10 rounded-full blur-xl" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Writing your story...</h2>
              <p className="text-white/40">Chapter {currentChapter + 1} of {CHAPTER_TITLES.length}</p>
            </div>

            <div className="mb-8 max-w-md mx-auto">
              <div className="flex justify-between text-xs text-white/30 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentChapter) / CHAPTER_TITLES.length) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-white/[0.04] rounded-full">
                <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${(currentChapter / CHAPTER_TITLES.length) * 100}%` }}>
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              </div>
            </div>

            <div className="space-y-3 max-w-md mx-auto">
              {CHAPTER_TITLES.map((chap, i) => (
                <div key={chap.title}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all decorative-border ${
                    i < chapters.length ? 'bg-emerald-500/5 border border-emerald-500/10' :
                    i === currentChapter ? 'bg-violet-500/5 border border-violet-500/10 animate-glow-pulse' :
                    'border border-white/[0.03] opacity-40'
                  }`}>
                  <span className="text-xl">{chap.emoji}</span>
                  <span className={`flex-1 text-sm font-medium ${
                    i < chapters.length ? 'text-emerald-400' : i === currentChapter ? 'text-violet-400' : 'text-white/20'
                  }`}>{chap.title}</span>
                  {i < chapters.length ? (
                    <span className="text-emerald-400 text-lg">✓</span>
                  ) : i === currentChapter ? (
                    <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                  ) : null}
                </div>
              ))}
            </div>

            {chapters.length > 0 && (
              <div className="mt-10 space-y-8 max-w-lg mx-auto">
                {chapters.map((chapter, i) => (
                  <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{chapter.emoji}</span>
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{chapter.title}</h3>
                    </div>
                    <div className="parchment-texture rounded-xl p-4 border border-white/[0.04]">
                      <p className="text-white/60 leading-relaxed text-sm">{chapter.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generated Story — Open Book */}
        {generated && !generating && (
          <div className="animate-book-open">
            {/* Title Page */}
            <div className="text-center py-12 mb-8">
              <div className="inline-block mb-6">
                <div className="leather-texture w-48 h-64 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-2xl shadow-violet-500/10">
                  <div className="text-4xl">📖</div>
                  <div className="text-center px-3">
                    <h2 className="text-lg font-bold text-white/90 font-serif">My Life Story</h2>
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent mx-auto my-2" />
                    <p className="text-xs text-white/40 font-serif italic">{user?.email?.split('@')[0] || 'A Personal Journey'}</p>
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">My Life Story</h1>
              <p className="text-white/30 font-serif italic">{user?.email?.split('@')[0] || 'A Personal Journey'}</p>
              <p className="text-white/20 text-sm mt-1">Generated from {memoryCount} memories</p>
            </div>

            {/* Chapter Divider */}
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
              <span className="text-white/20 text-xs tracking-[0.3em] font-serif">{t('chapters')}</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
            </div>

            {/* Chapters */}
            <div className="space-y-20">
              {chapters.map((chapter, i) => (
                <article key={i} className="relative animate-slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  {/* Decorative Chapter Header */}
                  <div className="decorative-border mb-8 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center shadow-lg shadow-violet-500/10">
                        <span className="text-sm font-bold text-violet-400 font-serif">{i + 1}</span>
                      </div>
                      <div>
                        <span className="text-3xl mr-3">{chapter.emoji}</span>
                        <h2 className="text-2xl font-bold inline font-serif bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{chapter.title}</h2>
                      </div>
                    </div>
                    <div className="mt-3 ml-[4.5rem]">
                      <div className="w-24 h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
                    </div>
                  </div>

                  {/* Chapter Content with Drop Cap */}
                  <div className="pl-4 sm:pl-14">
                    <div className="parchment-texture rounded-2xl p-6 border border-white/[0.04]">
                      <div className="text-white/70 leading-[2] text-[15px] space-y-5 font-serif">
                        {chapter.content.split('\n\n').map((paragraph, j) => (
                          <p key={j} className={j === 0 ? 'drop-cap' : ''}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Chapter Divider Ornament */}
                  {i < chapters.length - 1 && (
                    <div className="flex justify-center mt-16">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent to-violet-500/30" />
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
                          <div className="w-2 h-2 rounded-full bg-violet-500/60 rotate-45" />
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
                        </div>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-violet-500/30" />
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* The End */}
            <div className="text-center py-20">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 flex items-center justify-center animate-glow-pulse">
                  <span className="text-2xl">✨</span>
                </div>
              </div>
              <p className="text-white/30 text-sm font-serif italic">The End</p>
              <p className="text-white/20 text-xs mt-2 font-serif">This story was generated from your personal memories.</p>
              <div className="mt-6 w-16 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent mx-auto" />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
