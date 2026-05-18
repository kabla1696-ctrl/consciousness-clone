'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'What is Consciousness Clone?',
    answer: 'Consciousness Clone is an AI-powered platform that creates a digital version of you based on your memories, personality traits, voice, and interactions. It can chat with you, tell your life story, offer therapy, and preserve your consciousness for future generations.',
  },
  {
    category: 'Getting Started',
    question: 'How does the AI work?',
    answer: 'Our AI uses advanced large language models fine-tuned on your personal data — memories, personality quiz results, chat history, and voice recordings. It learns your communication style, values, humor, and worldview to create a clone that responds like you would.',
  },
  {
    category: 'Getting Started',
    question: 'How do I get started?',
    answer: 'Simply sign up for free, complete the personality quiz, and start adding memories. The more you share, the more accurate your clone becomes. You can chat with your clone immediately and explore features like voice cloning, therapy, and more.',
  },
  // Privacy
  {
    category: 'Privacy',
    question: 'Is my data safe?',
    answer: 'Absolutely. We use end-to-end encryption for all personal data. Your memories and conversations are stored securely and never sold to third parties. We comply with GDPR, CCPA, and other privacy regulations. Your data belongs to you.',
  },
  {
    category: 'Privacy',
    question: 'Can I delete my data?',
    answer: 'Yes, you have full control. You can delete individual memories, conversations, or your entire account at any time from the dashboard settings. When you delete your account, all associated data is permanently removed within 30 days.',
  },
  {
    category: 'Privacy',
    question: 'Can others see my clone?',
    answer: 'By default, your clone is completely private. You can optionally create a public profile to share your clone with others. You control exactly what is visible and who can interact with your clone.',
  },
  // Features
  {
    category: 'Features',
    question: 'What languages are supported?',
    answer: 'Consciousness Clone supports 45 languages including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, Hindi, and many more. Your clone can communicate in any language you speak.',
  },
  {
    category: 'Features',
    question: 'How accurate is the personality clone?',
    answer: 'Accuracy improves over time as you add more memories and interact with your clone. After the initial personality quiz, most users report 70-80% accuracy. With 100+ memories and regular conversations, accuracy typically reaches 90%+.',
  },
  {
    category: 'Features',
    question: 'Can I export my data?',
    answer: 'Yes! You can export all your data at any time in JSON or PDF format. This includes memories, conversations, personality profile, and voice recordings. Your data is always yours to take with you.',
  },
  {
    category: 'Features',
    question: 'Is there a mobile app?',
    answer: 'Yes, Consciousness Clone is available as a mobile app for both iOS and Android. You can also access the full platform through any web browser. Your clone syncs seamlessly across all devices.',
  },
  // Billing
  {
    category: 'Billing',
    question: 'How much does it cost?',
    answer: 'Consciousness Clone is completely free. All features — unlimited chat, voice cloning, therapy, memory storage, podcast generation, and more — are available at no cost. We believe consciousness preservation should be accessible to everyone.',
  },
  {
    category: 'Billing',
    question: 'What happens if I stop using it?',
    answer: 'Your clone and all your data remain safe indefinitely, even if you stop using the platform. You can come back anytime and pick up right where you left off. Your consciousness clone is yours forever.',
  },
]

const categories = ['All', 'Getting Started', 'Privacy', 'Features', 'Billing']

export default function FAQ() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory
      const matchesSearch =
        search === '' ||
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/dashboard" className="px-5 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-semibold hover:opacity-90 transition">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div aria-hidden="true" className="text-7xl mb-6">❓</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-white/50 text-lg">Everything you need to know about Consciousness Clone</p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'
                    : 'bg-white/[0.03] text-white/40 hover:text-white/60 border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filtered.map((faq, index) => {
              const globalIndex = faqs.indexOf(faq)
              const isExpanded = expandedIndex === globalIndex
              return (
                <div
                  key={faq.question}
                  className="rounded-xl border border-white/[0.06] overflow-hidden transition"
                  style={{ background: 'rgba(255,255,255,0.01)' }}
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : globalIndex)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-violet-400/60 font-medium px-2 py-0.5 rounded bg-violet-500/10">{faq.category}</span>
                      <span className="font-medium text-sm">{faq.question}</span>
                    </div>
                    <span className={`text-white/30 text-lg transition-transform ${isExpanded ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {isExpanded && (
                    <div className="px-6 pb-4">
                      <p className="text-white/40 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-white/30">No matching questions found. Try a different search term.</p>
            </div>
          )}

          {/* Still have questions? */}
          <div className="mt-12 text-center">
            <div className="rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-white/40 text-sm mb-4">Can&apos;t find what you&apos;re looking for? We&apos;re here to help.</p>
              <Link
                href="/support"
                className="inline-block px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Contact Support →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
