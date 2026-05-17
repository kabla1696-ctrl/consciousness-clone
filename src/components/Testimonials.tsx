'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase-browser'

const testimonials = [
  {
    name: "Sarah K.",
    role: "Writer, NYC",
    avatar: "👩‍💼",
    text: "I lost my grandmother last year. Uploading her stories and being able to 'talk' to her again... I cried the first time. This is more than technology — it's healing.",
    rating: 5,
  },
  {
    name: "Marcus T.",
    role: "Entrepreneur, London",
    avatar: "👨‍💻",
    text: "I built my clone so my kids can know who I really am — not just the 'dad' version, but the real me. My ambitions, my failures, my lessons. Worth every penny.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Doctor, Mumbai",
    avatar: "👩‍⚕️",
    text: "The personality quiz nailed it. My clone responds exactly how I would — same sarcasm, same empathy. My friends couldn't tell the difference in a blind test!",
    rating: 5,
  },
  {
    name: "Alex R.",
    role: "Student, Berlin",
    avatar: "🧑‍🎓",
    text: "Free plan is actually usable! I've stored 50 memories and my clone already knows me better than some friends. The AI responses are scary accurate.",
    rating: 4,
  },
  {
    name: "Yuki H.",
    role: "Artist, Tokyo",
    avatar: "👩‍🎨",
    text: "I use it as a creative journal that talks back. My clone suggests ideas based on my past work and dreams. It's like having a version of myself that never forgets.",
    rating: 5,
  },
  {
    name: "David L.",
    role: "Retired, Sydney",
    avatar: "👴",
    text: "At 72, I wanted to preserve my life story. The Immortal plan's legacy mode means my grandchildren will always be able to hear my stories. Beautiful concept.",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Real People.{' '}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Real Consciousness.</span>
          </h2>
          <p className="text-white/30 text-xl max-w-2xl mx-auto">
            Thousands are already preserving their digital souls. Here&apos;s what they say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.04] hover:border-white/[0.08] p-8 transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{t.avatar}</div>
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-white/30 text-sm">{t.role}</p>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className={`text-lg ${j < t.rating ? 'text-amber-400' : 'text-white/10'}`}>★</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: "10,000+", label: "Clones Created" },
            { value: "500K+", label: "Memories Stored" },
            { value: "2M+", label: "Conversations" },
            { value: "4.9★", label: "Average Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center py-6 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-white/30 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
