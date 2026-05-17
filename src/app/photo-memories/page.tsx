'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface PhotoMemory {
  id: string
  image: string
  caption: string
  mood: string
  created_at: string
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'nostalgic', emoji: '🌅', label: 'Nostalgic' },
  { id: 'peaceful', emoji: '🌊', label: 'Peaceful' },
  { id: 'excited', emoji: '⚡', label: 'Excited' },
  { id: 'thoughtful', emoji: '💭', label: 'Thoughtful' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
]

export default function PhotoMemories() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [photos, setPhotos] = useState<PhotoMemory[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMemory | null>(null)
  const [caption, setCaption] = useState('')
  const [mood, setMood] = useState('happy')
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [captionLoading, setCaptionLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const stored = localStorage.getItem('photo-memories-collection')
      if (stored) setPhotos(JSON.parse(stored))
    }
    init()
  }, [])

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.onload = () => {
        const max = 800
        const ratio = Math.min(max / img.width, max / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPreview(compressed)
    setShowUpload(true)
  }

  const generateCaption = async () => {
    if (!preview) return
    setCaptionLoading(true)
    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Generate a short, warm, nostalgic caption for a personal photo memory. Max 2 sentences. Be poetic but concise.' }],
          memories: '',
          systemPrompt: 'You are a poetic caption writer. Create short, evocative captions for personal photos. Be warm, nostalgic, and authentic. Output only the caption text.',
        }),
      })
      const data = await response.json()
      setCaption(data.reply || 'A moment worth remembering.')
    } catch { setCaption('A moment worth remembering.') }
    setCaptionLoading(false)
  }

  const savePhoto = () => {
    if (!preview) return
    const newPhoto: PhotoMemory = {
      id: Date.now().toString(),
      image: preview,
      caption: caption || 'Untitled memory',
      mood,
      created_at: new Date().toISOString(),
    }
    const updated = [newPhoto, ...photos]
    setPhotos(updated); localStorage.setItem('photo-memories-collection', JSON.stringify(updated))
    setPreview(null); setCaption(''); setMood('happy'); setShowUpload(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const deletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id)
    setPhotos(updated); localStorage.setItem('photo-memories-collection', JSON.stringify(updated))
    if (selectedPhoto?.id === id) setSelectedPhoto(null)
  }

  if (!user) return <main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="relative"><div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div></main>

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb ambient-orb-violet" style={{ width: 280, height: 280, top: '10%', left: '-5%' }} />
        <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 220, height: 220, bottom: '20%', right: '-8%' }} />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(236,72,153,0.3)', '--duration': `${6 + Math.random() * 8}s`, '--delay': `${Math.random() * 5}s` } as React.CSSProperties} />
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">📸</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold gradient-text">{t('photo memories')}</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />{photos.length} {t('memories')}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <button onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-transform">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 relative z-10">
        {/* Upload Modal */}
        {showUpload && preview && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl overflow-hidden max-w-md w-full animate-slide-up">
              <div className="aspect-square bg-black/50 relative overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">{t('caption')}</label>
                  <div className="flex gap-2">
                    <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="{t('describe this moment...')}"
                      className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder-white/20 border border-white/[0.06] focus:border-violet-500/30 transition" />
                    <button onClick={generateCaption} disabled={captionLoading}
                      className="px-3 py-2 rounded-xl glass-card text-violet-400 text-xs hover:bg-white/5 transition disabled:opacity-30">
                      {captionLoading ? '...' : `✨ ${t('ai')}`}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1.5">{t('mood')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(m => (
                      <button key={m.id} onClick={() => setMood(m.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${mood === m.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'glass-card text-white/30'}`}>
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowUpload(false); setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                    className="flex-1 py-3 rounded-xl glass-card text-white/40 text-sm hover:bg-white/5 transition">{t('cancel')}</button>
                  <button onClick={savePhoto}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">{t('save memory')}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col" onClick={() => setSelectedPhoto(null)}>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setSelectedPhoto(null)} className="text-white/60 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); deletePhoto(selectedPhoto.id) }} className="text-white/30 hover:text-red-400 transition p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <img src={selectedPhoto.image} alt="" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
            </div>
            <div className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
              <p className="text-white/70 text-sm mb-1">{selectedPhoto.caption}</p>
              <p className="text-white/30 text-xs">{MOODS.find(m => m.id === selectedPhoto.mood)?.emoji} {MOODS.find(m => m.id === selectedPhoto.mood)?.label} · {new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {photos.map(photo => (
              <button key={photo.id} onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-2xl overflow-hidden glass-card hover-lift">
                <img src={photo.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                  <p className="text-white/50 text-[10px]">{MOODS.find(m => m.id === photo.mood)?.emoji} {new Date(photo.created_at).toLocaleDateString()}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="relative text-7xl">📸</div>
            </div>
            <h2 className="text-xl font-bold gradient-text mb-2">{t('photo memories')}</h2>
            <p className="text-white/30 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{t('capture and preserve description')}</p>
            <button onClick={() => fileRef.current?.click()} className="glow-btn bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-500/20">
              📸 {t('add first photo')}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
