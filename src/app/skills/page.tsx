'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Skill {
  id: string
  user_id: string
  skill_name: string
  description: string
  level: string
  lessons: Lesson[]
  created_at: string
}

interface Lesson {
  id: string
  title: string
  content: string
  completed: boolean
}

const LEVELS = [
  { id: 'beginner', label: 'Beginner', icon: '🌱', color: 'text-emerald-400', glow: 'shadow-emerald-500/20', bg: 'from-emerald-500/10 to-emerald-500/5' },
  { id: 'intermediate', label: 'Intermediate', icon: '📈', color: 'text-cyan-400', glow: 'shadow-cyan-500/20', bg: 'from-cyan-500/10 to-cyan-500/5' },
  { id: 'advanced', label: 'Advanced', icon: '🔥', color: 'text-orange-400', glow: 'shadow-orange-500/20', bg: 'from-orange-500/10 to-orange-500/5' },
  { id: 'expert', label: 'Expert', icon: '👑', color: 'text-violet-400', glow: 'shadow-violet-500/20', bg: 'from-violet-500/10 to-violet-500/5' },
]

export default function Skills() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [generatingLessons, setGeneratingLessons] = useState<string | null>(null)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  const [skillName, setSkillName] = useState('')
  const [skillDesc, setSkillDesc] = useState('')
  const [skillLevel, setSkillLevel] = useState('beginner')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadSkills(user.id)
    }
    init()
  }, [])

  const loadSkills = async (userId: string) => {
    const { data } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setSkills(data)
    setLoading(false)
  }

  const addSkill = async () => {
    if (!skillName.trim() || !user) return

    const { data } = await supabase
      .from('skills')
      .insert({
        user_id: user.id,
        skill_name: skillName.trim(),
        description: skillDesc.trim(),
        level: skillLevel,
        lessons: [],
      })
      .select()
      .single()

    if (data) {
      setSkills([data, ...skills])
      setSkillName('')
      setSkillDesc('')
      setSkillLevel('beginner')
      setShowAdd(false)
    }
  }

  const generateLessons = async (skill: Skill) => {
    setGeneratingLessons(skill.id)

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a structured set of 5-8 progressive lessons for someone learning "${skill.skill_name}" at ${skill.level} level. Context: ${skill.description || 'No additional context provided.'}\n\nReturn ONLY valid JSON array with this exact format:\n[{"id":"1","title":"Lesson Title","content":"2-3 sentence description of what this lesson covers and key takeaways","completed":false}]\n\nMake lessons progressively harder. Be practical and specific.`
          }],
          memories: '',
        }),
      })

      const data = await response.json()
      let lessons: Lesson[] = []

      try {
        const raw = data.reply || '[]'
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        lessons = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw)
      } catch {
        lessons = [
          { id: '1', title: `Introduction to ${skill.skill_name}`, content: 'Learn the fundamental concepts and get started with the basics.', completed: false },
          { id: '2', title: 'Core Fundamentals', content: 'Build a solid foundation with essential techniques and principles.', completed: false },
          { id: '3', title: 'Practice & Application', content: 'Apply what you\'ve learned through hands-on exercises.', completed: false },
          { id: '4', title: 'Intermediate Techniques', content: 'Level up your skills with more advanced methods.', completed: false },
          { id: '5', title: 'Mastering the Craft', content: 'Refine your approach and develop your own style.', completed: false },
        ]
      }

      await supabase.from('skills').update({ lessons }).eq('id', skill.id)
      setSkills(skills.map(s => s.id === skill.id ? { ...s, lessons } : s))
      setExpandedSkill(skill.id)
    } catch (err) {
      console.error('Failed to generate lessons:', err)
    }

    setGeneratingLessons(null)
  }

  const toggleLesson = async (skillId: string, lessonId: string) => {
    const skill = skills.find(s => s.id === skillId)
    if (!skill) return

    const updatedLessons = skill.lessons.map(l =>
      l.id === lessonId ? { ...l, completed: !l.completed } : l
    )

    await supabase.from('skills').update({ lessons: updatedLessons }).eq('id', skillId)
    setSkills(skills.map(s => s.id === skillId ? { ...s, lessons: updatedLessons } : s))
  }

  const deleteSkill = async (id: string) => {
    await supabase.from('skills').delete().eq('id', id)
    setSkills(skills.filter(s => s.id !== id))
  }

  const getProgress = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return 0
    return Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100)
  }

  const totalLessons = skills.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)
  const completedLessons = skills.reduce((acc, s) => acc + (s.lessons?.filter(l => l.completed).length || 0), 0)

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="text-white/30 text-sm">{t('loading')}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/[0.03] rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/[0.02] rounded-full blur-[128px]" />
      </div>

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.05] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1.5 rounded-lg hover:bg-white/[0.05] transition">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('skills')}</h1>
        </div>
      </header>

      <div className="relative z-10 pt-6 px-4 max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-white/90 to-white/50 bg-clip-text text-transparent">{t('skills')} 🎯</h1>
            <p className="text-white/25 text-sm">{skills.length} skills • {completedLessons}/{totalLessons} lessons completed</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">+ {t('add')}</span>
          </button>
        </div>

        {/* Stats */}
        {skills.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { value: skills.length, label: t('skills'), color: 'text-violet-400', glow: 'shadow-violet-500/10' },
              { value: totalLessons, label: t('features'), color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/10' },
              { value: completedLessons, label: t('success'), color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
              { value: skills.filter(s => s.lessons?.length > 0).length, label: t('memories'), color: 'text-amber-400', glow: 'shadow-amber-500/10' },
            ].map((stat, i) => (
              <div key={i} className={`relative rounded-2xl border border-white/[0.06] p-5 text-center backdrop-blur-xl bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 shadow-lg ${stat.glow}`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                <div className={`relative text-3xl font-bold ${stat.color} drop-shadow-lg`}>{stat.value}</div>
                <div className="relative text-white/25 text-xs mt-1 font-medium tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Skill Form */}
        {showAdd && (
          <div className="relative rounded-2xl border border-white/[0.08] p-6 mb-8 backdrop-blur-2xl bg-white/[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-fuchsia-500/[0.03] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

            <h3 className="relative text-lg font-semibold mb-5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('add')}</h3>

            <div className="relative space-y-4">
              <div>
                <label className="text-white/35 text-xs mb-1.5 block font-medium uppercase tracking-wider">{t('name')}</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all text-white placeholder:text-white/15 backdrop-blur-sm"
                  placeholder="e.g., Guitar, Cooking, Python..."
                />
              </div>

              <div>
                <label className="text-white/35 text-xs mb-1.5 block font-medium uppercase tracking-wider">{t('features')}</label>
                <textarea
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none text-white placeholder:text-white/15 backdrop-blur-sm"
                  rows={3}
                  placeholder={t('skill experience')}
                />
              </div>

              <div>
                <label className="text-white/35 text-xs mb-2 block font-medium uppercase tracking-wider">{t('mood')}</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSkillLevel(level.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                        skillLevel === level.id
                          ? `bg-gradient-to-r ${level.bg} border border-white/[0.1] ${level.color} shadow-lg ${level.glow}`
                          : 'border border-white/[0.06] hover:bg-white/[0.03] hover:border-white/[0.1] text-white/40'
                      }`}
                    >
                      {level.icon} {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex gap-3 mt-6">
              <button onClick={addSkill} className="group relative px-6 py-2.5 rounded-xl overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-lg opacity-30" />
                <span className="relative z-10 font-medium">{t('save')}</span>
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-white/[0.06] rounded-xl hover:bg-white/[0.03] hover:border-white/[0.1] transition-all backdrop-blur-sm">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Skills List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <div className="text-white/25 text-sm">{t('loading')}</div>
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 drop-shadow-lg">🎯</div>
            <p className="text-white/30 text-lg font-medium">{t('no data')}</p>
            <p className="text-white/15 text-sm mt-2">Add your skills and let AI create personalized lessons</p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => {
              const progress = getProgress(skill.lessons)
              const isExpanded = expandedSkill === skill.id
              const levelInfo = LEVELS.find(l => l.id === skill.level) || LEVELS[0]

              return (
                <div key={skill.id} className="group relative rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all duration-500 backdrop-blur-xl bg-white/[0.015]">
                  {/* Top glow line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div
                    className="relative p-5 cursor-pointer"
                    onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{skill.skill_name}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm ${levelInfo.color} font-medium`}>
                            {levelInfo.icon} {levelInfo.label}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="text-white/30 text-sm">{skill.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSkill(skill.id) }}
                          className="text-white/15 hover:text-red-400 hover:bg-red-500/10 rounded-lg p-1.5 transition-all duration-300"
                        >
                          ✕
                        </button>
                        <svg className={`w-5 h-5 text-white/20 transition-all duration-300 ${isExpanded ? 'rotate-180 text-violet-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {skill.lessons && skill.lessons.length > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-white/25 mb-1.5">
                          <span>{skill.lessons.filter(l => l.completed).length}/{skill.lessons.length} lessons</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full transition-all duration-700 shadow-lg shadow-violet-500/20"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
                      {!skill.lessons || skill.lessons.length === 0 ? (
                        <button
                          onClick={() => generateLessons(skill)}
                          disabled={generatingLessons === skill.id}
                          className="group relative w-full py-3.5 rounded-xl transition-all duration-300 overflow-hidden disabled:opacity-50"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 rounded-xl" />
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                          {generatingLessons === skill.id ? (
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white/70">
                              <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                              {t('loading')}
                            </span>
                          ) : (
                            <span className="relative z-10 text-white/70 group-hover:text-white/90 transition-colors">✨ Generate AI Lessons</span>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {skill.lessons.map((lesson, i) => (
                            <div
                              key={lesson.id}
                              className={`flex items-start gap-3 p-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                                lesson.completed
                                  ? 'bg-emerald-500/[0.05] border border-emerald-500/10'
                                  : 'bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]'
                              }`}
                            >
                              <button
                                onClick={() => toggleLesson(skill.id, lesson.id)}
                                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                  lesson.completed
                                    ? 'border-emerald-400 bg-emerald-400 shadow-lg shadow-emerald-500/30'
                                    : 'border-white/15 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/20'
                                }`}
                              >
                                {lesson.completed && (
                                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium text-sm transition-all duration-300 ${lesson.completed ? 'text-white/20 line-through' : 'text-white/80'}`}>
                                  {i + 1}. {lesson.title}
                                </p>
                                <p className="text-white/25 text-xs mt-1">{lesson.content}</p>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => generateLessons(skill)}
                            disabled={generatingLessons === skill.id}
                            className="w-full py-2.5 text-sm text-white/20 hover:text-violet-400 transition-all duration-300 mt-2"
                          >
                            {generatingLessons === skill.id ? t('loading') : '🔄 Regenerate Lessons'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
