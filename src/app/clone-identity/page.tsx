'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface PersonProfile {
  id: string
  name: string
  relation: string
  recognitionMethod: string
  textSamples: string[]
  knowledgeQuestions: { question: string; answer: string }[]
  voiceDescription: string
  tone: string
  detailLevel: string
  language: string
  visibleMemories: string[]
  privacyLevel: string
  createdAt: string
}

const RELATIONS = ['Mother', 'Father', 'Sibling', 'Spouse', 'Child', 'Best Friend', 'Colleague', 'Relative', 'Other']
const TONES = ['formal', 'casual', 'loving', 'strict', 'playful', 'respectful']
const DETAIL_LEVELS = ['brief', 'detailed', 'storyteller']
const LANGUAGES = ['Banglish', 'English', 'Bangla', 'Auto-detect']
const PRIVACY_LEVELS = ['open', 'moderate', 'guarded', 'minimal']

const STORAGE_KEY = 'consciousness-clone-identity'

export default function CloneIdentityPage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<PersonProfile[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [testMode, setTestMode] = useState<string | null>(null)
  const [testInput, setTestInput] = useState('')
  const [testResult, setTestResult] = useState('')

  const [name, setName] = useState('')
  const [relation, setRelation] = useState('Mother')
  const [recognitionMethod, setRecognitionMethod] = useState('text_pattern')
  const [textSamples, setTextSamples] = useState('')
  const [knowledgeQ, setKnowledgeQ] = useState('')
  const [knowledgeA, setKnowledgeA] = useState('')
  const [voiceDesc, setVoiceDesc] = useState('')
  const [tone, setTone] = useState('casual')
  const [detailLevel, setDetailLevel] = useState('detailed')
  const [language, setLanguage] = useState('Auto-detect')
  const [privacyLevel, setPrivacyLevel] = useState('moderate')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setProfiles(JSON.parse(stored))
      } catch {}
      setLoading(false)
    }
    init()
  }, [])

  const saveProfiles = (p: PersonProfile[]) => {
    setProfiles(p)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  }

  const addProfile = () => {
    if (!name.trim()) return
    const samples = textSamples.split('\n').filter(s => s.trim())
    const questions = knowledgeQ && knowledgeA ? [{ question: knowledgeQ, answer: knowledgeA }] : []
    const profile: PersonProfile = {
      id: editingId || Date.now().toString(),
      name: name.trim(), relation, recognitionMethod,
      textSamples: samples, knowledgeQuestions: questions,
      voiceDescription: voiceDesc, tone, detailLevel, language,
      visibleMemories: [], privacyLevel,
      createdAt: new Date().toISOString(),
    }
    const updated = editingId ? profiles.map(p => p.id === editingId ? profile : p) : [...profiles, profile]
    saveProfiles(updated)
    resetForm()
  }

  const deleteProfile = (id: string) => {
    if (!confirm('Remove this person profile?')) return
    saveProfiles(profiles.filter(p => p.id !== id))
  }

  const resetForm = () => {
    setShowAdd(false); setEditingId(null)
    setName(''); setRelation('Mother'); setRecognitionMethod('text_pattern')
    setTextSamples(''); setKnowledgeQ(''); setKnowledgeA(''); setVoiceDesc('')
    setTone('casual'); setDetailLevel('detailed'); setLanguage('Auto-detect'); setPrivacyLevel('moderate')
  }

  const runTest = async (profile: PersonProfile) => {
    if (!testInput.trim()) return
    setTestResult('Analyzing...')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `A message was received: "${testInput}". Based on these text samples from ${profile.name} (${profile.relation}): ${profile.textSamples.join(' | ')}. Rate confidence 0-100% that this message is from ${profile.name}. Reply in format: "Confidence: X%. Reason: brief explanation."` }],
          systemPrompt: 'You are a text pattern analyzer. Compare writing styles and give confidence scores.'
        })
      })
      const data = await res.json()
      setTestResult(data.choices?.[0]?.message?.content || 'Could not analyze.')
    } catch { setTestResult('Error analyzing text.') }
  }

  if (loading) {
    return (
      <main className="page-transition min-h-screen flex items-center justify-center bg-[#030108] relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[100px] animate-pulse" />
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="w-10 h-10 border-2 border-cyan-500/60 border-t-transparent rounded-full animate-spin relative" />
        </div>
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24 bg-[#030108] relative">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-cyan-600/10 blur-[110px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] rounded-full bg-teal-500/6 blur-[80px] animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <header className="sticky top-0 z-50 bg-[#030108]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-white/[0.1] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">🧠 {t('clone identity')}</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Intro */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/10 rounded-xl blur-lg opacity-60" />
          <div className="relative bg-cyan-500/[0.04] backdrop-blur-2xl border border-cyan-500/[0.08] rounded-xl p-4 shadow-lg shadow-black/20">
            <h3 className="text-sm font-medium text-cyan-400 mb-1.5">🧠 {t('who talks')}</h3>
            <p className="text-xs text-white/35 leading-relaxed">{t('recognizes')}</p>
          </div>
        </div>

        <button onClick={() => { resetForm(); setShowAdd(!showAdd) }} className="relative w-full py-3 rounded-xl font-medium overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_100%] group-hover:animate-[shimmer_2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-xl" />
          <span className="relative z-10 text-white">{showAdd ? `✕ ${t('cancel')}` : `＋ ${t('add person')}`}</span>
        </button>

        {/* Add Form */}
        {showAdd && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-teal-500/15 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-white/[0.02] backdrop-blur-2xl rounded-2xl border border-cyan-500/[0.08] p-5 space-y-4 shadow-xl shadow-black/20">
              <h3 className="text-sm font-medium text-cyan-400">{editingId ? t('edit') + ' Profile' : t('add person')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name *" className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 focus:shadow-lg focus:shadow-cyan-500/10 transition-all duration-300" />
                <select value={relation} onChange={e => setRelation(e.target.value)} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 appearance-none">
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={recognitionMethod} onChange={e => setRecognitionMethod(e.target.value)} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 appearance-none">
                  <option value="text_pattern">Text Pattern</option>
                  <option value="knowledge">Knowledge Check</option>
                  <option value="voice">Voice Description</option>
                </select>
              </div>

              {recognitionMethod === 'text_pattern' && (
                <div>
                  <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block pl-1">{t('face')}</label>
                  <textarea value={textSamples} onChange={e => setTextSamples(e.target.value)} placeholder="Hey what's up!\nAmi bhalo achi\nLet's grab lunch tmrw" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm h-24 resize-none placeholder:text-white/15 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300" />
                </div>
              )}

              {recognitionMethod === 'knowledge' && (
                <div className="space-y-2">
                  <input value={knowledgeQ} onChange={e => setKnowledgeQ(e.target.value)} placeholder="Question only they'd know" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300" />
                  <input value={knowledgeA} onChange={e => setKnowledgeA(e.target.value)} placeholder="Answer" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300" />
                </div>
              )}

              {recognitionMethod === 'voice' && (
                <textarea value={voiceDesc} onChange={e => setVoiceDesc(e.target.value)} placeholder="Describe their voice: accent, pitch, speaking style..." className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm h-16 resize-none placeholder:text-white/15 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300" />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block pl-1">{t('tone')}</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {TONES.map(t => (
                      <button key={t} onClick={() => setTone(t)} className={`px-2.5 py-1 rounded-full text-[10px] transition-all duration-300 ${tone === t ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-white/[0.03] text-white/25 border border-white/[0.04] hover:border-white/[0.08] hover:text-white/40'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block pl-1">{t('language')}</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 appearance-none">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block pl-1">{t('level')}</label>
                <div className="flex gap-2">
                  {DETAIL_LEVELS.map(d => (
                    <button key={d} onClick={() => setDetailLevel(d)} className={`flex-1 py-2 rounded-lg text-xs transition-all duration-300 ${detailLevel === d ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-white/[0.03] text-white/25 border border-white/[0.04] hover:border-white/[0.08] hover:text-white/40'}`}>{d}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/20 uppercase tracking-widest font-medium mb-1.5 block pl-1">{t('privacy level')}</label>
                <select value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300 appearance-none">
                  {PRIVACY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <button onClick={addProfile} disabled={!name.trim()} className="relative w-full py-2.5 rounded-xl font-medium text-sm disabled:opacity-30 overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-xl" />
                <span className="relative z-10 text-white">{editingId ? `💾 ${t('save')}` : `🧠 ${t('save')}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 text-5xl flex items-center justify-center blur-lg opacity-20 animate-pulse">🧠</div>
              <div className="relative text-5xl">🧠</div>
            </div>
            <p className="text-white/20 font-medium">{t('no data')}</p>
            <p className="text-xs text-white/10 mt-1">{t('recognizes')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map(profile => (
              <div key={profile.id} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl border border-white/[0.05] p-4 hover:border-cyan-500/[0.12] transition-all duration-300 shadow-lg shadow-black/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white/90 font-medium">{profile.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/25 mt-0.5">
                        <span>{profile.relation}</span>
                        <span className="text-white/10">•</span>
                        <span>{profile.tone}</span>
                        <span className="text-white/10">•</span>
                        <span>{profile.language}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowAdd(true); setEditingId(profile.id); setName(profile.name); setRelation(profile.relation); setRecognitionMethod(profile.recognitionMethod); setTextSamples(profile.textSamples.join('\n')); setTone(profile.tone); setDetailLevel(profile.detailLevel); setLanguage(profile.language); setPrivacyLevel(profile.privacyLevel) }} className="text-white/15 hover:text-white/50 text-xs transition-colors duration-300">✏️</button>
                      <button onClick={() => deleteProfile(profile.id)} className="text-white/15 hover:text-red-400 text-xs transition-colors duration-300">✕</button>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/[0.08] text-cyan-400/80 border border-cyan-500/[0.12]">{profile.recognitionMethod}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">{profile.detailLevel}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.03] text-white/20 border border-white/[0.04]">{profile.privacyLevel}</span>
                  </div>

                  {/* Test Recognition */}
                  <div className="mt-3">
                    <button onClick={() => setTestMode(testMode === profile.id ? null : profile.id)} className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors duration-300">
                      🧪 Test Recognition
                    </button>
                    {testMode === profile.id && (
                      <div className="mt-2.5 space-y-2">
                        <div className="flex gap-2">
                          <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Type a sample message..." className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-white text-xs placeholder:text-white/15 focus:outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-300" />
                          <button onClick={() => runTest(profile)} className="relative px-4 py-2 rounded-lg text-xs overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600" />
                            <span className="relative z-10 text-white">{t('search')}</span>
                          </button>
                        </div>
                        {testResult && <p className="text-xs text-white/40 bg-white/[0.02] backdrop-blur-sm border border-white/[0.04] rounded-lg p-2.5 leading-relaxed">{testResult}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
