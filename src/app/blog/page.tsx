'use client'

import Link from 'next/link'
import { useT } from '../../lib/language-context'

const posts = [
  {
    id: 1,
    title: "What is Digital Immortality?",
    excerpt: "The concept of preserving human consciousness digitally has moved from science fiction to reality. Here's how Consciousness Clone is making it happen.",
    category: "Concept",
    readTime: "5 min",
    date: "May 15, 2026",
    emoji: "🧠",
  },
  {
    id: 2,
    title: "How AI Learns Your Personality",
    excerpt: "Ever wonder how your clone starts thinking like you? We break down the AI techniques behind personality mirroring.",
    category: "Technology",
    readTime: "7 min",
    date: "May 12, 2026",
    emoji: "🤖",
  },
  {
    id: 3,
    title: "5 Reasons to Preserve Your Memories",
    excerpt: "Your memories define who you are. Here's why preserving them digitally matters — for you and future generations.",
    category: "Lifestyle",
    readTime: "4 min",
    date: "May 10, 2026",
    emoji: "📝",
  },
  {
    id: 4,
    title: "Voice Cloning: The Future of Digital Presence",
    excerpt: "Imagine your digital clone speaking in your exact voice. We explore the technology behind voice cloning and what it means for digital immortality.",
    category: "Technology",
    readTime: "6 min",
    date: "May 8, 2026",
    emoji: "🎤",
  },
  {
    id: 5,
    title: "Building a Legacy for Your Children",
    excerpt: "How parents are using Consciousness Clone to leave behind more than just photos — their actual thoughts, stories, and wisdom.",
    category: "Family",
    readTime: "5 min",
    date: "May 5, 2026",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    id: 6,
    title: "The Ethics of Digital Consciousness",
    excerpt: "As we build digital copies of human minds, important questions arise about identity, privacy, and what it means to be human.",
    category: "Philosophy",
    readTime: "8 min",
    date: "May 3, 2026",
    emoji: "🤔",
  },
]

export default function Blog() {
  const t = useT()
  return (
    <main className="min-h-screen bg-[#050510]">
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition">Login</Link>
            <Link href="/signup" className="px-5 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-semibold hover:opacity-90 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-6xl mx-auto pb-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">{t('blog')}</h1>
          <p className="text-white/30 text-xl max-w-2xl mx-auto">
            {t('articles')}
          </p>
        </div>

        {/* Featured Post */}
        <div className="rounded-2xl border border-violet-500/30 p-8 mb-10" style={{ background: 'rgba(139, 92, 246, 0.03)' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{posts[0].emoji}</span>
            <span className="px-3 py-1 bg-violet-500/20 rounded-full text-violet-400 text-xs font-semibold">{posts[0].category}</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">{posts[0].title}</h2>
          <p className="text-white/40 text-lg mb-6">{posts[0].excerpt}</p>
          <div className="flex items-center gap-4 text-white/20 text-sm">
            <span>{posts[0].date}</span>
            <span>•</span>
            <span>{posts[0].readTime} {t('read more')}</span>
          </div>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <div key={post.id} className="rounded-2xl border border-white/[0.04] hover:border-white/[0.08] p-6 transition cursor-pointer group" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{post.emoji}</span>
                <span className="px-3 py-1 bg-white/[0.04] rounded-full text-white/40 text-xs">{post.category}</span>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-violet-400 transition">{post.title}</h3>
              <p className="text-white/30 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-white/20 text-xs">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime} {t('read more')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-20 rounded-2xl border border-white/[0.04] p-10 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-2xl font-bold mb-4">{t('latest posts')} 📬</h2>
          <p className="text-white/30 mb-6">Get the latest insights on digital consciousness delivered to your inbox.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
