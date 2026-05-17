import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">Consciousness Clone</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-white/70 hover:text-white transition">Login</Link>
            <Link href="/signup" className="px-6 py-2 bg-primary rounded-full hover:bg-primary/80 transition">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <div className="text-6xl mb-6">🧠</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Mind.{' '}
            <span className="gradient-text">Forever.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 mb-10 max-w-2xl mx-auto">
            Upload your memories, voice, and personality. Create an AI clone that lives on — 
            even after you&apos;re gone. Your descendants will talk to &quot;you&quot; forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-10 py-4 bg-primary rounded-full text-lg font-semibold hover:bg-primary/80 transition animate-glow"
            >
              Create Your Clone — Free
            </Link>
            <Link
              href="#how-it-works"
              className="px-10 py-4 glass rounded-full text-lg font-semibold hover:bg-white/10 transition"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How It <span className="gradient-text">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📝', title: 'Upload Memories', desc: 'Write diary entries, upload voice recordings, photos. Your AI learns who you are.' },
              { icon: '🧬', title: 'AI Learns You', desc: 'Our AI studies your personality, thinking style, humor, values, and opinions.' },
              { icon: '💬', title: 'Live Forever', desc: 'Your clone talks like you, thinks like you. Your family can chat with &quot;you&quot; anytime.' },
            ].map((step, i) => (
              <div key={i} className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition group">
                <div className="text-5xl mb-6 group-hover:scale-110 transition">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-white/60">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why <span className="gradient-text">Consciousness Clone</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: '🎤', title: 'Voice Cloning', desc: 'Your clone speaks in YOUR voice. Not a robot — you.' },
              { icon: '🧠', title: 'Personality Engine', desc: 'AI that understands your humor, your values, your way of thinking.' },
              { icon: '📅', title: 'Life Timeline', desc: 'Your memories organized beautifully. A digital version of your life.' },
              { icon: '🔒', title: 'End-to-End Encrypted', desc: 'Your data is yours. We never sell or share your memories.' },
              { icon: '👨‍👩‍👧', title: 'Family Access', desc: 'Share your clone with loved ones. They can talk to you anytime.' },
              { icon: '♾️', title: 'Eternal Preservation', desc: 'Your clone lives on forever. A legacy that never fades.' },
            ].map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-6 flex gap-4 hover:bg-white/10 transition">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Free', price: '$0', features: ['50 memories', 'Basic AI chat', 'Text only'], cta: 'Start Free', popular: false },
              { name: 'Pro', price: '$9.99/mo', features: ['Unlimited memories', 'Voice clone', 'Photo upload', 'Priority support'], cta: 'Go Pro', popular: true },
              { name: 'Legacy', price: '$49.99/mo', features: ['Everything in Pro', 'Family access', 'Eternal preservation', 'Full personality model'], cta: 'Preserve Forever', popular: false },
            ].map((plan, i) => (
              <div key={i} className={`glass rounded-2xl p-8 text-center relative ${plan.popular ? 'border-primary border-2 animate-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6 gradient-text">{plan.price}</div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="text-white/60">✓ {f}</li>
                  ))}
                </ul>
                <Link href="/signup" className={`block py-3 rounded-full font-semibold transition ${plan.popular ? 'bg-primary hover:bg-primary/80' : 'glass hover:bg-white/10'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-6">Ready to Live Forever?</h2>
          <p className="text-xl text-white/60 mb-8">
            Start building your digital consciousness today. Free forever.
          </p>
          <Link href="/signup" className="inline-block px-12 py-4 bg-primary rounded-full text-lg font-semibold hover:bg-primary/80 transition animate-glow">
            Create Your Clone Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-white/40">© 2026 Consciousness Clone. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition">Privacy</a>
            <a href="#" className="text-white/40 hover:text-white transition">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
