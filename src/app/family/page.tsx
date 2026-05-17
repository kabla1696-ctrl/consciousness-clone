'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 -ml-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧬</span>
            <h1 className="text-lg font-bold">Family Tree</h1>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm() }}
            className="bg-violet-500/20 text-violet-400 text-sm font-medium px-3 py-1.5 rounded-lg tap-feedback"
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24">
        {/* Stats Bar */}
        {members.length > 0 && (
          <div className="flex gap-3 mb-4">
            <div className="flex-1 rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
              <div className="text-xl font-bold text-violet-400">{members.length}</div>
              <div className="text-[10px] text-white/30">Members</div>
            </div>
            <div className="flex-1 rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
              <div className="text-xl font-bold text-fuchsia-400">{totalMemories}</div>
              <div className="text-[10px] text-white/30">Memories</div>
            </div>
            <div className="flex-1 rounded-xl border border-white/[0.06] p-3 bg-white/[0.02] text-center">
              <div className="text-xl font-bold text-cyan-400">
                {new Set(members.map(m => m.relation)).size}
              </div>
              <div className="text-[10px] text-white/30">Relations</div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {members.length > 0 && !showForm && (
          <div className="flex gap-1 mb-4">
            {(['tree', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm tap-feedback ${
                  viewMode === mode
                    ? 'bg-violet-500/20 text-violet-400 font-medium'
                    : 'text-white/40'
                }`}
              >
                {mode === 'tree' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
                {mode === 'tree' ? 'Tree' : 'List'}
              </button>
            ))}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-violet-500/30 p-4 bg-violet-500/5 space-y-4">
            <h2 className="text-sm font-semibold text-violet-400">
              {editingId ? 'Edit Family Member' : 'Add Family Member'}
            </h2>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Name</label>
              <input
                type="text"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Their name"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-2 block">Relation</label>
              <div className="grid grid-cols-4 gap-2">
                {RELATIONS.map(rel => (
                  <button
                    key={rel.id}
                    onClick={() => setFormRelation(rel.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs tap-feedback ${
                      formRelation === rel.id
                        ? 'bg-violet-500/20 border border-violet-500/40'
                        : 'bg-white/[0.02] border border-white/[0.06]'
                    }`}
                  >
                    <span className="text-lg">{rel.icon}</span>
                    <span className={formRelation === rel.id ? 'text-violet-400' : 'text-white/40'}>{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Birth Year (optional)</label>
              <input
                type="number"
                value={formBirthYear}
                onChange={e => setFormBirthYear(e.target.value)}
                placeholder="e.g. 1965"
                min={1900}
                max={new Date().getFullYear()}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1 block">Bio (optional)</label>
              <textarea
                value={formBio}
                onChange={e => setFormBio(e.target.value)}
                placeholder="Tell their story..."
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!formName.trim() || saving}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold py-3 rounded-xl tap-feedback disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editingId ? '✏️ Update' : '🧬 Add to Tree'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {members.length === 0 && !showForm && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧬</div>
            <h2 className="text-lg font-bold mb-2">Build Your Family Tree</h2>
            <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">
              Map your roots. Add family members, link memories, and preserve your family&apos;s story for generations.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-6 py-3 rounded-xl tap-feedback"
            >
              Add First Member
            </button>
          </div>
        )}

        {/* Tree View */}
        {viewMode === 'tree' && members.length > 0 && !showForm && (
          <div className="space-y-6">
            {TREE_GROUPS.map(group => {
              const groupMembers = groupedMembers[group.id]
              if (!groupMembers || groupMembers.length === 0) return null

              return (
                <div key={group.id}>
                  <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/[0.06]" />
                    <span>{group.label}</span>
                    <div className="h-px flex-1 bg-white/[0.06]" />
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
}) {
  const rel = getRelInfo(member.relation)
  const age = member.birth_year ? new Date().getFullYear() - member.birth_year : null

  return (
    <div
      className={`rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden ${
        fullWidth ? '' : ''
      }`}
    >
      {/* Card Header */}
      <button onClick={onToggle} className="w-full p-4 text-left tap-feedback">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rel.color} flex items-center justify-center text-lg shrink-0`}>
            {rel.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{member.name}</div>
            <div className="text-xs text-white/30 capitalize">
              {rel.label}
              {member.birth_year && ` · b. ${member.birth_year}`}
              {age !== null && ` · ${age}y`}
            </div>
          </div>
          {member.memories && member.memories.length > 0 && (
            <span className="text-xs text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full shrink-0">
              {member.memories.length} 📝
            </span>
          )}
          <svg
            className={`w-4 h-4 text-white/20 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
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
            <p className="text-sm text-white/50 leading-relaxed">{member.bio}</p>
          )}

          {/* Memories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Memories</h4>
              <button
                onClick={onAddMemory}
                className="text-xs text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 tap-feedback"
              >
                + Add
              </button>
            </div>

            {addingMemory && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMemory}
                  onChange={e => setNewMemory(e.target.value)}
                  placeholder="A memory with this person..."
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
                  onKeyDown={e => e.key === 'Enter' && onSaveMemory()}
                />
                <button onClick={onSaveMemory} className="text-xs text-violet-400 px-2 tap-feedback">Save</button>
                <button onClick={onCancelMemory} className="text-xs text-white/30 px-2 tap-feedback">Cancel</button>
              </div>
            )}

            {member.memories && member.memories.length > 0 ? (
              <div className="space-y-1.5">
                {member.memories.map((memory, idx) => (
                  <div key={idx} className="flex items-start gap-2 group">
                    <span className="text-white/10 mt-0.5">•</span>
                    <span className="text-xs text-white/50 flex-1">{memory}</span>
                    <button
                      onClick={() => onDeleteMemory(idx)}
                      className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <p className="text-xs text-white/20 italic">No memories yet. Add one!</p>
              )
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
            <button
              onClick={onEdit}
              className="flex-1 text-xs text-violet-400 py-2 rounded-lg bg-violet-500/10 tap-feedback"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onDelete}
              className="flex-1 text-xs text-red-400/60 py-2 rounded-lg bg-red-500/5 tap-feedback"
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
