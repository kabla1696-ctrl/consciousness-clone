'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase-browser'

const questions = [
  {
    id: 1,
    question: "How do you recharge?",
    options: [
      { text: "Alone time 🧘", trait: "introvert", score: 2 },
      { text: "With friends 🎉", trait: "extrovert", score: 2 },
      { text: "Depends on my mood 🤷", trait: "ambivert", score: 2 },
    ],
  },
  {
    id: 2,
    question: "When facing a problem, you...",
    options: [
      { text: "Analyze it logically 🧠", trait: "analytical", score: 2 },
      { text: "Follow my gut feeling 💫", trait: "intuitive", score: 2 },
      { text: "Ask others for advice 🤝", trait: "social", score: 2 },
    ],
  },
  {
    id: 3,
    question: "Your humor style?",
    options: [
      { text: "Sarcastic & witty 😏", trait: "sarcastic", score: 2 },
      { text: "Goofy & silly 🤪", trait: "playful", score: 2 },
      { text: "Dry & deadpan 😐", trait: "dry", score: 2 },
    ],
  },
  {
    id: 4,
    question: "What matters most to you?",
    options: [
      { text: "Family & loved ones 👨‍👩‍👧‍👦", trait: "family", score: 2 },
      { text: "Career & success 💼", trait: "ambitious", score: 2 },
      { text: "Freedom & adventure ✈️", trait: "free_spirit", score: 2 },
    ],
  },
  {
    id: 5,
    question: "How do you handle stress?",
    options: [
      { text: "Music & solitude 🎧", trait: "introspective", score: 2 },
      { text: "Exercise & movement 💪", trait: "active", score: 2 },
      { text: "Talk it out with someone 💬", trait: "expressive", score: 2 },
    ],
  },
  {
    id: 6,
    question: "Your communication style?",
    options: [
      { text: "Direct & honest 🎯", trait: "direct", score: 2 },
      { text: "Diplomatic & careful 🕊️", trait: "diplomatic", score: 2 },
      { text: "Emotional & expressive 🎭", trait: "emotional", score: 2 },
    ],
  },
  {
    id: 7,
    question: "Pick a weekend activity:",
    options: [
      { text: "Reading & learning 📚", trait: "intellectual", score: 2 },
      { text: "Partying & socializing 🎊", trait: "social", score: 2 },
      { text: "Creating something new 🎨", trait: "creative", score: 2 },
    ],
  },
  {
    id: 8,
    question: "Your biggest fear?",
    options: [
      { text: "Being forgotten 😰", trait: "legacy", score: 2 },
      { text: "Losing loved ones 💔", trait: "attachment", score: 2 },
      { text: "Not reaching my potential 😤", trait: "ambitious", score: 2 },
    ],
  },
  {
    id: 9,
    question: "How do you make decisions?",
    options: [
      { text: "Pros and cons list 📝", trait: "analytical", score: 2 },
      { text: "Go with the flow 🌊", trait: "spontaneous", score: 2 },
      { text: "Think about long-term impact 🔮", trait: "strategic", score: 2 },
    ],
  },
  {
    id: 10,
    question: "What describes you best?",
    options: [
      { text: "Dreamer 💭", trait: "imaginative", score: 2 },
      { text: "Doer ⚡", trait: "action_oriented", score: 2 },
      { text: "Thinker 🧠", trait: "philosophical", score: 2 },
    ],
  },
]

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAnswer = (trait: string) => {
    const newAnswers = { ...answers }
    newAnswers[trait] = (newAnswers[trait] || 0) + 1
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCompleted(true)
    }
  }

  const getTopTraits = () => {
    return Object.entries(answers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trait]) => trait)
  }

  const savePersonality = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const traits = getTopTraits()
    await supabase.from('memories').insert({
      user_id: user.id,
      content: `Personality Profile: ${traits.join(', ')}. Top trait: ${traits[0]}. Communication style: ${answers.direct ? 'Direct' : answers.diplomatic ? 'Diplomatic' : 'Emotional'}. Energy: ${answers.introvert ? 'Introvert' : answers.extrovert ? 'Extrovert' : 'Ambivert'}.`,
      category: 'personality',
      mood: '🧬',
    })

    setSaving(false)
    window.location.href = '/dashboard'
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (completed) {
    const topTraits = getTopTraits()
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🧬</div>
            <h1 className="text-4xl font-bold mb-2">Your Personality Profile</h1>
            <p className="text-white/30">Based on your answers, here&apos;s who you are</p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] p-8 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h2 className="text-xl font-bold mb-6">Your Top Traits</h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {topTraits.map((trait, i) => (
                <span key={trait} className={`px-4 py-2 rounded-full text-sm font-semibold ${i === 0 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
                  {i === 0 && '👑 '}{trait.replace('_', ' ')}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                <span className="text-white/40">Energy</span>
                <span className="text-white/70">{answers.introvert ? '🧘 Introvert' : answers.extrovert ? '🎉 Extrovert' : '🤷 Ambivert'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                <span className="text-white/40">Thinking</span>
                <span className="text-white/70">{answers.analytical ? '🧠 Analytical' : answers.intuitive ? '💫 Intuitive' : '🤝 Social'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/[0.03]">
                <span className="text-white/40">Humor</span>
                <span className="text-white/70">{answers.sarcastic ? '😏 Sarcastic' : answers.playful ? '🤪 Playful' : '😐 Dry'}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-white/40">Communication</span>
                <span className="text-white/70">{answers.direct ? '🎯 Direct' : answers.diplomatic ? '🕊️ Diplomatic' : '🎭 Emotional'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={savePersonality}
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Go to Dashboard'}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-4 border border-white/[0.06] rounded-xl hover:bg-white/[0.02] transition"
            >
              Skip
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const q = questions[currentQuestion]

  return (
    <main className="min-h-screen bg-[#050510] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/30 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="text-3xl font-bold mb-2">{q.question}</h1>
          <p className="text-white/30">Choose the one that resonates most with you</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((option) => (
            <button
              key={option.trait}
              onClick={() => handleAnswer(option.trait)}
              className="w-full p-5 rounded-xl border border-white/[0.06] hover:border-violet-500/50 hover:bg-violet-500/5 transition text-left text-lg"
            >
              {option.text}
            </button>
          ))}
        </div>

        {/* Back button */}
        {currentQuestion > 0 && (
          <button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            className="mt-6 text-white/30 hover:text-white/60 transition text-sm"
          >
            ← Previous question
          </button>
        )}
      </div>
    </main>
  )
}
