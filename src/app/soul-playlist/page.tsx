'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface Song {
  name: string
  artist: string
}

interface Playlist {
  id: string
  mood: string
  songs: Song[]
  created_at: string
}

const MOODS = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: 'from-yellow-500 to-orange-500' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-500' },
  { id: 'energetic', label: 'Energetic', emoji: '⚡', color: 'from-red-500 to-orange-500' },
  { id: 'calm', label: 'Calm', emoji: '🧘', color: 'from-teal-500 to-cyan-500' },
  { id: 'nostalgic', label: 'Nostalgic', emoji: '🌅', color: 'from-amber-500 to-rose-500' },
  { id: 'motivated', label: 'Motivated', emoji: '🔥', color: 'from-violet-500 to-fuchsia-500' },
]

const ALBUM_COLORS = [
  'from-violet-600 to-indigo-700',
  'from-fuchsia-600 to-pink-700',
  'from-cyan-600 to-blue-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-rose-600 to-red-700',
]

export default function SoulPlaylist() {
  const [user, setUser] = useState<any>(null)
  const [selectedMood, setSelectedMood] = useState('motivated')
  const [generating, setGenerating] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [favorites, setFavorites] = useState<Song[]>([])
  const [memoryContext, setMemoryContext] = useState('')
  const [history, setHistory] = useState<Playlist[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: memories } = await supabase
        .from('memories')
        .select('content, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (memories) {
        const topics = [...new Set(memories.map(m => m.category))].join(', ')
        setMemoryContext(`Topics: ${topics}. Details: ${memories.map(m => m.content).join('. ')}`)
      }

      const storedFavs = localStorage.getItem('soul-playlist-favorites')
      if (storedFavs) setFavorites(JSON.parse(storedFavs))

      const storedHistory = localStorage.getItem('soul-playlist-history')
      if (storedHistory) setHistory(JSON.parse(storedHistory))
    }
    init()
  }, [])

  const generatePlaylist = async () => {
    if (generating) return
    setGenerating(true)
    setSongs([])

    try {
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Suggest 5 songs for someone feeling ${selectedMood} who is interested in ${memoryContext || 'various topics'}. Give song name and artist. Be thoughtful — choose songs that resonate with this person's life and interests.`
          }],
          memories: memoryContext,
          systemPrompt: `You are a music curator with deep emotional intelligence. Suggest songs that truly match the person's mood and personality. 

IMPORTANT: Reply ONLY with valid JSON — no markdown, no explanation. Format:
[{"name": "Song Name", "artist": "Artist Name"}, ...]

Choose 5 real, well-known songs. Pick songs that feel personal and meaningful.`,
        }),
      })

      const data = await response.json()
      let parsed: Song[] = []

      try {
        // Try to parse JSON from the response
        const text = data.reply || '[]'
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0])
        }
      } catch {
        parsed = []
      }

      if (parsed.length === 0) {
        parsed = [{ name: 'Could not parse songs', artist: 'Try again' }]
      }

      setSongs(parsed)

      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        mood: selectedMood,
        songs: parsed,
        created_at: new Date().toISOString(),
      }

      const updatedHistory = [newPlaylist, ...history].slice(0, 20)
      setHistory(updatedHistory)
      localStorage.setItem('soul-playlist-history', JSON.stringify(updatedHistory))
    } catch (err) {
      setSongs([{ name: 'Failed to generate', artist: 'Please try again' }])
    }

    setGenerating(false)
  }

  const toggleFavorite = (song: Song) => {
    const exists = favorites.find(f => f.name === song.name && f.artist === song.artist)
    let updated: Song[]
    if (exists) {
      updated = favorites.filter(f => !(f.name === song.name && f.artist === song.artist))
    } else {
      updated = [...favorites, song]
    }
    setFavorites(updated)
    localStorage.setItem('soul-playlist-favorites', JSON.stringify(updated))
  }

  const isFavorite = (song: Song) => favorites.some(f => f.name === song.name && f.artist === song.artist)

  const openSpotify = (song: Song) => {
    const query = encodeURIComponent(`${song.name} ${song.artist}`)
    window.open(`https://open.spotify.com/search/${query}`, '_blank')
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm">🎵</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Soul Playlist</h1>
            <p className="text-[10px] text-violet-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
              Music for your soul
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-white/40 hover:text-violet-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full">
        {/* History Panel */}
        {showHistory && (
          <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/80">Playlist History</h3>
              <span className="text-xs text-white/30">{history.length} playlists</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-white/30 text-sm p-4 text-center">No playlists yet</p>
              ) : (
                history.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSongs(p.songs); setSelectedMood(p.mood); setShowHistory(false) }}
                    className="w-full px-4 py-3 text-left border-b border-white/[0.03] hover:bg-white/[0.02] transition flex items-center gap-3"
                  >
                    <span className="text-lg">{MOODS.find(m => m.id === p.mood)?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white/70 capitalize">{p.mood} playlist</p>
                      <p className="text-xs text-white/30">{p.songs.length} songs · {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mood Selector */}
        <div className="mb-6">
          <label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">How are you feeling?</label>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-3 rounded-xl text-center transition ${
                  selectedMood === mood.id
                    ? `bg-gradient-to-r ${mood.color} shadow-lg`
                    : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1]'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <p className="text-xs font-medium text-white/80 mt-1">{mood.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generatePlaylist}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white hover:opacity-90 transition disabled:opacity-30 flex items-center justify-center gap-2 mb-6"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Curating Playlist...
            </>
          ) : (
            <>
              <span>🎵</span> Generate Playlist
            </>
          )}
        </button>

        {/* Songs */}
        {songs.length > 0 && (
          <div className="space-y-3 mb-6">
            {songs.map((song, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 transition group"
              >
                {/* Album Art Placeholder */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ALBUM_COLORS[i % ALBUM_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-6 h-6 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/90 truncate">{song.name}</p>
                  <p className="text-xs text-white/40 truncate">{song.artist}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(song)}
                    className={`p-2 rounded-full transition ${isFavorite(song) ? 'text-red-400' : 'text-white/20 hover:text-red-400'}`}
                  >
                    <svg className="w-5 h-5" fill={isFavorite(song) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openSpotify(song)}
                    className="p-2 rounded-full text-white/20 hover:text-green-400 transition"
                    title="Open in Spotify"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <h3 className="text-sm font-semibold text-white/80">❤️ Favorites ({favorites.length})</h3>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {favorites.map((song, i) => (
                <div key={i} className="px-4 py-2.5 border-b border-white/[0.03] flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 truncate">{song.name}</p>
                    <p className="text-xs text-white/30 truncate">{song.artist}</p>
                  </div>
                  <button onClick={() => openSpotify(song)} className="text-white/20 hover:text-green-400 transition p-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {songs.length === 0 && !generating && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎶</div>
            <p className="text-white/30 text-sm">Select your mood and generate a playlist</p>
            <p className="text-white/20 text-xs mt-1">AI-curated songs based on your personality</p>
          </div>
        )}
      </div>
    </main>
  )
}
