'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#d946ef' : '#06b6d4',
            '--duration': `${Math.random() * 10 + 6}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="ambient-orb ambient-orb-violet" style={{ width: 300, height: 300, top: '10%', left: '-5%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 250, height: 250, bottom: '10%', right: '-5%' }} />
    </div>
  )
}

export default function PersonalityQuiz() {
  const t = useT()

  const questions = [
    {
      id: 1,
      question: t('how are you'),
      options: [
        { text: `🧘 ${t('mindfulness')}`, trait: "introvert", score: 2 },
        { text: `🎉 ${t('clone network')}`, trait: "extrovert", score: 2 },
        { text: `🤷 ${t('mood')}`, trait: "ambivert", score: 2 },
      ],
    },
    {
      id: 2,
      question: t('clone quiz'),
      options: [
        { text: `🧠 ${t('life score')}`, trait: "analytical", score: 2 },
        { text: `💫 ${t('dream mode')}`, trait: "intuitive", score: 2 },
        { text: `🤝 ${t('clone network')}`, trait: "social", score: 2 },
      ],
    },
    {
      id: 3,
      question: t('personality'),
      options: [
        { text: `😏 ${t('confessions')}`, trait: "sarcastic", score: 2 },
        { text: `🤪 ${t('dream lab')}`, trait: "playful", score: 2 },
        { text: `😐 ${t('mirror mode')}`, trait: "dry", score: 2 },
      ],
    },
    {
      id: 4,
      question: t('life goals'),
      options: [
        { text: `👨‍👩‍👧‍👦 ${t('family tree')}`, trait: "family", score: 2 },
        { text: `💼 ${t('achievements')}`, trait: "ambitious", score: 2 },
        { text: `✈️ ${t('astronaut mode')}`, trait: "free_spirit", score: 2 },
      ],
    },
    {
      id: 5,
      question: t('mood tracker'),
      options: [
        { text: `🎧 ${t('soul playlist')}`, trait: "introspective", score: 2 },
        { text: `💪 ${t('heartbeat')}`, trait: "active", score: 2 },
        { text: `💬 ${t('talk to clone')}`, trait: "expressive", score: 2 },
      ],
    },
    {
      id: 6,
      question: t('heartbeat'),
      options: [
        { text: `🎯 ${t('confessions')}`, trait: "direct", score: 2 },
        { text: `🕊️ ${t('clone therapy')}`, trait: "diplomatic", score: 2 },
        { text: `🎭 ${t('emotion engine')}`, trait: "emotional", score: 2 },
      ],
    },
    {
      id: 7,
      question: t('dream lab'),
      options: [
        { text: `📚 ${t('memory stories')}`, trait: "intellectual", score: 2 },
        { text: `🎊 ${t('clone network')}`, trait: "social", score: 2 },
        { text: `🎨 ${t('idea generator')}`, trait: "creative", score: 2 },
      ],
    },
    {
      id: 8,
      question: t('death simulation'),
      options: [
        { text: `😰 ${t('ghost mode')}`, trait: "legacy", score: 2 },
        { text: `💔 ${t('legacy letters')}`, trait: "attachment", score: 2 },
        { text: `😤 ${t('future self')}`, trait: "ambitious", score: 2 },
      ],
    },
    {
      id: 9,
      question: t('clone quiz'),
      options: [
        { text: `📝 ${t('life score')}`, trait: "analytical", score: 2 },
        { text: `🌊 ${t('dream mode')}`, trait: "spontaneous", score: 2 },
        { text: `🔮 ${t('predictions')}`, trait: "strategic", score: 2 },
      ],
    },
    {
      id: 10,
      question: t('clone identity'),
      options: [
        { text: `💭 ${t('dream lab')}`, trait: "imaginative", score: 2 },
        { text: `⚡ ${t('milestones')}`, trait: "action_oriented", score: 2 },
        { text: `🧠 ${t('life score')}`, trait: "philosophical", score: 2 },
      ],
    },
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleAnswer = (trait: string) => {
    setSelectedOption(trait)
    const newAnswers = { ...answers }
    newAnswers[trait] = (newAnswers[trait] || 0) + 1
    setAnswers(newAnswers)

    setTimeout(() => {
      setSelectedOption(null)
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setCompleted(true)
      }
    }, 400)
  }

  const getTopTraits = () => {
    return Object.entries(answers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([trait]) => trait)
  }

  const savePersonality = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaving(false); return }

      const traits = getTopTraits()
      await supabase.from('memories').insert({
        user_id: user.id,
        content: `Personality Profile: ${traits.join(', ')}. Top trait: ${traits[0]}. Communication style: ${answers.direct ? 'Direct' : answers.diplomatic ? 'Diplomatic' : 'Emotional'}. Energy: ${answers.introvert ? 'Introvert' : answers.extrovert ? 'Extrovert' : 'Ambivert'}.`,
        category: 'personality',
        mood: '🧬',
      })

      window.location.href = '/dashboard'
    } catch {
      setSaving(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (completed) {
    const topTraits = getTopTraits()
    return (
      <main className="min-h-screen animated-gradient-bg noise-overlay flex items-center justify-center px-6 pb-24 md:pb-0">
        <Particles />
        <div className="max-w-2xl w-full relative z-10">
          {/* Hero */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="relative inline-block mb-6">
              <div aria-hidden="true" className="text-7xl">🧬</div>
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl" />
            </div>
            <h1 className="text-5xl font-black gradient-text mb-3">{t('personality')}</h1>
            <p className="text-white/30 text-lg">{t('your clone awaits')}</p>
          </div>

          {/* Profile Card */}
          <div className="glass-card p-8 mb-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-3xl" />

            <h2 className="text-xl font-bold mb-6 text-white/90">{t('achievements')}</h2>
            <div className="flex flex-wrap gap-3 mb-8">
              {topTraits.map((trait, i) => (
                <span
                  key={trait}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                    i === 0
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25'
                      : 'glass-card hover:border-violet-500/30'
                  }`}
                >
                  {i === 0 && '👑 '}{trait.replace('_', ' ')}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              {[
                { label: t('emotion engine'), value: answers.introvert ? '🧘 Introvert' : answers.extrovert ? '🎉 Extrovert' : '🤷 Ambivert' },
                { label: t('life score'), value: answers.analytical ? '🧠 Analytical' : answers.intuitive ? '💫 Intuitive' : '🤝 Social' },
                { label: t('personality'), value: answers.sarcastic ? '😏 Sarcastic' : answers.playful ? '🤪 Playful' : '😐 Dry' },
                { label: t('heartbeat'), value: answers.direct ? '🎯 Direct' : answers.diplomatic ? '🕊️ Diplomatic' : '🎭 Emotional' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-white/40 text-sm">{item.label}</span>
                  <span className="text-white/80 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={savePersonality}
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl font-bold text-lg glow-btn disabled:opacity-50 transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('loading')}
                </span>
              ) : `${t('save')} & ${t('dashboard')}`}
            </button>
            <Link
              href="/dashboard"
              className="px-8 py-4 glass-card rounded-2xl hover:border-violet-500/30 hover:bg-white/[0.04] transition-all font-medium flex items-center"
            >
              {t('cancel')}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const q = questions[currentQuestion]

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay flex items-center justify-center px-6 pb-24 md:pb-0">
      <Particles />
      <div className="max-w-xl w-full relative z-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-sm text-white/30 mb-3">
            <span className="font-medium">{t('clone quiz')} {currentQuestion + 1}/{questions.length}</span>
            <span className="gradient-text font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden premium-progress">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite' }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-10 animate-slide-up" key={currentQuestion}>
          <div className="relative inline-block mb-5">
            <div aria-hidden="true" className="text-6xl">🤔</div>
            <div className="absolute inset-0 bg-fuchsia-500/10 rounded-full blur-2xl animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white/95 mb-3 leading-tight">{q.question}</h1>
          <p className="text-white/25 text-base">{t('select mood')}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 stagger-children" key={`opts-${currentQuestion}`}>
          {q.options.map((option) => (
            <button
              key={option.trait}
              onClick={() => handleAnswer(option.trait)}
              className={`w-full p-5 rounded-2xl text-left text-lg font-medium transition-all duration-300 group ${
                selectedOption === option.trait
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-2 border-violet-500/50 shadow-lg shadow-violet-500/20 scale-[1.02]'
                  : 'glass-card hover:border-violet-500/30 hover:bg-white/[0.04] hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  selectedOption === option.trait ? 'bg-violet-400 scale-150' : 'bg-white/10 group-hover:bg-violet-400/50'
                }`} />
                <span className="text-white/90 group-hover:text-white transition-colors">{option.text}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Back button */}
        {currentQuestion > 0 && (
          <button
            onClick={() => { setCurrentQuestion(currentQuestion - 1); setSelectedOption(null) }}
            className="mt-8 text-white/25 hover:text-white/60 transition-all text-sm flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            {t('back')}
          </button>
        )}
      </div>
    </main>
  )
}
