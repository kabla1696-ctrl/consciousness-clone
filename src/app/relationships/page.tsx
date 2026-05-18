'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Person {
  id: string
  name: string
  nickname: string
  relation: string
  emoji: string
  quality: number
  feelings: string
  meaning: string
  insideJokes: string
  howTheyTalk: string
  whatToTell: string
  privacyLevel: string
  accessAfterDeath: boolean
  accessLevel: string
  verificationMethod: string
  secretQuestion: string
  secretAnswer: string
}

const RELATIONS = ['Mother', 'Father', 'Brother', 'Sister', 'Spouse', 'Child', 'Best Friend', 'Friend', 'Colleague', 'Teacher', 'Uncle', 'Aunt', 'Cousin', 'Neighbor', 'Ex', 'Enemy', 'Other']
const EMOJIS: Record<string, string> = { Mother: '👩', Father: '👨', Brother: '👦', Sister: '👧', Spouse: '💑', Child: '👶', 'Best Friend': '🫂', Friend: '👋', Colleague: '💼', Teacher: '📚', Uncle: '👴', Aunt: '👵', Cousin: '🧑', Neighbor: '🏠', Ex: '💔', Enemy: '😠', Other: '👤' }

export default function Relationships() {
  const t = useT()
  const [people, setPeople] = useState<Person[]>([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'people' | 'legacy' | 'behavior'>('people')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Person>>({ relation: 'Friend', quality: 7, privacyLevel: 'MOST', accessAfterDeath: false, accessLevel: 'CHAT_ONLY', verificationMethod: 'SECRET_QUESTION' })
  const [cloneSettings, setCloneSettings] = useState({ language: 'banglish', slang: 2, emoji: 2, typing: 'casual', humor: 6, warmth: 8, detail: 6, emotion: 7, directness: 5, catchphrases: ['Ami toh aage e bollam', 'Eta ki hocche!'], memoryRefs: true, quirks: ['Always says "listen..."', 'Goes on tangents about cricket'] })
  const [legacySettings, setLegacySettings] = useState({ inactivity: 90, legacyMessage: '', emergencyContacts: [{ name: '', email: '', relation: '' }] })

  useEffect(() => {
    const saved = localStorage.getItem('cc_relationships')
    if (saved) setPeople(JSON.parse(saved))
    const cs = localStorage.getItem('cc_clone_behavior')
    if (cs) setCloneSettings(JSON.parse(cs))
    const ls = localStorage.getItem('cc_legacy_settings')
    if (ls) setLegacySettings(JSON.parse(ls))
  }, [])

  const save = (p: Person[]) => { setPeople(p); localStorage.setItem('cc_relationships', JSON.stringify(p)) }

  const addPerson = () => {
    const p: Person = { id: Date.now().toString(), name: form.name || '', nickname: form.nickname || '', relation: form.relation || 'Friend', emoji: EMOJIS[form.relation || 'Other'] || '👤', quality: form.quality || 7, feelings: form.feelings || '', meaning: form.meaning || '', insideJokes: form.insideJokes || '', howTheyTalk: form.howTheyTalk || '', whatToTell: form.whatToTell || '', privacyLevel: form.privacyLevel || 'MOST', accessAfterDeath: form.accessAfterDeath || false, accessLevel: form.accessLevel || 'CHAT_ONLY', verificationMethod: form.verificationMethod || 'SECRET_QUESTION', secretQuestion: form.secretQuestion || '', secretAnswer: form.secretAnswer || '' }
    if (editingId) { save(people.map(x => x.id === editingId ? { ...p, id: editingId } : x)); setEditingId(null) } else { save([...people, p]) }
    setShowForm(false); setForm({ relation: 'Friend', quality: 7, privacyLevel: 'MOST', accessAfterDeath: false, accessLevel: 'CHAT_ONLY', verificationMethod: 'SECRET_QUESTION' })
  }

  const deletePerson = (id: string) => save(people.filter(x => x.id !== id))
  const editPerson = (p: Person) => { setForm(p); setEditingId(p.id); setShowForm(true) }

  const qualityColor = (q: number) => q <= 3 ? 'from-red-500 to-orange-500' : q <= 6 ? 'from-yellow-500 to-amber-500' : 'from-emerald-500 to-green-500'
  const qualityLabel = (q: number) => q <= 3 ? 'Tense' : q <= 6 ? 'Neutral' : 'Close'

  const getPeopleByRelation = (rel: string) => people.filter(p => p.relation === rel)

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(8)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1 + 'px', height: Math.random() * 4 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: ['rgba(139,92,246,0.4)', 'rgba(236,72,153,0.3)', 'rgba(59,130,246,0.3)'][i % 3], animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">{t('relationships & legacy')}</span>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="sticky top-[56px] z-40 backdrop-blur-xl border-b border-white/[0.04]" style={{ background: 'rgba(5,5,16,0.9)' }}>
        <div className="flex px-2">
          {[
            { id: 'people' as const, icon: '👥', label: t('my people') },
            { id: 'legacy' as const, icon: '🔑', label: t('legacy') },
            { id: 'behavior' as const, icon: '🧠', label: t('clone behavior') },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-2 text-xs font-medium transition-all tap-feedback ${activeTab === tab.id ? 'text-violet-400 border-b-2 border-violet-400' : 'text-white/40'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 scroll-container relative z-10">
        {/* TAB: My People */}
        {activeTab === 'people' && <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: t('total'), value: people.length, color: 'text-violet-400' },
              { label: t('close'), value: people.filter(p => p.quality >= 7).length, color: 'text-emerald-400' },
              { label: t('heirs'), value: people.filter(p => p.accessAfterDeath).length, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-white/30 text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Presets */}
          {people.length === 0 && (
            <div className="mb-6">
              <p className="text-white/40 text-sm mb-3">{t('quick add the important people')}</p>
              <div className="flex flex-wrap gap-2">
                {['Mother', 'Father', 'Best Friend', 'Spouse'].map(r => (
                  <button key={r} onClick={() => { setForm({ ...form, relation: r }); setShowForm(true) }} className="px-3 py-2 rounded-xl border border-white/[0.06] text-sm backdrop-blur-xl tap-feedback hover:border-violet-500/30 transition" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {EMOJIS[r]} {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People List */}
          <div className="space-y-3 mb-6">
            {people.map(p => (
              <div key={p.id} className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(139,92,246,0.1)' }}>{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{p.name}</span>
                      {p.nickname && <span className="text-white/30 text-xs">({p.nickname})</span>}
                    </div>
                    <div className="text-white/40 text-xs">{p.relation}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                        <div className={`h-full rounded-full bg-gradient-to-r ${qualityColor(p.quality)}`} style={{ width: `${p.quality * 10}%` }} />
                      </div>
                      <span className="text-[10px] text-white/30">{qualityLabel(p.quality)}</span>
                    </div>
                    {p.feelings && <p className="text-white/40 text-xs mt-2 line-clamp-2">{p.feelings}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => editPerson(p)} className="text-white/20 text-xs tap-feedback">✏️</button>
                    <button onClick={() => deletePerson(p.id)} className="text-white/20 text-xs tap-feedback">🗑️</button>
                  </div>
                </div>
                {p.accessAfterDeath && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
                    <span className="text-amber-400/60 text-[10px]">🔑 Legacy Access: {p.accessLevel}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Button */}
          <button onClick={() => { setForm({ relation: 'Friend', quality: 7, privacyLevel: 'MOST', accessAfterDeath: false, accessLevel: 'CHAT_ONLY', verificationMethod: 'SECRET_QUESTION' }); setEditingId(null); setShowForm(true) }} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm tap-feedback" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
            {t('add')} {t('person')}
          </button>
        </>}

        {/* TAB: Legacy */}
        {activeTab === 'legacy' && <>
          <div className="rounded-2xl border border-amber-500/20 p-5 mb-6 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(239,68,68,0.03))' }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🔑</div>
              <h2 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">{t('legacy access')}</h2>
              <p className="text-white/30 text-xs mt-1">{t('configure who accesses your clone')}</p>
            </div>

            {/* Inactivity Timer */}
            <div className="mb-4">
              <label className="text-white/60 text-xs mb-2 block">{t('inactivity timer')}</label>
              <div className="grid grid-cols-5 gap-2">
                {[30, 60, 90, 180, 365].map(d => (
                  <button key={d} onClick={() => setLegacySettings({ ...legacySettings, inactivity: d })} className={`py-2 rounded-lg text-xs font-medium tap-feedback transition ${legacySettings.inactivity === d ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Legacy Message */}
            <div className="mb-4">
              <label className="text-white/60 text-xs mb-2 block">{t('final message to all heirs')}</label>
              <textarea value={legacySettings.legacyMessage} onChange={e => setLegacySettings({ ...legacySettings, legacyMessage: e.target.value })} placeholder={t('legacy message placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-24 focus:outline-none focus:border-amber-500/40" />
            </div>

            {/* Heirs List */}
            <div>
              <label className="text-white/60 text-xs mb-2 block">{t('designated heirs')}</label>
              {people.filter(p => p.accessAfterDeath).length === 0 ? (
                <p className="text-white/20 text-xs text-center py-4">{t('no heirs set')}</p>
              ) : (
                <div className="space-y-2">
                  {people.filter(p => p.accessAfterDeath).map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-xl">{p.emoji}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{p.name}</span>
                        <div className="text-white/30 text-[10px]">{p.relation} • {p.accessLevel}</div>
                      </div>
                      <span className="text-amber-400/60 text-[10px]">🔑</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={() => { localStorage.setItem('cc_legacy_settings', JSON.stringify(legacySettings)); alert(t('legacy settings saved')) }} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm tap-feedback" style={{ boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
            💾 {t('save legacy settings')}
          </button>
        </>}

        {/* TAB: Clone Behavior */}
        {activeTab === 'behavior' && <>
          <div className="space-y-4 mb-6">
            {/* Language */}
            <div className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">🗣️ {t('language style')}</h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['banglish', 'english', 'bangla'].map(l => (
                  <button key={l} onClick={() => setCloneSettings({ ...cloneSettings, language: l })} className={`py-2 rounded-lg text-xs font-medium tap-feedback transition ${cloneSettings.language === l ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border capitalize`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Personality Sliders */}
            <div className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">🎭 {t('personality')}</h3>
              {[
                { key: 'humor', label: 'Humor', left: 'Serious', right: 'Funny', icon: '😄' },
                { key: 'warmth', label: 'Warmth', left: 'Cold', right: 'Loving', icon: '🤗' },
                { key: 'detail', label: 'Detail', left: 'Brief', right: 'Storyteller', icon: '📖' },
                { key: 'emotion', label: 'Emotion', left: 'Stable', right: 'Expressive', icon: '💜' },
                { key: 'directness', label: 'Directness', left: 'Diplomatic', right: 'Blunt', icon: '🎯' },
              ].map(s => (
                <div key={s.key} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 text-xs">{s.icon} {s.label}</span>
                    <span className="text-violet-400 text-xs font-medium">{cloneSettings[s.key as keyof typeof cloneSettings] as number}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={cloneSettings[s.key as keyof typeof cloneSettings] as number} onChange={e => setCloneSettings({ ...cloneSettings, [s.key]: parseInt(e.target.value) })} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(90deg, #8b5cf6 ${((cloneSettings[s.key as keyof typeof cloneSettings] as number) - 1) * 11.1}%, rgba(255,255,255,0.05) ${((cloneSettings[s.key as keyof typeof cloneSettings] as number) - 1) * 11.1}%)` }} />
                  <div className="flex justify-between mt-0.5">
                    <span className="text-white/20 text-[10px]">{s.left}</span>
                    <span className="text-white/20 text-[10px]">{s.right}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Catchphrases */}
            <div className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">💬 {t('catchphrases')}</h3>
              <div className="space-y-2">
                {cloneSettings.catchphrases.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">&quot;</span>
                    <input value={c} onChange={e => { const cp = [...cloneSettings.catchphrases]; cp[i] = e.target.value; setCloneSettings({ ...cloneSettings, catchphrases: cp }) }} className="flex-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-xs focus:outline-none focus:border-violet-500/40" />
                    <button onClick={() => setCloneSettings({ ...cloneSettings, catchphrases: cloneSettings.catchphrases.filter((_, j) => j !== i) })} className="text-white/20 text-xs tap-feedback">✕</button>
                  </div>
                ))}
                <button onClick={() => setCloneSettings({ ...cloneSettings, catchphrases: [...cloneSettings.catchphrases, ''] })} className="text-violet-400 text-xs tap-feedback">+ Add catchphrase</button>
              </div>
            </div>

            {/* Quirks */}
            <div className="rounded-xl border border-white/[0.06] p-4 backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-sm font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">✨ {t('quirks & habits')}</h3>
              <div className="space-y-2">
                {cloneSettings.quirks.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={q} onChange={e => { const qr = [...cloneSettings.quirks]; qr[i] = e.target.value; setCloneSettings({ ...cloneSettings, quirks: qr }) }} className="flex-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-xs focus:outline-none focus:border-violet-500/40" />
                    <button onClick={() => setCloneSettings({ ...cloneSettings, quirks: cloneSettings.quirks.filter((_, j) => j !== i) })} className="text-white/20 text-xs tap-feedback">✕</button>
                  </div>
                ))}
                <button onClick={() => setCloneSettings({ ...cloneSettings, quirks: [...cloneSettings.quirks, ''] })} className="text-violet-400 text-xs tap-feedback">+ Add quirk</button>
              </div>
            </div>
          </div>

          <button onClick={() => { localStorage.setItem('cc_clone_behavior', JSON.stringify(cloneSettings)); alert(t('clone behavior saved')) }} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm tap-feedback" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
            💾 {t('save clone behavior')}
          </button>
        </>}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg max-h-[85vh] rounded-t-2xl border-t border-white/[0.06] overflow-y-auto" style={{ background: 'linear-gradient(135deg, #0a0a1e, #050510)' }}>
            <div className="p-4 border-b border-white/[0.04] flex justify-between items-center sticky top-0" style={{ background: 'rgba(10,10,30,0.95)' }}>
              <h3 className="font-semibold">{editingId ? t('edit') : t('add')} {t('person')}</h3>
              <button onClick={() => setShowForm(false)} className="text-white/40 tap-feedback">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('name')} *</label>
                <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('full name')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-xs mb-1 block">{t('nickname')}</label>
                  <input value={form.nickname || ''} onChange={e => setForm({ ...form, nickname: e.target.value })} placeholder={t('nickname placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1 block">{t('relation')} *</label>
                  <select value={form.relation} onChange={e => setForm({ ...form, relation: e.target.value })} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-violet-500/40">
                    {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('relationship quality')}: {form.quality}/10</label>
                <input type="range" min="1" max="10" value={form.quality || 7} onChange={e => setForm({ ...form, quality: parseInt(e.target.value) })} className="w-full" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('how you feel about them')}</label>
                <textarea value={form.feelings || ''} onChange={e => setForm({ ...form, feelings: e.target.value })} placeholder={t('feelings placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-20 focus:outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('what they mean to you')}</label>
                <textarea value={form.meaning || ''} onChange={e => setForm({ ...form, meaning: e.target.value })} placeholder={t('meaning placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-16 focus:outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('inside jokes / memories')}</label>
                <textarea value={form.insideJokes || ''} onChange={e => setForm({ ...form, insideJokes: e.target.value })} placeholder={t('inside jokes placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-16 focus:outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-1 block">{t('what to tell them')}</label>
                <textarea value={form.whatToTell || ''} onChange={e => setForm({ ...form, whatToTell: e.target.value })} placeholder={t('what to tell placeholder')} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm resize-none h-16 focus:outline-none focus:border-violet-500/40" />
              </div>
              <div>
                <label className="text-white/60 text-xs mb-2 block">{t('privacy level')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['EVERYTHING', 'MOST', 'SOME', 'MINIMAL'].map(l => (
                    <button key={l} onClick={() => setForm({ ...form, privacyLevel: l })} className={`py-2 rounded-lg text-[10px] font-medium tap-feedback ${form.privacyLevel === l ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-white/60 text-xs">{t('legacy access after death')}</label>
                <button onClick={() => setForm({ ...form, accessAfterDeath: !form.accessAfterDeath })} className={`w-12 h-6 rounded-full transition tap-feedback ${form.accessAfterDeath ? 'bg-amber-500' : 'bg-white/[0.1]'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition ${form.accessAfterDeath ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {form.accessAfterDeath && (
                <div className="space-y-3 pl-4 border-l-2 border-amber-500/20">
                  <div>
                    <label className="text-white/60 text-xs mb-1 block">{t('access level')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['FULL', 'PARTIAL', 'CHAT_ONLY'].map(l => (
                        <button key={l} onClick={() => setForm({ ...form, accessLevel: l })} className={`py-2 rounded-lg text-[10px] font-medium tap-feedback ${form.accessLevel === l ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-white/[0.03] border-white/[0.06] text-white/40'} border`}>
                          {l.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <button onClick={addPerson} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-sm tap-feedback" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
                {editingId ? `💾 ${t('save')}` : `+ ${t('add')} ${t('person')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
      `}</style>
    </main>
  )
}
