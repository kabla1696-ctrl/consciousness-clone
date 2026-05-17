'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
      <main className="page-transition min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen pb-24">
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-xl border-b border-cyan-500/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">🧠 Clone Identity</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Intro */}
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-4">
          <h3 className="text-sm font-medium text-cyan-400 mb-1">🧠 Who&apos;s Talking?</h3>
          <p className="text-xs text-white/40">Teach your clone to recognize different people and respond accordingly. Mom gets warmth, friends get slang, strangers get guarded responses.</p>
        </div>

        <button onClick={() => { resetForm(); setShowAdd(!showAdd) }} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium">
          {showAdd ? '✕ Cancel' : '＋ Add Person Profile'}
        </button>

        {/* Add Form */}
        {showAdd && (
          <div className="bg-white/5 rounded-xl border border-cyan-500/10 p-4 space-y-4">
            <h3 className="text-sm font-medium text-cyan-400">{editingId ? 'Edit Profile' : 'New Person'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name *" className="col-span-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
              <select value={relation} onChange={e => setRelation(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={recognitionMethod} onChange={e => setRecognitionMethod(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                <option value="text_pattern">Text Pattern</option>
                <option value="knowledge">Knowledge Check</option>
                <option value="voice">Voice Description</option>
              </select>
            </div>

            {recognitionMethod === 'text_pattern' && (
              <div>
                <label className="text-xs text-white/30 mb-1 block">Sample messages (one per line)</label>
                <textarea value={textSamples} onChange={e => setTextSamples(e.target.value)} placeholder="Hey what's up!\nAmi bhalo achi\nLet's grab lunch tmrw" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm h-24 resize-none" />
              </div>
            )}

            {recognitionMethod === 'knowledge' && (
              <div className="space-y-2">
                <input value={knowledgeQ} onChange={e => setKnowledgeQ(e.target.value)} placeholder="Question only they'd know" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
                <input value={knowledgeA} onChange={e => setKnowledgeA(e.target.value)} placeholder="Answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm" />
              </div>
            )}

            {recognitionMethod === 'voice' && (
              <textarea value={voiceDesc} onChange={e => setVoiceDesc(e.target.value)} placeholder="Describe their voice: accent, pitch, speaking style..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm h-16 resize-none" />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/30 mb-1 block">Tone</label>
                <div className="flex gap-1 flex-wrap">
                  {TONES.map(t => (
                    <button key={t} onClick={() => setTone(t)} className={`px-2 py-1 rounded-full text-[10px] ${tone === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/30 mb-1 block">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 mb-1 block">Detail Level</label>
              <div className="flex gap-2">
                {DETAIL_LEVELS.map(d => (
                  <button key={d} onClick={() => setDetailLevel(d)} className={`flex-1 py-1.5 rounded-lg text-xs ${detailLevel === d ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/30 border border-white/5'}`}>{d}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/30 mb-1 block">Privacy Level</label>
              <select value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                {PRIVACY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <button onClick={addProfile} disabled={!name.trim()} className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-medium disabled:opacity-30">
              {editingId ? '💾 Update Profile' : '🧠 Save Profile'}
            </button>
          </div>
        )}

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-white/20">
            <div className="text-5xl mb-3">🧠</div>
            <p>No profiles yet</p>
            <p className="text-xs mt-1">Teach your clone who&apos;s who</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map(profile => (
              <div key={profile.id} className="bg-white/5 rounded-xl border border-cyan-500/10 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{profile.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/30 mt-0.5">
                      <span>{profile.relation}</span>
                      <span>•</span>
                      <span>{profile.tone}</span>
                      <span>•</span>
                      <span>{profile.language}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowAdd(true); setEditingId(profile.id); setName(profile.name); setRelation(profile.relation); setRecognitionMethod(profile.recognitionMethod); setTextSamples(profile.textSamples.join('\n')); setTone(profile.tone); setDetailLevel(profile.detailLevel); setLanguage(profile.language); setPrivacyLevel(profile.privacyLevel) }} className="text-white/20 hover:text-white/50 text-xs">✏️</button>
                    <button onClick={() => deleteProfile(profile.id)} className="text-white/20 hover:text-red-400 text-xs">✕</button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">{profile.recognitionMethod}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/20">{profile.detailLevel}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/20">{profile.privacyLevel}</span>
                </div>

                {/* Test Recognition */}
                <div className="mt-3">
                  <button onClick={() => setTestMode(testMode === profile.id ? null : profile.id)} className="text-xs text-cyan-400 hover:text-cyan-300">
                    🧪 Test Recognition
                  </button>
                  {testMode === profile.id && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <input value={testInput} onChange={e => setTestInput(e.target.value)} placeholder="Type a sample message..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs" />
                        <button onClick={() => runTest(profile)} className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs">Analyze</button>
                      </div>
                      {testResult && <p className="text-xs text-white/50 bg-white/5 rounded-lg p-2">{testResult}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
