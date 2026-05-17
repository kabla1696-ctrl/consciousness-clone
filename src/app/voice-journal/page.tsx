'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface VoiceEntry {
  id: string
  audio_url: string
  transcript: string
  mood: string
  duration_seconds: number
  created_at: string
}

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
  { emoji: '😌', label: 'Calm', color: 'text-emerald-400' },
  { emoji: '😤', label: 'Frustrated', color: 'text-red-400' },
  { emoji: '🤔', label: 'Thoughtful', color: 'text-blue-400' },
  { emoji: '😢', label: 'Sad', color: 'text-indigo-400' },
  { emoji: '⚡', label: 'Energetic', color: 'text-orange-400' },
  { emoji: '😴', label: 'Tired', color: 'text-purple-400' },
  { emoji: '❤️', label: 'Grateful', color: 'text-pink-400' },
]

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${Math.random() * 2.5 + 1}px`,
            height: `${Math.random() * 2.5 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#d946ef' : '#06b6d4',
            '--duration': `${Math.random() * 10 + 8}s`,
            '--delay': `${Math.random() * 5}s`,
          } as React.CSSProperties}
        />
      ))}
      <div className="ambient-orb ambient-orb-violet" style={{ width: 300, height: 300, top: '5%', left: '-10%', opacity: 0.2 }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 250, height: 250, bottom: '20%', right: '-8%', opacity: 0.18 }} />
    </div>
  )
}

export default function VoiceJournal() {
  const t = useT()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<VoiceEntry[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showRecorder, setShowRecorder] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadEntries(user.id)
    }
    init()
  }, [])

  const loadEntries = async (userId: string) => {
    const { data } = await supabase
      .from('voice_journals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setEntries(data)
  }

  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgba(5, 5, 16, 0.25)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
        gradient.addColorStop(0, '#8b5cf6')
        gradient.addColorStop(0.5, '#d946ef')
        gradient.addColorStop(1, '#06b6d4')

        ctx.fillStyle = gradient
        ctx.shadowColor = '#8b5cf6'
        ctx.shadowBlur = 8
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)
        ctx.shadowBlur = 0

        x += barWidth
        if (x > canvas.width) break
      }
    }

    draw()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        setAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      setShowRecorder(true)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      setTimeout(() => drawWaveform(), 100)
    } catch (err) {
      console.error('Microphone error:', err)
      alert(t('microphone error'))
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const discardRecording = () => {
    setAudioURL(null)
    setAudioBlob(null)
    setSelectedMood(null)
    setShowRecorder(false)
    setRecordingTime(0)
  }

  const saveEntry = async () => {
    if (!audioBlob || !selectedMood || !user) return
    setSaving(true)

    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(audioBlob)
      })

      await supabase.from('voice_journals').insert({
        user_id: user.id,
        audio_url: base64,
        transcript: '',
        mood: selectedMood,
        duration_seconds: recordingTime,
      })

      loadEntries(user.id)
      discardRecording()
    } catch (err) {
      console.error('Save error:', err)
      alert(t('error'))
    }

    setSaving(false)
  }

  const playEntry = (entry: VoiceEntry) => {
    if (playingId === entry.id) {
      setPlayingId(null)
      return
    }

    const audio = new Audio(entry.audio_url)
    setPlayingId(entry.id)
    audio.play()
    audio.onended = () => setPlayingId(null)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / 86400000)

    if (days === 0) return t('today')
    if (days === 1) return t('yesterday')
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMoodData = (mood: string) => MOODS.find(m => m.label === mood) || MOODS[0]

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 50%, #0d0520 100%)' }}>
        <div className="relative">
          <div className="w-12 h-12 border-2 border-violet-500/50 border-t-violet-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border border-fuchsia-500/20 rounded-full animate-ping" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen page-transition" style={{ background: 'linear-gradient(135deg, #050510 0%, #080818 40%, #0d0520 100%)' }}>
      <Particles />

      {/* Header */}
      <header className="sticky top-0 z-50 safe-top" style={{
        background: 'rgba(5, 5, 16, 0.7)',
        backdropFilter: 'blur(40px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        boxShadow: '0 4px 30px rgba(139, 92, 246, 0.05)',
      }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-2 rounded-xl hover:bg-white/[0.05] transition-all duration-300">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-lg" style={{
            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.1)',
          }}>🎙️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Voice Journal</h1>
            <p className="text-[10px] text-white/40">{t('record your thoughts')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto">
        {/* Recorder Section */}
        {showRecorder ? (
          <div className="rounded-2xl p-6 mb-6" style={{
            background: 'rgba(139, 92, 246, 0.04)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.08), 0 8px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}>
            {/* Waveform */}
            <div className="mb-4 rounded-xl" style={{
              background: 'rgba(5, 5, 16, 0.6)',
              border: '1px solid rgba(139, 92, 246, 0.08)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
            }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full h-[120px]"
              />
            </div>

            {/* Timer */}
            <div className="text-center mb-4">
              <span className="text-3xl font-mono font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Controls */}
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-full py-4 rounded-xl font-semibold tap-feedback flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.08)',
                }}
              >
                <div className="w-4 h-4 rounded-sm bg-red-400" />
                <span className="text-red-400">Stop Recording</span>
              </button>
            ) : audioURL ? (
              <div className="space-y-4">
                {/* Playback */}
                <audio src={audioURL} controls className="w-full" />

                {/* Mood Selection */}
                <div>
                  <p className="text-white/40 text-xs mb-2">{t('how are you')}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {MOODS.map(mood => (
                      <button
                        key={mood.label}
                        onClick={() => setSelectedMood(mood.label)}
                        className="p-3 rounded-xl text-center tap-feedback transition-all duration-300"
                        style={selectedMood === mood.label ? {
                          background: 'rgba(139, 92, 246, 0.12)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)',
                        } : {
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div className="text-xl">{mood.emoji}</div>
                        <div className="text-[10px] text-white/40 mt-1">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={discardRecording}
                    className="flex-1 py-3 rounded-xl font-medium tap-feedback text-white/60"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {t('discard')}
                  </button>
                  <button
                    onClick={saveEntry}
                    disabled={!selectedMood || saving}
                    className="relative flex-1 py-3 rounded-xl font-medium tap-feedback disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.25), 0 4px 15px rgba(0,0,0,0.3)',
                    }}
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>💾 {t('save')}</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Record Button */
          <div className="flex flex-col items-center py-8 mb-6">
            <button
              onClick={startRecording}
              className="relative w-28 h-28 rounded-full flex items-center justify-center tap-feedback active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.35), 0 0 80px rgba(139, 92, 246, 0.15), 0 8px 25px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{
                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
              }} />
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m14 0a7 7 0 00-14 0m14 0v1a7 7 0 01-14 0v-1m7-4V3m0 0L8 6m4-3l4 3" />
              </svg>
            </button>
            <p className="text-white/50 text-sm mt-4 font-medium">{t('tap to record')}</p>
            <p className="text-white/20 text-xs mt-1">{t('your voice your thoughts')}</p>
          </div>
        )}

        {/* Journal Entries */}
        <div>
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">{t('journal entries')}</h2>

          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎙️</div>
              <p className="text-white/40 text-sm">{t('no data')}</p>
              <p className="text-white/20 text-xs mt-1">Record your first voice journal!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const mood = getMoodData(entry.mood)
                return (
                  <div
                    key={entry.id}
                    className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(139, 92, 246, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => playEntry(entry)}
                        className="w-10 h-10 rounded-full flex items-center justify-center tap-feedback transition-all duration-300"
                        style={playingId === entry.id ? {
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          boxShadow: '0 0 15px rgba(139, 92, 246, 0.15)',
                        } : {
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {playingId === entry.id ? (
                          <div className="w-3 h-3 rounded-sm bg-violet-400" />
                        ) : (
                          <svg className="w-4 h-4 text-white/60 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mood.emoji}</span>
                          <span className={`text-xs font-medium ${mood.color}`}>{entry.mood}</span>
                          <span className="text-white/20 text-xs">•</span>
                          <span className="text-white/30 text-xs">{formatTime(entry.duration_seconds)}</span>
                        </div>
                        <p className="text-white/40 text-xs mt-1">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
