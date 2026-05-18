import Link from 'next/link'
import Testimonials from '../components/Testimonials'
import AppRedirect from '../components/AppRedirect'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <AppRedirect />
      {/* Ultra Premium Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a2e] to-[#050510]" />
        
        {/* Animated orbs */}
        <div className="absolute top-[-200px] left-[-100px] w-[800px] h-[800px] rounded-full opacity-30" 
             style={{ background: 'radial-gradient(circle, rgba(120, 50, 255, 0.4) 0%, transparent 70%)', animation: 'orb1 15s ease-in-out infinite' }} />
        <div className="absolute bottom-[-300px] right-[-200px] w-[900px] h-[900px] rounded-full opacity-20" 
             style={{ background: 'radial-gradient(circle, rgba(255, 50, 120, 0.4) 0%, transparent 70%)', animation: 'orb2 20s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15" 
             style={{ background: 'radial-gradient(circle, rgba(50, 100, 255, 0.3) 0%, transparent 70%)', animation: 'orb3 12s ease-in-out infinite' }} />
        
        {/* Star field */}
        <div className="stars" />
        <div className="stars2" />
        <div className="stars3" />
        
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.6)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/30">🧠</div>
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-30" />
            </div>
            <span className="text-lg font-bold tracking-tight">Consciousness Clone</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/40 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-white/40 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-sm text-white/40 hover:text-white transition">Pricing</a>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/login" prefetch={true} className="px-5 py-2.5 text-sm text-white/50 hover:text-white transition">Sign In</Link>
            <Link href="/signup" prefetch={true} className="relative group px-6 py-2.5 text-sm font-semibold rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Get Started Free</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO — Premium */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.06] mb-12" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="relative flex h-2.5 w-2.5">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </div>
            <span className="text-sm text-white/50 font-medium">Now in Public Beta — Join 2,500+ Users</span>
          </div>

          {/* Main headline with gradient animation */}
          <h1 className="text-7xl md:text-[120px] font-black mb-8 leading-[0.95] tracking-[-0.04em]">
            <span className="block text-white">Your Mind.</span>
            <span className="block mt-2" style={{
              background: 'linear-gradient(135deg, #a78bfa, #ec4899, #f97316, #a78bfa)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient-shift 8s ease infinite'
            }}>Forever.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/35 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
            Upload your memories, voice, and personality. Create an AI clone that lives on — even after you&apos;re gone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20">
            <Link href="/signup" prefetch={true} className="group relative px-12 py-5 rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <span className="relative z-10 flex items-center gap-2">
                Create Your Clone
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </Link>
            <Link href="#how-it-works" prefetch={true} className="group px-12 py-5 rounded-full text-lg font-medium border border-white/[0.08] hover:border-white/[0.15] transition-all hover:bg-white/[0.02]">
              <span className="flex items-center gap-2 text-white/60 group-hover:text-white/80">
                Watch Demo
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </Link>
          </div>

          {/* Trust logos */}
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs text-white/20 uppercase tracking-[0.3em] font-medium">Featured On</p>
            <div className="flex items-center gap-12 opacity-30">
              {['Product Hunt', 'TechCrunch', 'The Verge', 'Wired'].map((name, i) => (
                <span key={i} className="text-white/40 text-sm font-semibold tracking-wider uppercase">{name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-white/20">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border border-white/10 flex justify-center p-1">
            <div className="w-1.5 h-3 bg-white/30 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative py-16 border-y border-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,847', label: 'Memories Created', icon: '📝' },
              { value: '2,531', label: 'Active Users', icon: '👥' },
              { value: '150K+', label: 'AI Conversations', icon: '💬' },
              { value: '99.97%', label: 'Uptime', icon: '⚡' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-sm text-white/25 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Ultra Premium */}
      <section id="how-it-works" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold">Process</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">
              Three Steps to<br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Digital Immortality</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                step: '01', 
                icon: '📝', 
                title: 'Upload Your Life', 
                desc: 'Write memories, record voice notes, upload photos. Every moment matters — from childhood dreams to today\'s thoughts.',
                gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
                borderColor: 'hover:border-violet-500/20',
                glowColor: 'rgba(139, 92, 246, 0.15)'
              },
              { 
                step: '02', 
                icon: '🧬', 
                title: 'AI Learns You', 
                desc: 'Our neural network studies your personality, humor, values, and thinking patterns. It doesn\'t just learn what you say — it learns who you are.',
                gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
                borderColor: 'hover:border-fuchsia-500/20',
                glowColor: 'rgba(217, 70, 239, 0.15)'
              },
              { 
                step: '03', 
                icon: '♾️', 
                title: 'Live Forever', 
                desc: 'Your clone talks like you, thinks like you, remembers like you. Share it with family — they can talk to "you" anytime, anywhere, forever.',
                gradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
                borderColor: 'hover:border-orange-500/20',
                glowColor: 'rgba(249, 115, 22, 0.15)'
              },
            ].map((step, i) => (
              <div key={i} className="group relative">
                {/* Glow */}
                <div className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" style={{ background: step.glowColor }} />
                
                <div className={`relative h-full rounded-2xl border border-white/[0.04] ${step.borderColor} transition-all duration-500 overflow-hidden`} style={{ background: 'rgba(255,255,255,0.01)' }}>
                  {/* Top gradient */}
                  <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${step.gradient}`} />
                  
                  <div className="relative p-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs text-white/15 font-mono tracking-[0.3em]">STEP {step.step}</span>
                      <div className="w-8 h-8 rounded-full border border-white/[0.06] flex items-center justify-center text-sm text-white/30">
                        {i + 1}
                      </div>
                    </div>
                    <div className="text-5xl mb-8">{step.icon}</div>
                    <h3 className="text-2xl font-bold mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-white/30 leading-relaxed text-[15px]">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — Bento Grid */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold">Features</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">
              Built for the<br />
              <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Impossible</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 group relative rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-violet-500/10 to-transparent" />
              <div className="relative p-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20 mb-8">🧠</div>
                <h3 className="text-2xl font-bold mb-4">Personality Engine</h3>
                <p className="text-white/30 leading-relaxed max-w-lg">Our AI doesn&apos;t just memorize — it understands. It learns your humor, your values, your decision-making patterns. The result? A clone that thinks exactly like you.</p>
                <div className="mt-8 flex items-center gap-2 text-violet-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Learn more <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </div>

            {/* Tall card */}
            <div className="md:row-span-2 group relative rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-fuchsia-500/10 to-transparent" />
              <div className="relative p-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20 mb-8">🎤</div>
                <h3 className="text-2xl font-bold mb-4">Voice Cloning</h3>
                <p className="text-white/30 leading-relaxed mb-6">Your clone speaks in YOUR voice. Record 5 minutes of audio — our AI captures your tone, accent, and speaking style perfectly.</p>
                <div className="mt-auto p-4 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">▶</div>
                    <div className="flex-1 h-1 bg-white/10 rounded-full">
                      <div className="h-full w-3/4 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full" />
                    </div>
                    <span className="text-xs text-white/30">1:24</span>
                  </div>
                  <p className="text-xs text-white/20">Sample voice preview</p>
                </div>
              </div>
            </div>

            {/* Regular cards */}
            {[
              { icon: '📅', title: 'Life Timeline', desc: 'Your memories organized chronologically. A beautiful visual journey through your life.', gradient: 'from-orange-500 to-amber-500' },
              { icon: '🔒', title: 'Military-Grade Encryption', desc: 'End-to-end encrypted. Your data is yours. We never sell, share, or access your memories.', gradient: 'from-emerald-500 to-teal-500' },
              { icon: '👨‍👩‍👧', title: 'Family Access', desc: 'Share your clone with loved ones. Set permissions. They can talk to "you" anytime.', gradient: 'from-blue-500 to-cyan-500' },
              { icon: '🌍', title: 'Multilingual', desc: 'Your clone speaks 50+ languages. Your grandchildren can chat in their native tongue.', gradient: 'from-amber-500 to-orange-500' },
            ].map((feature, i) => (
              <div key={i} className="group relative rounded-2xl border border-white/[0.04] hover:border-white/[0.08] transition-all duration-500" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="relative p-8">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-xl shadow-lg mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-violet-500/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-fuchsia-500/5 to-transparent" />
            
            <div className="relative p-16 md:p-20 text-center">
              <div className="text-7xl mb-10">💬</div>
              <blockquote className="text-3xl md:text-[42px] font-light text-white/70 leading-[1.3] mb-12 max-w-3xl mx-auto">
                &quot;I uploaded 200 memories over 2 weeks. My clone knew me better than my best friend. It&apos;s the most surreal experience — talking to yourself.&quot;
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl font-bold">S</div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Sarah Chen</div>
                  <div className="text-white/30 text-sm">Beta Tester • San Francisco</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING — Ultra Premium */}
      <section id="pricing" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold">Pricing</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight">
              Start <span style={{
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Free</span>
            </h2>
            <p className="text-xl text-white/25 mt-6 font-light">No credit card. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: 'forever', desc: 'Perfect for getting started', features: ['50 memories', 'Basic AI chat', 'Text only', 'Community support'], cta: 'Start Free', popular: false },
              { name: 'Pro', price: '$9.99', period: '/month', desc: 'For serious memory builders', features: ['Unlimited memories', 'Voice clone', 'Photo & video upload', 'Priority support', 'Advanced personality model'], cta: 'Go Pro', popular: true },
              { name: 'Legacy', price: '$49.99', period: '/month', desc: 'Your eternal digital legacy', features: ['Everything in Pro', 'Family access (5 members)', 'Eternal preservation', 'Full consciousness model', 'Dedicated success manager'], cta: 'Preserve Forever', popular: false },
            ].map((plan, i) => (
              <div key={i} className={`group relative rounded-2xl transition-all duration-500 ${plan.popular ? 'md:-mt-4 md:mb-[-16px]' : ''}`}>
                {/* Popular glow */}
                {plan.popular && (
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-violet-500/50 via-fuchsia-500/30 to-transparent rounded-2xl" />
                )}
                
                <div className={`relative h-full rounded-2xl border ${plan.popular ? 'border-transparent' : 'border-white/[0.04] hover:border-white/[0.08]'} overflow-hidden transition-all duration-500`} style={{ background: plan.popular ? 'rgba(20, 10, 40, 0.8)' : 'rgba(255,255,255,0.01)' }}>
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
                  )}
                  
                  <div className="p-10">
                    {plan.popular && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300 font-semibold mb-6">
                        ⚡ MOST POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-white/25 text-sm mb-6">{plan.desc}</p>
                    <div className="flex items-baseline gap-1 mb-10">
                      <span className="text-6xl font-black">{plan.price}</span>
                      <span className="text-white/30 text-lg">{plan.period}</span>
                    </div>
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-white/50 text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup" prefetch={true} className={`block text-center py-4 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]' : 'border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] text-white/60'}`}>
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FINAL CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-fuchsia-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px]" />
            
            <div className="relative p-16 md:p-20 text-center">
              <div className="text-7xl mb-10">🚀</div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                Ready to<br />Live Forever?
              </h2>
              <p className="text-xl text-white/30 mb-12 max-w-lg mx-auto font-light">
                Start building your digital consciousness today. Free forever. No credit card required.
              </p>
              <Link href="/signup" prefetch={true} className="group relative inline-flex items-center gap-3 px-14 py-6 rounded-full text-lg font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <span className="relative z-10">Create Your Clone Now</span>
                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.03] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg">🧠</div>
                <span className="text-lg font-bold">Consciousness Clone</span>
              </div>
              <p className="text-white/25 text-sm leading-relaxed max-w-sm">
                Preserving human consciousness for eternity. Your memories, your voice, your personality — forever.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3">
                {[{name: 'Features', href: '/#features'}, {name: 'Pricing', href: '/pricing'}, {name: 'Blog', href: '/blog'}, {name: 'API', href: '#'}].map((link, i) => (
                  <li key={i}><Link href={link.href} prefetch={true} className="text-sm text-white/25 hover:text-white/60 transition">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((link, i) => (
                  <li key={i}><a href="#" className="text-sm text-white/25 hover:text-white/60 transition">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/[0.03]">
            <p className="text-white/15 text-sm">© 2026 Consciousness Clone. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" prefetch={true} className="text-white/15 hover:text-white/40 transition text-sm">Privacy</Link>
              <Link href="/terms" prefetch={true} className="text-white/15 hover:text-white/40 transition text-sm">Terms</Link>
              <a href="#" className="text-white/15 hover:text-white/40 transition text-sm">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
// redeploy trigger
