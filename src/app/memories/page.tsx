'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Memory {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

const CATEGORIES = [
  'childhood', 'family', 'love', 'career', 'travel', 'education', 'friendship',
  'achievement', 'hobby', 'health', 'trauma', 'lesson', 'dream', 'goal', 'fear',
  'strength', 'weakness', 'secret', 'tradition', 'belief', 'milestone', 'adventure',
  'loss', 'gratitude', 'regret', 'other',
]

const CATEGORY_ICONS: Record<string, string> = {
  childhood: '🧒', family: '👨‍👩‍👧‍👦', love: '❤️', career: '💼', travel: '✈️',
  education: '🎓', friendship: '🤝', achievement: '🏆', hobby: '🎨', health: '💪',
  trauma: '🌑', lesson: '📖', dream: '💭', goal: '🎯', fear: '😰', strength: '⚡',
  weakness: '🫧', secret: '🤫', tradition: '🏮', belief: '🙏', milestone: '🚩',
  adventure: '🗺️', loss: '🕊️', gratitude: '🌟', regret: '😔', other: '📎',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  childhood: 'from-amber-500/20 to-orange-500/10',
  family: 'from-rose-500/20 to-pink-500/10',
  love: 'from-red-500/20 to-rose-500/10',
  career: 'from-blue-500/20 to-indigo-500/10',
  travel: 'from-teal-500/20 to-emerald-500/10',
  education: 'from-violet-500/20 to-purple-500/10',
  friendship: 'from-cyan-500/20 to-sky-500/10',
  achievement: 'from-yellow-500/20 to-amber-500/10',
  hobby: 'from-fuchsia-500/20 to-pink-500/10',
  health: 'from-emerald-500/20 to-green-500/10',
  trauma: 'from-slate-500/20 to-gray-500/10',
  lesson: 'from-indigo-500/20 to-blue-500/10',
  dream: 'from-purple-500/20 to-violet-500/10',
  goal: 'from-orange-500/20 to-amber-500/10',
  fear: 'from-gray-500/20 to-slate-500/10',
  strength: 'from-lime-500/20 to-emerald-500/10',
  weakness: 'from-sky-500/20 to-blue-500/10',
  secret: 'from-violet-500/20 to-fuchsia-500/10',
  tradition: 'from-red-500/20 to-orange-500/10',
  belief: 'from-amber-500/20 to-yellow-500/10',
  milestone: 'from-green-500/20 to-teal-500/10',
  adventure: 'from-emerald-500/20 to-cyan-500/10',
  loss: 'from-gray-500/20 to-slate-500/10',
  gratitude: 'from-yellow-500/20 to-orange-500/10',
  regret: 'from-blue-500/20 to-slate-500/10',
  other: 'from-white/10 to-white/5',
}

const CATEGORY_BORDERS: Record<string, string> = {
  childhood: 'border-amber-500/20', family: 'border-rose-500/20', love: 'border-red-500/20',
  career: 'border-blue-500/20', travel: 'border-teal-500/20', education: 'border-violet-500/20',
  friendship: 'border-cyan-500/20', achievement: 'border-yellow-500/20', hobby: 'border-fuchsia-500/20',
  health: 'border-emerald-500/20', trauma: 'border-slate-500/20', lesson: 'border-indigo-500/20',
  dream: 'border-purple-500/20', goal: 'border-orange-500/20', fear: 'border-gray-500/20',
  strength: 'border-lime-500/20', weakness: 'border-sky-500/20', secret: 'border-violet-500/20',
  tradition: 'border-red-500/20', belief: 'border-amber-500/20', milestone: 'border-green-500/20',
  adventure: 'border-emerald-500/20', loss: 'border-gray-500/20', gratitude: 'border-yellow-500/20',
  regret: 'border-blue-500/20', other: 'border-white/10',
}

export default function MemoriesPage() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('other')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editMemory, setEditMemory] = useState<Memory | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('other')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setMemories(data)
      setLoading(false)
    }
    init()
  }, [])

  const addMemory = async () => {
    if (!title.trim() || !content.trim() || !user) return
    setSaving(true)
    const { data } = await supabase
      .from('memories')
      .insert({ user_id: user.id, title: title.trim(), content: content.trim(), category })
      .select()
      .single()
    if (data) {
      setMemories([data, ...memories])
      setTitle(''); setContent(''); setCategory('other'); setShowForm(false)
    }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await supabase.from('memories').delete().eq('id', deleteId)
    setMemories(memories.filter(m => m.id !== deleteId))
    setDeleteId(null)
  }

  const openEdit = (m: Memory) => {
    setEditMemory(m); setEditTitle(m.title); setEditContent(m.content); setEditCategory(m.category)
  }

  const saveEdit = async () => {
    if (!editMemory || !editTitle.trim() || !editContent.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('memories')
      .update({ title: editTitle.trim(), content: editContent.trim(), category: editCategory })
      .eq('id', editMemory.id)
      .select()
      .single()
    if (data) setMemories(memories.map(m => m.id === editMemory.id ? data : m))
    setEditMemory(null); setSaving(false)
  }

  const filtered = memories.filter(m => {
    const matchCat = !activeCategory || m.category === activeCategory
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-violet-500/10"
            style={{
              width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              animation: `floatParticle ${Math.random() * 10 + 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)', animation: 'orb1 25s ease-in-out infinite' }} />
        <div className="absolute bottom-[-150px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-8" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)', animation: 'orb2 30s ease-in-out infinite' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-3xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3 max-w-6xl mx-auto">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{t('memories')}</h1>
          <span className="ml-auto text-xs text-white/20 font-mono">{memories.length} total</span>
        </div>
      </header>

      <div className="relative z-10 px-4 max-w-6xl mx-auto pb-28 pt-6">
        {/* Search + Add */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition" placeholder="Search memories..." />
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95 whitespace-nowrap">
            {showForm ? '✕ Close' : `+ ${t('add')}`}
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] animate-slide-up">
            <h3 className="text-sm font-bold text-violet-400 mb-4 uppercase tracking-wider">{t('new memory')}</h3>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition mb-3" placeholder="Memory title..." />
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition resize-none mb-3" placeholder="Describe this memory..." />
            <div className="mb-4">
              <p className="text-[11px] text-white/25 uppercase tracking-wider mb-2 font-medium">Category</p>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/30 transition appearance-none cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a1a]">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addMemory} disabled={saving || !title.trim() || !content.trim()} className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95">
                {saving ? 'Saving...' : t('save')}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/50 transition">{t('cancel')}</button>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setActiveCategory(null)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${!activeCategory ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/50'}`}>
            All ({memories.length})
          </button>
          {CATEGORIES.map(c => {
            const count = memories.filter(m => m.category === c).length
            if (count === 0) return null
            return (
              <button key={c} onClick={() => setActiveCategory(activeCategory === c ? null : c)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === c ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/50'}`}>
                {CATEGORY_ICONS[c]} {c} ({count})
              </button>
            )
          })}
        </div>

        {/* Memory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.03] border border-white/[0.04] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-5 opacity-60" style={{ animation: 'float-subtle 5s ease-in-out infinite' }}>🧠</div>
            <p className="text-white/40 text-lg font-semibold mb-2">No memories found</p>
            <p className="text-white/20 text-sm">{search || activeCategory ? 'Try adjusting your filters' : 'Click "+ Add" to store your first memory'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((memory, i) => (
              <div
                key={memory.id}
                className={`group relative rounded-2xl p-5 bg-gradient-to-br ${CATEGORY_GRADIENTS[memory.category] || CATEGORY_GRADIENTS.other} backdrop-blur-xl border ${CATEGORY_BORDERS[memory.category] || CATEGORY_BORDERS.other} hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{CATEGORY_ICONS[memory.category] || '📎'}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(memory)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-violet-400 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setDeleteId(memory.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <h3 className="text-white/90 font-semibold text-sm mb-2 line-clamp-1">{memory.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed line-clamp-3 mb-4">{memory.content}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium bg-gradient-to-r ${CATEGORY_GRADIENTS[memory.category]} border ${CATEGORY_BORDERS[memory.category]} text-white/50 capitalize`}>{memory.category}</span>
                  <span className="text-[10px] text-white/15 font-mono">{new Date(memory.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0a0a1a] border border-white/[0.08] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-white font-bold text-lg mb-1">{t('are you sure')}</h3>
              <p className="text-white/30 text-sm">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/50 hover:text-white/70 transition">{t('cancel')}</button>
              <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-400 font-semibold hover:bg-red-500/30 transition">{t('delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editMemory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditMemory(null)}>
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0a0a1a] border border-white/[0.08] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-violet-400 mb-4 uppercase tracking-wider">{t('edit')}</h3>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition mb-3" placeholder="Title" />
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={4} className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/30 transition resize-none mb-3" placeholder="Content" />
            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-4 py-3 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/30 transition appearance-none cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}>
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a1a]">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-semibold disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/20 transition-all active:scale-95">{saving ? 'Saving...' : t('save')}</button>
              <button onClick={() => setEditMemory(null)} className="px-5 py-3 rounded-xl text-sm text-white/30 hover:text-white/50 transition">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes floatParticle { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; } 25% { transform: translateY(-30px) translateX(15px); opacity: 0.6; } 50% { transform: translateY(-10px) translateX(-10px); opacity: 0.4; } 75% { transform: translateY(-40px) translateX(5px); opacity: 0.5; } }
        @keyframes orb1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-30px, 40px) scale(1.1); } }
        @keyframes orb2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(40px, -30px) scale(1.05); } }
        @keyframes float-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </main>
  )
}
