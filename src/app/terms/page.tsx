'use client'

import Link from 'next/link'

export default function Terms() {
  return (
    <main className="min-h-screen bg-[#050510]">
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/30 mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Consciousness Clone (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Description of Service</h2>
            <p>Consciousness Clone provides an AI-powered platform for creating a digital version of yourself based on your memories, personality traits, and interactions. The Service includes text-based chat, personality profiling, and optional voice cloning features.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years old to use the Service. You agree to provide accurate and complete information during registration.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Your Content</h2>
            <p>You retain full ownership of all memories, messages, and content you upload. By using the Service, you grant us a limited license to process your content solely for providing the Service. We do not sell or share your personal content with third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Acceptable Use</h2>
            <p>You agree not to: use the Service for illegal purposes; upload harmful or offensive content; attempt to reverse-engineer the AI models; impersonate others; or disrupt the Service&apos;s infrastructure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Subscription & Payments</h2>
            <p>Consciousness Clone is completely free. All features are available to all users at no cost. There are no paid plans, subscriptions, or hidden fees.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>The Service, including its AI models, design, and technology, is owned by Consciousness Clone. You may not copy, modify, or distribute any part of the Service without written permission.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided &quot;as is&quot; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Termination</h2>
            <p>We may terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time through the dashboard settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact us at: support@consciousnessclone.ai</p>
          </section>
        </div>
      </div>
    </main>
  )
}
