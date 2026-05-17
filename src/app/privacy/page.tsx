'use client'

import Link from 'next/link'

export default function Privacy() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/30 mb-10">Last updated: May 2026</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p><strong className="text-white">Account Information:</strong> Email address, display name, and authentication credentials.</p>
            <p className="mt-2"><strong className="text-white">Your Content:</strong> Memories, chat messages, personality quiz responses, and any voice recordings you upload.</p>
            <p className="mt-2"><strong className="text-white">Usage Data:</strong> How you interact with the Service, including pages visited, features used, and session duration.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: provide and improve the Service; train your personal consciousness clone; respond to your messages and support requests; send important service updates; and ensure platform security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
            <p>We implement industry-standard encryption for data at rest and in transit. Your memories and personal content are encrypted end-to-end. Only you can access your data through your authenticated account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
            <p>We do NOT sell, rent, or share your personal data with third parties for marketing purposes. We may share anonymized, aggregated data for research or analytics. We may disclose data if required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Third-Party Services</h2>
            <p>We use Supabase for authentication and database services, and Gitlawb Opengateway for AI processing. These services have their own privacy policies and security measures.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Data Retention</h2>
            <p>We retain your data as long as your account is active. If you delete your account, all personal data including memories, messages, and clone data will be permanently deleted within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to: access all your personal data; export your data at any time; delete your account and all associated data; opt out of non-essential communications; and request correction of inaccurate data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact</h2>
            <p>For privacy-related questions, contact us at: privacy@consciousnessclone.ai</p>
          </section>
        </div>
      </div>
    </main>
  )
}
