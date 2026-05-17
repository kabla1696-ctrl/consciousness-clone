'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

interface PhotoMemory {
  id: string
  dataUrl: string
  caption: string
  date: string
  location: string
  mood: string
  createdAt: string
}

const MOODS = ['😊 Happy', '😢 Sad', '😍 Love', '😤 Angry', '🤔 Thoughtful', '😴 Peaceful', '🎉 Excited', '😰 Anxious']
const MAX_PHOTO_SIZE = 800 // max dimension before compression

export default function PhotoMemories() {
  const [photos, setPhotos] = useState<PhotoMemory[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [location, setLocation] = useState('')
  const [mood, setMood] = useState(MOODS[0])
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoMemory | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest')
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('photo-memories')
    if (stored) {
      try { setPhotos(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const savePhotos = (updated: PhotoMemory[]) => {
    setPhotos(updated)
    localStorage.setItem('photo-memories', JSON.stringify(updated))
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          if (width > MAX_PHOTO_SIZE || height > MAX_PHOTO_SIZE) {
            if (width > height) {
              height = (height / width) * MAX_PHOTO_SIZE
              width = MAX_PHOTO_SIZE
            } else {
              width = (width / height) * MAX_PHOTO_SIZE
              height = MAX_PHOTO_SIZE
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPreview(compressed)
    setShowUpload(true)
  }

  const handleSave = () => {
    if (!preview) return
    const newPhoto: PhotoMemory = {
      id: Date.now().toString(),
      dataUrl: preview,
      caption,
      date,
      location,
      mood,
      createdAt: new Date().toISOString(),
    }
    savePhotos([newPhoto, ...photos])
    resetForm()
  }

  const resetForm = () => {
    setPreview(null)
    setCaption('')
    setDate(new Date().toISOString().split('T')[0])
    setLocation('')
    setMood(MOODS[0])
    setShowUpload(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const deletePhoto = (id: string) => {
    const updated = photos.filter(p => p.id !== id)
    savePhotos(updated)
    if (lightboxPhoto?.id === id) setLightboxPhoto(null)
  }

  const suggestCaption = async () => {
    if (!preview) return
    setSuggesting(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: 'Generate a short, emotional caption (max 15 words) for a photo memory. Just return the caption, nothing else. Make it personal and nostalgic.'
          }],
          memories: '',
        }),
      })
      const data = await response.json()
      if (data.reply) {
        setCaption(data.reply.replace(/^["']|["']$/g, '').trim())
      }
    } catch {
      setCaption('A moment worth remembering ✨')
    }
    setSuggesting(false)
  }

  const sortedPhotos = [...photos].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const groupedByDate = sortedPhotos.reduce((acc, photo) => {
    const d = photo.date || 'Unknown'
    if (!acc[d]) acc[d] = []
    acc[d].push(photo)
    return acc
  }, {} as Record<string, PhotoMemory[]>)

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="page-transition min-h-screen bg-[#050510] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-white font-semibold text-base">Photo Memories</h1>
            <p className="text-gray-500 text-xs">{photos.length} photos stored</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ml-auto w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/30 transition-colors"
          >
            <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4">
        {/* Sort */}
        <div className="flex gap-2 mb-4">
          {(['newest', 'oldest'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sortBy === s
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
              }`}
            >
              {s === 'newest' ? '🕐 Newest First' : '🕐 Oldest First'}
            </button>
          ))}
        </div>

        {/* Gallery */}
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📸</p>
            <p className="text-gray-300 text-sm font-medium">No photos yet</p>
            <p className="text-gray-500 text-xs mt-1">Capture your precious moments</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
            >
              📷 Add First Photo
            </button>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateKey, datePhotos]) => (
            <div key={dateKey} className="mb-6">
              <h2 className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-white/10" />
                {new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                <span className="flex-1 h-px bg-white/10" />
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {datePhotos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => setLightboxPhoto(photo)}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img src={photo.dataUrl} alt={photo.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                      <p className="text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                        {photo.caption || photo.mood}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && preview && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={resetForm}>
          <div className="w-full max-w-lg bg-[#0a0a1a] rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="rounded-2xl overflow-hidden mb-4 border border-white/10">
                <img src={preview} alt="Preview" className="w-full max-h-60 object-cover" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-gray-300 text-xs font-medium">Caption</label>
                    <button
                      onClick={suggestCaption}
                      disabled={suggesting}
                      className="text-violet-400 text-[10px] hover:text-violet-300 transition-colors flex items-center gap-1"
                    >
                      {suggesting ? (
                        <><div className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin" /> Generating...</>
                      ) : (
                        <>✨ AI Suggest</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="What's this moment about?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 text-xs font-medium mb-1.5 block">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-xs font-medium mb-1.5 block">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Where?"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-xs font-medium mb-1.5 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          mood === m
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={resetForm} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm font-medium hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20">
                  💾 Save Memory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md" onClick={() => setLightboxPhoto(null)}>
          <div className="w-full max-w-lg p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setLightboxPhoto(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button
                onClick={() => deletePhoto(lightboxPhoto.id)}
                className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-colors"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <img src={lightboxPhoto.dataUrl} alt={lightboxPhoto.caption} className="w-full rounded-2xl border border-white/10" />
            <div className="mt-4 space-y-2">
              {lightboxPhoto.caption && <p className="text-white text-sm font-medium">{lightboxPhoto.caption}</p>}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-400 text-xs">📅 {new Date(lightboxPhoto.date + 'T00:00:00').toLocaleDateString()}</span>
                {lightboxPhoto.location && <span className="text-gray-400 text-xs">📍 {lightboxPhoto.location}</span>}
                <span className="text-gray-400 text-xs">{lightboxPhoto.mood}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
