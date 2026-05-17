'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  { id: 'beginner', label: 'Beginner', icon: '🌱', color: 'text-emerald-400' },
  { id: 'intermediate', label: 'Intermediate', icon: '📈', color: 'text-blue-400' },
  { id: 'advanced', label: 'Advanced', icon: '🔥', color: 'text-orange-400' },
  { id: 'expert', label: 'Expert', icon: '👑', color: 'text-violet-400' },
]

export default function Skills() {
  const [user, setUser] = useState<any>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [generatingLessons, setGeneratingLessons] = useState<string | null>(null)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  // Add skill form
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
            content: `Generate a structured set of 5-8 progressive lessons for someone learning "${skill.skill_name}" at ${skill.level} level. Context: ${skill.description || 'No additional context provided.'}

Return ONLY valid JSON array with this exact format:
[{"id":"1","title":"Lesson Title","content":"2-3 sentence description of what this lesson covers and key takeaways","completed":false}]

Make lessons progressively harder. Be practical and specific.`
          }],
          memories: '',
        }),
      })

      const data = await response.json()
      let lessons: Lesson[] = []

      try {
        // Extract JSON from response (handle markdown code blocks)
        const raw = data.reply || '[]'
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        lessons = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(raw)
      } catch {
        // Fallback: generate basic lessons
        lessons = [
          { id: '1', title: `Introduction to ${skill.skill_name}`, content: 'Learn the fundamental concepts and get started with the basics.', completed: false },
          { id: '2', title: 'Core Fundamentals', content: 'Build a solid foundation with essential techniques and principles.', completed: false },
          { id: '3', title: 'Practice & Application', content: 'Apply what you\'ve learned through hands-on exercises.', completed: false },
          { id: '4', title: 'Intermediate Techniques', content: 'Level up your skills with more advanced methods.', completed: false },
          { id: '5', title: 'Mastering the Craft', content: 'Refine your approach and develop your own style.', completed: false },
        ]
      }

      // Update skill in DB
      await supabase
        .from('skills')
        .update({ lessons })
        .eq('id', skill.id)

      // Update local state
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

    await supabase
      .from('skills')
      .update({ lessons: updatedLessons })
      .eq('id', skillId)

    setSkills(skills.map(s =>
      s.id === skillId ? { ...s, lessons: updatedLessons } : s
    ))
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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold">Skill Transfer</h1>
        </div>
      </header>

      <div className="pt-4 px-4 max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Skills 🎯</h1>
            <p className="text-white/30">{skills.length} skills • {completedLessons}/{totalLessons} lessons completed</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition"
          >
            + Add Skill
          </button>
        </div>

        {/* Stats */}
        {skills.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-violet-400">{skills.length}</div>
              <div className="text-white/30 text-sm">Skills</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-fuchsia-400">{totalLessons}</div>
              <div className="text-white/30 text-sm">Total Lessons</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-emerald-400">{completedLessons}</div>
              <div className="text-white/30 text-sm">Completed</div>
            </div>
            <div className="rounded-xl border border-white/[0.04] p-4 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-2xl font-bold text-amber-400">{skills.filter(s => s.lessons?.length > 0).length}</div>
              <div className="text-white/30 text-sm">With Lessons</div>
            </div>
          </div>
        )}

        {/* Add Skill Form */}
        {showAdd && (
          <div className="rounded-2xl border border-white/[0.06] p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-lg font-semibold mb-4">Add New Skill</h3>

            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-sm mb-1 block">Skill Name</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
                  placeholder="e.g., Guitar, Cooking, Python..."
                />
              </div>

              <div>
                <label className="text-white/40 text-sm mb-1 block">Description</label>
                <textarea
                  value={skillDesc}
                  onChange={(e) => setSkillDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20"
                  rows={3}
                  placeholder="Describe your experience with this skill..."
                />
              </div>

              <div>
                <label className="text-white/40 text-sm mb-2 block">Your Level</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSkillLevel(level.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${skillLevel === level.id ? 'bg-violet-500/30 border border-violet-500/50' : 'border border-white/[0.06] hover:bg-white/[0.02] text-white/50'}`}
                    >
                      {level.icon} {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={addSkill} className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 transition">
                Save Skill
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2.5 border border-white/[0.06] rounded-lg hover:bg-white/[0.02] transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Skills List */}
        {loading ? (
          <div className="text-center text-white/30 py-20">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-white/30 text-lg">No skills yet</p>
            <p className="text-white/20 text-sm mt-2">Add your skills and let AI create personalized lessons</p>
          </div>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => {
              const progress = getProgress(skill.lessons)
              const isExpanded = expandedSkill === skill.id
              const levelInfo = LEVELS.find(l => l.id === skill.level) || LEVELS[0]

              return (
                <div key={skill.id} className="rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition" style={{ background: 'rgba(255,255,255,0.01)' }}>
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{skill.skill_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-white/[0.04] ${levelInfo.color}`}>
                            {levelInfo.icon} {levelInfo.label}
                          </span>
                        </div>
                        {skill.description && (
                          <p className="text-white/40 text-sm">{skill.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSkill(skill.id) }}
                          className="text-white/20 hover:text-red-400 transition text-sm"
                        >
                          ✕
                        </button>
                        <svg className={`w-5 h-5 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {skill.lessons && skill.lessons.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/30 mb-1">
                          <span>{skill.lessons.filter(l => l.completed).length}/{skill.lessons.length} lessons</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
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
                          className="w-full py-3 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-xl hover:from-violet-500/30 hover:to-fuchsia-500/30 transition disabled:opacity-50"
                        >
                          {generatingLessons === skill.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                              Generating lessons...
                            </span>
                          ) : (
                            '✨ Generate AI Lessons'
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {skill.lessons.map((lesson, i) => (
                            <div
                              key={lesson.id}
                              className={`flex items-start gap-3 p-3 rounded-lg transition ${lesson.completed ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/[0.01] border border-white/[0.04]'}`}
                            >
                              <button
                                onClick={() => toggleLesson(skill.id, lesson.id)}
                                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${lesson.completed ? 'border-emerald-400 bg-emerald-400' : 'border-white/20 hover:border-violet-400'}`}
                              >
                                {lesson.completed && (
                                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium text-sm ${lesson.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                                  {i + 1}. {lesson.title}
                                </p>
                                <p className="text-white/30 text-xs mt-1">{lesson.content}</p>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => generateLessons(skill)}
                            disabled={generatingLessons === skill.id}
                            className="w-full py-2.5 text-sm text-white/30 hover:text-violet-400 transition mt-2"
                          >
                            {generatingLessons === skill.id ? 'Regenerating...' : '🔄 Regenerate Lessons'}
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
