'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Song {
  id: string
  title: string
  artist: string
  mood: string
}

interface Playlist {
  id: string
  mood: string
  songs: Song[]
  created_at: string
  favorite: boolean
}

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-500/20' },
  { id: 'melancholy', emoji: '🌧️', label: 'Melancholy', color: 'from-blue-400 to-indigo-500', glow: 'shadow-blue-500/20' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: 'from-orange-400 to-red-500', glow: 'shadow-orange-500/20' },
  { id: 'calm', emoji: '🌊', label: 'Calm', color: 'from-teal-400 to-cyan-500', glow: 'shadow-teal-500/20' },
  { id: 'nostalgic', emoji: '🌅', label: 'Nostalgic', color: 'from-pink-400 to-rose-500', glow: 'shadow-pink-500/20' },
  { id: 'focused', emoji: '🎯', label: 'Focused', color: 'from-violet-400 to-purple-500', glow: 'shadow-violet-500/20' },
]

export default function SoulPlaylist() {
  const [user, setUser] = useState<any>(null)
  const [memories, setMemories] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const { data } = await supabase.from('memories').select('content, category').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
      if (data) setMemories(data.map(m => `[${m.category}] ${m.content}`).join('\n'))
      const stored = localStorage.getItem('soul-playlist-history')
      if (stored) setPlaylists(JSON.parse(stored))
    }
    init()
  }, [])

  const generatePlaylist = async () => {
    if (!selectedMood || generating) return
    setGenerating(true); setCurrentPlaylist([])
    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Based on my memories and current mood (${selectedMood}), generate a playlist of 8 songs. Format: one song per line as "Title - Artist". Only the list, nothing else.` }],
          memories,
          systemPrompt: 'You are a music curator with deep emotional intelligence. Create playlists that match moods and resonate with personal memories. Output ONLY a numbered list of songs in "Title - Artist" format. No commentary.',
        }),
      })
      const data = await response.json()
      const reply = data.reply || ''
      const songs: Song[] = reply.split('\n').filter((l: string) => l.trim() && l.includes('-')).map((line: string, i: number) => {
        const clean = line.replace(/^\d+[\.\)]\s*/, '').trim()
        const [title, ...rest] = clean.split(' - ')
        return { id: `song-${i}`, title: title?.trim() || 'Unknown', artist: rest.join(' - ').trim() || 'Unknown', mood: selectedMood }
      }).slice(0, 8)
      setCurrentPlaylist(songs)
      if (songs.length > 0) {
        const newPl: Playlist = { id: Date.now().toString(), mood: selectedMood, songs, created_at: new Date().toISOString(), favorite: false }
        const updated = [newPl, ...playlists]
        setPlaylists(updated); localStorage.setItem('soul-playlist-history', JSON.stringify(updated))
      }
    } catch { setCurrentPlaylist([]) }
    setGenerating(false)
  }

  const toggleFavorite = (id: string) => {
    const updated = playlists.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p)
    setPlaylists(updated); localStorage.setItem('soul-playlist-history', JSON.stringify(updated))
  }

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id)
    setPlaylists(updated); localStorage.setItem('soul-playlist-history', JSON.stringify(updated))
  }

  if (!user) return <main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="relative"><div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" /></div></main>

  return (
    <main className="min-h-screen flex flex-col animated-gradient-bg noise-overlay page-transition">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb ambient-orb-violet" style={{ width: 300, height: 300, top: '15%', right: '-5%' }} />
        <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '20%', left: '-5%' }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle" style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, background: i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(236,72,153,0.3)', '--duration': `${6 + Math.random() * 8}s`, '--delay': `${Math.random() * 5}s` } as React.CSSProperties} />
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm shadow-lg shadow-violet-500/20">🎵</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold gradient-text">Soul Playlist</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />Music for your soul</p>
          </div>
          <button onClick={() => setShowHistory(!showHistory)} className="text-white/40 hover:text-violet-400 transition p-2 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full relative z-10">
        {showHistory && (
          <div className="mb-6 glass-card rounded-2xl overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Playlist History</h3>
              <span className="text-xs text-white/30">{playlists.length} playlists</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {playlists.length === 0 ? <p className="text-white/30 text-sm p-4 text-center">No playlists yet</p> : playlists.map(p => (
                <div key={p.id} className="px-4 py-3 border-b border-white/[0.03] flex items-center gap-3 hover:bg-white/[0.02] transition">
                  <button onClick={() => { setCurrentPlaylist(p.songs); setSelectedMood(p.mood); setShowHistory(false) }} className="flex-1 text-left">
                    <p className="text-sm text-white/70 font-medium">{MOODS.find(m => m.id === p.mood)?.emoji} {MOODS.find(m => m.id === p.mood)?.label}</p>
                    <p className="text-xs text-white/30">{p.songs.length} songs · {new Date(p.created_at).toLocaleDateString()}</p>
                  </button>
                  <button onClick={() => toggleFavorite(p.id)} className={`p-1 transition ${p.favorite ? 'text-amber-400' : 'text-white/20 hover:text-amber-400'}`}>⭐</button>
                  <button onClick={() => deletePlaylist(p.id)} className="text-white/20 hover:text-red-400 transition p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mini Player */}
        {currentSong && (
          <div className="mb-6 glass-card rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-xl shadow-lg shadow-violet-500/10">🎵</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">{currentSong.title}</p>
                <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
              </div>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-transform">
                {isPlaying ? <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
              </button>
            </div>
            <div className="mt-3 w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
              <div className="premium-progress bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1 rounded-full" style={{ width: '35%' }} />
            </div>
          </div>
        )}

        {/* Mood Selector */}
        <div className="mb-6">
          <h2 className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">How are you feeling?</h2>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map(mood => (
              <button key={mood.id} onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                  selectedMood === mood.id
                    ? `glass-card shadow-lg ${mood.glow} border border-violet-500/30 scale-105`
                    : 'glass-card hover-lift'
                }`}>
                <span className="text-2xl block mb-1">{mood.emoji}</span>
                <span className={`text-xs font-medium ${selectedMood === mood.id ? 'text-white' : 'text-white/40'}`}>{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generatePlaylist} disabled={generating || !selectedMood}
          className="w-full py-4 rounded-2xl glow-btn bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-30 flex items-center justify-center gap-2 mb-6">
          {generating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Curating Playlist...</>) : (<><span>🎵</span> Generate Soul Playlist</>)}
        </button>

        {/* Playlist */}
        {currentPlaylist.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">{MOODS.find(m => m.id === selectedMood)?.emoji} {MOODS.find(m => m.id === selectedMood)?.label} Playlist</h3>
              <span className="text-xs text-white/30">{currentPlaylist.length} tracks</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {currentPlaylist.map((song, i) => (
                <button key={song.id} onClick={() => { setCurrentSong(song); setIsPlaying(true) }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.03] transition ${currentSong?.id === song.id ? 'bg-violet-500/[0.05]' : ''}`}>
                  <span className={`w-7 text-center text-sm font-mono ${currentSong?.id === song.id ? 'text-violet-400' : 'text-white/20'}`}>{currentSong?.id === song.id && isPlaying ? '▶' : (i + 1).toString().padStart(2, '0')}</span>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-medium truncate ${currentSong?.id === song.id ? 'text-violet-400' : 'text-white/80'}`}>{song.title}</p>
                    <p className="text-xs text-white/30 truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-white/15">3:{(20 + i * 7) % 60 < 10 ? '0' : ''}{(20 + i * 7) % 60}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!currentPlaylist.length && !generating && (
          <div className="text-center py-16">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-3xl" />
              <div className="relative text-6xl">🎶</div>
            </div>
            <p className="text-white/30 text-sm">Select your mood to generate a playlist</p>
            <p className="text-white/15 text-xs mt-1">AI-curated based on your memories</p>
          </div>
        )}
      </div>
    </main>
  )
}
