'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useT } from '../../lib/language-context'

export default function VoiceClone() {
  const t = useT()
  const [step, setStep] = useState(1)
  const [recording, setRecording] = useState(false)

  return (
    <main className="min-h-screen bg-[#050510]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50" style={{ background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(40px)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">🧠</div>
            <span className="text-lg font-bold">Consciousness Clone</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-sm text-white/40 hover:text-white transition">Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div aria-hidden="true" className="text-6xl mb-4">🎤</div>
          <h1 className="text-4xl font-bold mb-4">{t('voice clone')}</h1>
          <p className="text-white/30 text-lg">{t('make clone sound')}</p>
        </div>

        {/* Free Feature Banner */}
        <div className="rounded-2xl border border-emerald-500/30 p-6 mb-10 text-center" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="text-2xl mb-2">✨</div>
          <h3 className="text-lg font-bold text-emerald-400">Free Feature</h3>
          <p className="text-white/40 text-sm mt-1">Voice cloning is free for everyone — no limits</p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div className={`rounded-2xl border p-6 transition ${step === 1 ? 'border-violet-500/50' : 'border-white/[0.04]'}`} style={{ background: step === 1 ? 'rgba(139, 92, 246, 0.03)' : 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 1 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/[0.04]'}`}>1</div>
              <h3 className="text-lg font-bold">{t('record')}</h3>
            </div>
            <p className="text-white/40 text-sm mb-6 ml-14">Read the following script naturally. We need about 5 minutes of clear audio.</p>
            <div className="ml-14">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-6 mb-4">
                <p className="text-white/60 text-sm leading-relaxed">
                  &ldquo;The quick brown fox jumps over the lazy dog. I believe that every person has a unique story worth preserving. My name is [Your Name], and this is my voice — the way I laugh, the way I think, the way I express my feelings. Some days I feel energetic and ready to conquer the world. Other days, I prefer quiet reflection with a cup of tea. My family means everything to me, and my dreams keep me moving forward.&rdquo;
                </p>
              </div>
              <button
                onClick={() => setRecording(!recording)}
                className={`px-8 py-3 rounded-xl font-semibold transition ${recording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90'}`}
              >
                {recording ? '⏹ Stop Recording' : '🎤 Start Recording'}
              </button>
              {recording && (
                <p className="text-white/30 text-sm mt-3 animate-pulse">Recording... Speak clearly into your microphone</p>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className={`rounded-2xl border p-6 transition ${step === 2 ? 'border-violet-500/50' : 'border-white/[0.04] opacity-50'}`} style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04]">2</div>
              <h3 className="text-lg font-bold">AI Processing</h3>
            </div>
            <p className="text-white/40 text-sm ml-14">Our AI analyzes your voice patterns, tone, pitch, and speaking style.</p>
          </div>

          {/* Step 3 */}
          <div className={`rounded-2xl border p-6 transition ${step === 3 ? 'border-violet-500/50' : 'border-white/[0.04] opacity-50'}`} style={{ background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04]">3</div>
              <h3 className="text-lg font-bold">Test Your Clone</h3>
            </div>
            <p className="text-white/40 text-sm ml-14">Chat with your clone and hear it respond in your own voice!</p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 rounded-2xl border border-white/[0.04] p-8" style={{ background: 'rgba(255,255,255,0.01)' }}>
          <h2 className="text-xl font-bold mb-6">{t('voice sample')} 🔬</h2>
          <div className="space-y-4">
            {[
              { icon: '🎤', title: 'Record', desc: '5 minutes of clear speech in a quiet environment' },
              { icon: '🧠', title: 'Analyze', desc: 'AI extracts your vocal patterns, pitch, and rhythm' },
              { icon: '🔊', title: 'Generate', desc: 'Creates a digital copy of your voice' },
              { icon: '💬', title: 'Chat', desc: 'Your clone responds with your voice in real-time' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
