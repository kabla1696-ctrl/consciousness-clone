'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface FamilyMember {
  id: string
  name: string
  relation: string
  birth_year: number | null
  bio: string | null
  photo_url: string | null
  memories: string[] | null
  created_at: string
}

const RELATIONS = [
  { id: 'self', label: 'Self', icon: '🧑', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'parent', label: 'Parent', icon: '👨', color: 'from-blue-500 to-cyan-500' },
  { id: 'mother', label: 'Mother', icon: '👩', color: 'from-pink-500 to-rose-500' },
  { id: 'father', label: 'Father', icon: '👨', color: 'from-blue-500 to-indigo-500' },
  { id: 'sibling', label: 'Sibling', icon: '👫', color: 'from-emerald-500 to-teal-500' },
  { id: 'spouse', label: 'Spouse', icon: '💑', color: 'from-rose-500 to-pink-500' },
  { id: 'child', label: 'Child', icon: '👶', color: 'from-amber-500 to-yellow-500' },
  { id: 'grandparent', label: 'Grandparent', icon: '👴', color: 'from-slate-400 to-gray-400' },
  { id: 'grandchild', label: 'Grandchild', icon: '🧒', color: 'from-lime-400 to-green-400' },
  { id: 'aunt_uncle', label: 'Aunt/Uncle', icon: '🧑‍🤝‍🧑', color: 'from-teal-500 to-cyan-500' },
  { id: 'cousin', label: 'Cousin', icon: '👯', color: 'from-purple-500 to-violet-500' },
  { id: 'other', label: 'Other', icon: '🌟', color: 'from-gray-400 to-slate-400' },
]

const TREE_GROUPS = [
  { id: 'grandparents', label: 'Grandparents', relations: ['grandparent'] },
  { id: 'parents', label: 'Parents', relations: ['parent', 'mother', 'father'] },
  { id: 'self_group', label: 'Me & Siblings', relations: ['self', 'sibling', 'spouse'] },
  { id: 'children', label: 'Children', relations: ['child', 'grandchild'] },
  { id: 'extended', label: 'Extended', relations: ['aunt_uncle', 'cousin', 'other'] },
]

function getGroup(relation: string) {
  for (const group of TREE_GROUPS) {
    if (group.relations.includes(relation)) return group.id
  }
  return 'extended'
}

function getRelInfo(relation: string) {
  return RELATIONS.find(r => r.id === relation) || RELATIONS[RELATIONS.length - 1]
}

export default function FamilyTreePage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [newMemory, setNewMemory] = useState('')
  const [addingMemoryTo, setAddingMemoryTo] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formRelation, setFormRelation] = useState('parent')
  const [formBirthYear, setFormBirthYear] = useState('')
  const [formBio, setFormBio] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await loadMembers(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const loadMembers = async (userId: string) => {
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (data) setMembers(data)
  }

  const resetForm = () => {
    setFormName('')
    setFormRelation('parent')
    setFormBirthYear('')
    setFormBio('')
    setEditingId(null)
  }

  const handleCreate = async () => {
    if (!formName.trim() || !user) return
    setSaving(true)

    const payload = {
      user_id: user.id,
      name: formName.trim(),
      relation: formRelation,
      birth_year: formBirthYear ? parseInt(formBirthYear) : null,
      bio: formBio.trim() || null,
      memories: [],
    }

    if (editingId) {
      await supabase.from('family_members').update(payload).eq('id', editingId)
    } else {
      await supabase.from('family_members').insert(payload)
    }

    resetForm()
    setShowForm(false)
    await loadMembers(user.id)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    await supabase.from('family_members').delete().eq('id', id)
    if (expandedId === id) setExpandedId(null)
    await loadMembers(user.id)
  }

  const handleEdit = (member: FamilyMember) => {
    setFormName(member.name)
    setFormRelation(member.relation)
    setFormBirthYear(member.birth_year?.toString() || '')
    setFormBio(member.bio || '')
    setEditingId(member.id)
    setShowForm(true)
  }

  const handleAddMemory = async (memberId: string) => {
    if (!newMemory.trim() || !user) return
    const member = members.find(m => m.id === memberId)
    if (!member) return

    const updatedMemories = [...(member.memories || []), newMemory.trim()]
    await supabase.from('family_members').update({ memories: updatedMemories }).eq('id', memberId)
    setNewMemory('')
    setAddingMemoryTo(null)
    await loadMembers(user.id)
  }

  const handleDeleteMemory = async (memberId: string, index: number) => {
    if (!user) return
    const member = members.find(m => m.id === memberId)
    if (!member || !member.memories) return

    const updatedMemories = member.memories.filter((_, i) => i !== index)
    await supabase.from('family_members').update({ memories: updatedMemories }).eq('id', memberId)
    await loadMembers(user.id)
  }

  // Group members for tree view
  const groupedMembers = useMemo(() => {
    const groups: Record<string, FamilyMember[]> = {}
    TREE_GROUPS.forEach(g => { groups[g.id] = [] })
    members.forEach(m => {
      const group = getGroup(m.relation)
      if (groups[group]) groups[group].push(m)
    })
    return groups
  }, [members])

  // Stats
  const totalMemories = useMemo(
    () => members.reduce((sum, m) => sum + (m.memories?.length || 0), 0),
    [members]
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#06060f] flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-10 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-10 h-10 border-2 border-fuchsia-500/20 border-b-fuchsia-400/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#06060f] page-transition relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-fuchsia-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-cyan-600/4 rounded-full blur-[80px]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.012]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#06060f]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-5 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1.5 rounded-lg hover:bg-white/[0.04] transition">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/25 to-fuchsia-500/20 backdrop-blur-sm border border-violet-400/15 flex items-center justify-center shadow-lg shadow-violet-500/10">
              <span className="text-sm">🧬</span>
            </div>
            <h1 className="text-sm font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{t('family tree')}</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            className="relative px-3.5 py-1.5 rounded-xl text-sm font-medium tap-feedback overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 border border-violet-400/20 rounded-xl backdrop-blur-sm" />
            <span className="relative text-violet-300">{showForm ? t('cancel') : '+ Add'}</span>
          </button>
        </div>
      </header>

      <div className="relative px-5 py-4 pb-24">
        {/* Stats Bar */}
        {members.length > 0 && (
          <div className="flex gap-3 mb-5">
            {[
              { value: members.length, label: t('memories'), color: 'violet' },
              { value: totalMemories, label: t('memories'), color: 'fuchsia' },
              { value: new Set(members.map(m => m.relation)).size, label: 'Relations', color: 'cyan' },
            ].map((stat) => (
              <div key={stat.label} className="group flex-1 relative">
                <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${
                  stat.color === 'violet' ? 'from-violet-500/15 to-transparent' :
                  stat.color === 'fuchsia' ? 'from-fuchsia-500/15 to-transparent' :
                  'from-cyan-500/15 to-transparent'
                } opacity-0 group-hover:opacity-100 blur-sm transition-opacity`} />
                <div className="relative rounded-2xl border border-white/[0.05] p-3 bg-white/[0.02] backdrop-blur-sm text-center overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r ${
                    stat.color === 'violet' ? 'from-transparent via-violet-400/20 to-transparent' :
                    stat.color === 'fuchsia' ? 'from-transparent via-fuchsia-400/20 to-transparent' :
                    'from-transparent via-cyan-400/20 to-transparent'
                  }`} />
                  <div className={`text-xl font-bold ${
                    stat.color === 'violet' ? 'text-violet-400' :
                    stat.color === 'fuchsia' ? 'text-fuchsia-400' :
                    'text-cyan-400'
                  } drop-shadow-[0_0_8px_${
                    stat.color === 'violet' ? 'rgba(139,92,246,0.3)' :
                    stat.color === 'fuchsia' ? 'rgba(217,70,239,0.3)' :
                    'rgba(34,211,238,0.3)'
                  }]`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-white/25 mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Toggle */}
        {members.length > 0 && !showForm && (
          <div className="flex gap-1 mb-5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm w-fit">
            {(['tree', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm tap-feedback transition-all ${
                  viewMode === mode
                    ? 'text-violet-300 font-medium'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                {viewMode === mode && (
                  <div className="absolute inset-0 bg-violet-500/[0.12] border border-violet-400/15 rounded-lg shadow-[0_0_12px_rgba(139,92,246,0.1)]" />
                )}
                <span className="relative flex items-center gap-1.5">
                  {mode === 'tree' ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  )}
                  {mode === 'tree' ? t('family tree') : t('features')}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="relative mb-6">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/15 to-violet-500/5 blur-sm" />
            <div className="relative rounded-2xl border border-violet-400/15 bg-[#0d0d1f]/80 backdrop-blur-xl p-5 space-y-4 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
              <h2 className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center text-[10px]">✏️</span>
                {editingId ? t('edit') : t('add')}
              </h2>

              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block font-medium uppercase tracking-wider">{t('name')}</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Their name"
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/30 mb-2 block font-medium uppercase tracking-wider">{t('relation')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {RELATIONS.map(rel => (
                    <button
                      key={rel.id}
                      onClick={() => setFormRelation(rel.id)}
                      className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs tap-feedback transition-all ${
                        formRelation === rel.id
                          ? 'text-violet-300'
                          : 'text-white/35 hover:text-white/50'
                      }`}
                    >
                      {formRelation === rel.id && (
                        <div className="absolute inset-0 bg-violet-500/[0.12] border border-violet-400/25 rounded-xl shadow-[0_0_12px_rgba(139,92,246,0.1)]" />
                      )}
                      <span className="relative text-lg">{rel.icon}</span>
                      <span className="relative">{rel.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block font-medium uppercase tracking-wider">Birth Year (optional)</label>
                <input
                  type="number"
                  value={formBirthYear}
                  onChange={e => setFormBirthYear(e.target.value)}
                  placeholder="e.g. 1965"
                  min={1900}
                  max={new Date().getFullYear()}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="text-[11px] text-white/30 mb-1.5 block font-medium uppercase tracking-wider">Bio (optional)</label>
                <textarea
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  placeholder="Tell their story..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 focus:shadow-[0_0_20px_rgba(139,92,246,0.08)] transition-all resize-none backdrop-blur-sm"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!formName.trim() || saving}
                className="relative w-full py-3 rounded-xl font-semibold tap-feedback disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative text-white">
                  {saving ? t('loading') : editingId ? t('edit') : t('add')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {members.length === 0 && !showForm && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-5">
              <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-2xl scale-150" />
              <div className="relative text-7xl">🧬</div>
            </div>
            <h2 className="text-lg font-bold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('family tree')}</h2>
            <p className="text-white/25 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              Map your roots. Add family members, link memories, and preserve your family&apos;s story for generations.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="relative px-7 py-3 rounded-xl font-semibold tap-feedback overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 hover:opacity-100 transition-opacity" />
              <span className="relative text-white">{t('add')}</span>
            </button>
          </div>
        )}

        {/* Tree View */}
        {viewMode === 'tree' && members.length > 0 && !showForm && (
          <div className="space-y-7">
            {TREE_GROUPS.map(group => {
              const groupMembers = groupedMembers[group.id]
              if (!groupMembers || groupMembers.length === 0) return null

              return (
                <div key={group.id}>
                  <h3 className="text-[11px] font-semibold text-white/25 uppercase tracking-widest mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
                    <span>{group.label}</span>
                    <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {groupMembers.map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        isExpanded={expandedId === member.id}
                        onToggle={() => setExpandedId(expandedId === member.id ? null : member.id)}
                        onEdit={() => handleEdit(member)}
                        onDelete={() => handleDelete(member.id)}
                        onAddMemory={() => setAddingMemoryTo(member.id)}
                        onDeleteMemory={(idx) => handleDeleteMemory(member.id, idx)}
                        addingMemory={addingMemoryTo === member.id}
                        newMemory={newMemory}
                        setNewMemory={setNewMemory}
                        onSaveMemory={() => handleAddMemory(member.id)}
                        onCancelMemory={() => { setAddingMemoryTo(null); setNewMemory('') }}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && members.length > 0 && !showForm && (
          <div className="space-y-3">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isExpanded={expandedId === member.id}
                onToggle={() => setExpandedId(expandedId === member.id ? null : member.id)}
                onEdit={() => handleEdit(member)}
                onDelete={() => handleDelete(member.id)}
                onAddMemory={() => setAddingMemoryTo(member.id)}
                onDeleteMemory={(idx) => handleDeleteMemory(member.id, idx)}
                addingMemory={addingMemoryTo === member.id}
                newMemory={newMemory}
                setNewMemory={setNewMemory}
                onSaveMemory={() => handleAddMemory(member.id)}
                onCancelMemory={() => { setAddingMemoryTo(null); setNewMemory('') }}
                t={t}
                fullWidth
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function MemberCard({
  member,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddMemory,
  onDeleteMemory,
  addingMemory,
  newMemory,
  setNewMemory,
  onSaveMemory,
  onCancelMemory,
  fullWidth,
  t,
}: {
  member: FamilyMember
  isExpanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAddMemory: () => void
  onDeleteMemory: (idx: number) => void
  addingMemory: boolean
  newMemory: string
  setNewMemory: (v: string) => void
  onSaveMemory: () => void
  onCancelMemory: () => void
  fullWidth?: boolean
  t: (key: string) => string
}) {
  const rel = getRelInfo(member.relation)
  const age = member.birth_year ? new Date().getFullYear() - member.birth_year : null

  return (
    <div className="group relative">
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${rel.color} ${isExpanded ? 'opacity-15' : 'opacity-0 group-hover:opacity-10'} blur-sm transition-opacity`} />
      <div
        className={`relative rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm overflow-hidden ${
          fullWidth ? '' : ''
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* Card Header */}
        <button onClick={onToggle} className="w-full p-4 text-left tap-feedback">
          <div className="flex items-center gap-3">
            <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${rel.color} flex items-center justify-center text-lg shrink-0 shadow-lg shadow-violet-500/10`}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
              <span className="relative">{rel.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white/90 truncate">{member.name}</div>
              <div className="text-xs text-white/25 capitalize mt-0.5">
                {rel.label}
                {member.birth_year && ` · b. ${member.birth_year}`}
                {age !== null && ` · ${age}y`}
              </div>
            </div>
            {member.memories && member.memories.length > 0 && (
              <span className="text-[10px] text-white/20 bg-white/[0.04] border border-white/[0.04] px-2 py-0.5 rounded-full shrink-0 backdrop-blur-sm">
                {member.memories.length} 📝
              </span>
            )}
            <svg
              className={`w-4 h-4 text-white/15 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04] pt-3">
            {member.bio && (
              <p className="text-sm text-white/45 leading-relaxed">{member.bio}</p>
            )}

            {/* Memories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">{t('memories')}</h4>
                <button
                  onClick={onAddMemory}
                  className="relative text-[11px] text-violet-300 px-2.5 py-0.5 rounded-lg tap-feedback overflow-hidden"
                >
                  <div className="absolute inset-0 bg-violet-500/[0.1] border border-violet-400/10 rounded-lg" />
                  <span className="relative">+ {t('add')}</span>
                </button>
              </div>

              {addingMemory && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newMemory}
                    onChange={e => setNewMemory(e.target.value)}
                    placeholder="A memory with this person..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-white/15 focus:outline-none focus:border-violet-500/40 transition-all backdrop-blur-sm"
                    onKeyDown={e => e.key === 'Enter' && onSaveMemory()}
                  />
                  <button onClick={onSaveMemory} className="text-xs text-violet-300 px-2 tap-feedback">{t('save')}</button>
                  <button onClick={onCancelMemory} className="text-xs text-white/25 px-2 tap-feedback">{t('cancel')}</button>
                </div>
              )}

              {member.memories && member.memories.length > 0 ? (
                <div className="space-y-1.5">
                  {member.memories.map((memory, idx) => (
                    <div key={idx} className="flex items-start gap-2 group/mem">
                      <span className="text-violet-400/20 mt-1 text-[8px]">●</span>
                      <span className="text-xs text-white/45 flex-1 leading-relaxed">{memory}</span>
                      <button
                        onClick={() => onDeleteMemory(idx)}
                        className="text-white/10 hover:text-red-400 opacity-0 group-hover/mem:opacity-100 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                !addingMemory && (
                  <p className="text-xs text-white/15 italic">{t('no data')}</p>
                )
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              <button
                onClick={onEdit}
                className="relative flex-1 text-xs text-violet-300 py-2 rounded-xl tap-feedback overflow-hidden"
              >
                <div className="absolute inset-0 bg-violet-500/[0.08] border border-violet-400/10 rounded-xl" />
                <span className="relative">✏️ {t('edit')}</span>
              </button>
              <button
                onClick={onDelete}
                className="relative flex-1 text-xs text-red-400/60 py-2 rounded-xl tap-feedback overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-500/[0.04] border border-red-400/10 rounded-xl" />
                <span className="relative">🗑️ {t('delete')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
