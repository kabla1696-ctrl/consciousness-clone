import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A1A] via-[#12122A] to-[#0A0A1A]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '4s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5" style={{ background: 'rgba(10, 10, 26, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">🧠</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Consciousness Clone</h1>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-5 py-2.5 text-white/60 hover:text-white transition text-sm font-medium">Login</Link>
            <Link href="/signup" className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold hover:opacity-90 transition shadow-lg shadow-purple-500/25">
              Start Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Now in Public Beta — Free Forever</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
            Your Mind.<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">Forever.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
            Upload your memories, voice, and personality. Create an AI clone that lives on — even after you&apos;re gone. Your descendants will talk to &quot;you&quot; forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup" className="group relative px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105">
              <span className="relative z-10">Create Your Clone — Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition" />
            </Link>
            <Link href="#how-it-works" className="px-10 py-4 border border-white/10 rounded-full text-lg font-semibold hover:bg-white/5 transition-all hover:border-white/20">
              See How It Works ↓
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 md:gap-20">
            {[
              { value: '10K+', label: 'Memories Created' },
              { value: '2.5K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-white/30 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>💭</div>
        <div className="absolute top-1/3 right-16 text-3xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>🧠</div>
        <div className="absolute bottom-1/4 left-20 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>✨</div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="text-sm text-white/60">Simple 3-Step Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              How It <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📝', step: '01', title: 'Upload Memories', desc: 'Write diary entries, upload voice recordings, photos. Your AI learns who you are — your humor, your values, your way of thinking.', color: 'from-purple-500/20 to-purple-600/5' },
              { icon: '🧬', step: '02', title: 'AI Learns You', desc: 'Our AI studies your personality, thinking style, and emotional patterns. It builds a digital model of your consciousness.', color: 'from-pink-500/20 to-pink-600/5' },
              { icon: '💬', step: '03', title: 'Live Forever', desc: 'Your clone talks like you, thinks like you. Your family can chat with "you" anytime — even 100 years from now.', color: 'from-orange-500/20 to-orange-600/5' },
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-b ${step.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative border border-white/5 rounded-3xl p-10 hover:border-white/10 transition-all duration-500 bg-white/[0.02]">
                  <div className="text-sm text-white/20 font-mono mb-4">STEP {step.step}</div>
                  <div className="text-5xl mb-6">{step.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="text-sm text-white/60">Powerful Features</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              Everything You <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Need</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🎤', title: 'Voice Cloning', desc: 'Your clone speaks in YOUR voice. Not a robot — you.', gradient: 'from-purple-500 to-indigo-500' },
              { icon: '🧠', title: 'Personality Engine', desc: 'AI that understands your humor, your values, your thinking.', gradient: 'from-pink-500 to-purple-500' },
              { icon: '📅', title: 'Life Timeline', desc: 'Your memories organized beautifully. A digital version of your life.', gradient: 'from-orange-500 to-pink-500' },
              { icon: '🔒', title: 'End-to-End Encrypted', desc: 'Your data is yours. We never sell or share your memories.', gradient: 'from-green-500 to-teal-500' },
              { icon: '👨‍👩‍👧', title: 'Family Access', desc: 'Share your clone with loved ones. They can talk to you anytime.', gradient: 'from-blue-500 to-purple-500' },
              { icon: '♾️', title: 'Eternal Preservation', desc: 'Your clone lives on forever. A legacy that never fades.', gradient: 'from-amber-500 to-orange-500' },
            ].map((feature, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                <div className="relative p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-6 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/40 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-8">💬</div>
          <blockquote className="text-3xl md:text-4xl font-light text-white/70 leading-relaxed mb-8">
            &quot;I uploaded 200 memories. After 2 weeks, my clone knew me better than my best friend. It&apos;s surreal talking to yourself.&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            <div className="text-left">
              <div className="font-semibold">Early Beta User</div>
              <div className="text-sm text-white/40">San Francisco, CA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="text-sm text-white/60">Simple Pricing</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold">
              Start <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Free</span>
            </h2>
            <p className="text-xl text-white/40 mt-4">No credit card required. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['50 memories', 'Basic AI chat', 'Text only', 'Community support'], cta: 'Start Free', popular: false, gradient: 'from-white/5 to-white/[0.02]' },
              { name: 'Pro', price: '$9.99', period: '/month', features: ['Unlimited memories', 'Voice clone', 'Photo upload', 'Priority support', 'Advanced personality'], cta: 'Go Pro', popular: true, gradient: 'from-purple-500/20 to-pink-500/20' },
              { name: 'Legacy', price: '$49.99', period: '/month', features: ['Everything in Pro', 'Family access (5 members)', 'Eternal preservation', 'Full personality model', 'Dedicated support'], cta: 'Preserve Forever', popular: false, gradient: 'from-white/5 to-white/[0.02]' },
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-3xl border ${plan.popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10' : 'border-white/5'} overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                )}
                <div className={`bg-gradient-to-b ${plan.gradient} p-10`}>
                  {plan.popular && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-sm text-purple-300 mb-6">
                      ⚡ Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-white/40">{plan.period}</span>
                  </div>
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-white/60">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`block text-center py-4 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25' : 'border border-white/10 hover:bg-white/5'}`}>
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
            <div className="relative p-16">
              <div className="text-6xl mb-8">🚀</div>
              <h2 className="text-5xl font-bold mb-6">Ready to Live Forever?</h2>
              <p className="text-xl text-white/50 mb-10 max-w-xl mx-auto">
                Start building your digital consciousness today. Free forever. No credit card required.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 px-12 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105">
                Create Your Clone Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">🧠</div>
            <span className="font-semibold">Consciousness Clone</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 Consciousness Clone. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white transition text-sm">Privacy</a>
            <a href="#" className="text-white/30 hover:text-white transition text-sm">Terms</a>
            <a href="#" className="text-white/30 hover:text-white transition text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
