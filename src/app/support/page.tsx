'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Support() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const quickLinks = [
    { icon: '🚀', title: 'Getting Started', desc: 'Learn the basics', href: '/faq' },
    { icon: '🔐', title: 'Privacy & Security', desc: 'Your data is safe', href: '/faq' },
    { icon: '⚡', title: 'Features Guide', desc: 'Explore all features', href: '/faq' },
    { icon: '💳', title: 'Billing', desc: 'It\'s all free!', href: '/pricing' },
  ]

  const socialLinks = [
    { icon: '🐦', name: 'Twitter', handle: '@ConsciousClone' },
    { icon: '💬', name: 'Discord', handle: 'discord.gg/consciousness' },
    { icon: '📘', name: 'GitHub', handle: 'github.com/consciousness-clone' },
  ]

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
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="text-7xl mb-6">💬</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Get{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-white/50 text-lg">We&apos;re here to help. Reach out anytime.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div>
              <div className="rounded-2xl border border-white/[0.06] p-8" style={{ background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(20px)' }}>
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-white/40 text-sm">We typically respond within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }}
                      className="mt-4 text-violet-400 text-sm hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white/40 text-sm mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-sm mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-sm mb-1.5">Subject</label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 text-sm mb-1.5">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what you need help with..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition text-sm resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Response time */}
              <div className="mt-4 rounded-xl border border-white/[0.06] p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <span className="text-xl">⏱️</span>
                <div>
                  <div className="text-sm font-medium">We typically respond within 24 hours</div>
                  <div className="text-white/30 text-xs">support@consciousnessclone.com</div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-bold mb-4">Quick Help</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="rounded-xl border border-white/[0.06] p-4 hover:border-violet-500/30 transition group"
                      style={{ background: 'rgba(255,255,255,0.01)' }}
                    >
                      <div className="text-2xl mb-2">{link.icon}</div>
                      <div className="text-sm font-medium group-hover:text-violet-400 transition">{link.title}</div>
                      <div className="text-white/30 text-xs">{link.desc}</div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Direct Contact */}
              <div className="rounded-xl border border-white/[0.06] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <h3 className="text-lg font-bold mb-4">Direct Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <a href="mailto:support@consciousnessclone.com" className="text-violet-400 text-sm hover:underline">support@consciousnessclone.com</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🐛</span>
                    <div>
                      <div className="text-sm font-medium">Bug Reports</div>
                      <a href="mailto:bugs@consciousnessclone.com" className="text-violet-400 text-sm hover:underline">bugs@consciousnessclone.com</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💼</span>
                    <div>
                      <div className="text-sm font-medium">Business</div>
                      <a href="mailto:business@consciousnessclone.com" className="text-violet-400 text-sm hover:underline">business@consciousnessclone.com</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="rounded-xl border border-white/[0.06] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <h3 className="text-lg font-bold mb-4">Community</h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => (
                    <div key={social.name} className="flex items-center gap-3">
                      <span className="text-xl">{social.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{social.name}</div>
                        <div className="text-white/30 text-xs">{social.handle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
