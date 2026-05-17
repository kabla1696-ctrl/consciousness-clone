'use client'

import Link from 'next/link'
import { useState } from 'react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Start your digital immortality journey',
    features: [
      '50 memories',
      'Basic chat with clone',
      '5 personality traits',
      'Text-only clone',
      'Standard response speed',
    ],
    cta: 'Get Started Free',
    popular: false,
    gradient: 'from-white/10 to-white/5',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Your clone, fully alive',
    features: [
      'Unlimited memories',
      'Unlimited chat',
      'Full personality profiling',
      'Voice clone (beta)',
      'Memory search & analytics',
      'Priority AI response',
      'Export all data',
    ],
    cta: 'Start Pro Trial',
    popular: true,
    gradient: 'from-violet-500/20 to-fuchsia-500/20',
  },
  {
    name: 'Immortal',
    price: '$29',
    period: '/month',
    description: 'Live forever, digitally',
    features: [
      'Everything in Pro',
      'Premium voice clone',
      'Video clone (coming soon)',
      'Clone sharing with family',
      'Multiple personality modes',
      'Legacy mode (after-life)',
      'Priority support',
      'Custom clone personality',
      'API access',
    ],
    cta: 'Go Immortal',
    popular: false,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
]

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

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
            <Link href="/login" className="text-sm text-white/40 hover:text-white transition">Login</Link>
            <Link href="/signup" className="px-5 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-semibold hover:opacity-90 transition">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Eternity</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl mx-auto">
              Your consciousness deserves to live forever. Pick the plan that matches your ambition.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm ${billing === 'monthly' ? 'text-white' : 'text-white/30'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
                className="relative w-14 h-7 rounded-full bg-white/10 transition"
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition ${billing === 'yearly' ? 'left-8' : 'left-1'}`} />
              </button>
              <span className={`text-sm ${billing === 'yearly' ? 'text-white' : 'text-white/30'}`}>
                Yearly <span className="text-emerald-400 text-xs font-semibold">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border ${plan.popular ? 'border-violet-500/50' : 'border-white/[0.06]'} p-8 transition hover:border-white/[0.12]`}
                style={{ background: plan.popular ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.01)' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{billing === 'yearly' ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}</span>
                    <span className="text-white/30">{plan.period}</span>
                  </div>
                  <p className="text-white/40 text-sm mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white/60 text-sm">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition ${plan.popular ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90' : 'border border-white/[0.06] hover:bg-white/[0.02]'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked</h2>
            <div className="space-y-4">
              {[
                { q: 'What happens to my clone if I stop paying?', a: 'Your clone stays alive in read-only mode. You can still chat, but new memories won\'t be processed. Upgrade anytime to resume full functionality.' },
                { q: 'Is my data safe?', a: 'Absolutely. Your memories are encrypted end-to-end. Only you can access your data. We never sell or share your personal information.' },
                { q: 'Can I export my data?', a: 'Yes! Pro and Immortal plans include full data export. Your consciousness is yours — take it anywhere.' },
                { q: 'How does voice cloning work?', a: 'Upload a 5-minute voice sample and our AI creates a digital copy of your voice. Your clone will speak just like you.' },
                { q: 'What is Legacy Mode?', a: 'Legacy Mode is designed for digital immortality. Your clone continues to exist and interact with your loved ones even after you\'re gone.' },
              ].map((faq) => (
                <div key={faq.q} className="rounded-xl border border-white/[0.04] p-6" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-white/40 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
