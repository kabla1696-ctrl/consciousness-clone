'use client'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type CallPhase = 'ringing' | 'connected' | 'ended' | 'incoming'

interface CallRecord {
  id: string
  userName: string
  userId: string
  direction: 'outgoing' | 'incoming'
  duration: number
  timestamp: string
  status: 'completed' | 'missed' | 'declined'
}

function CallUserContent() {
  const searchParams = useSearchParams()
  const userName = searchParams.get('user') || 'Unknown'
  const userId = searchParams.get('id') || '0'
  const avatarUrl = searchParams.get('avatar') || ''

  const [phase, setPhase] = useState<CallPhase>('ringing')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(30).fill(0))
  const [transcript, setTranscript] = useState<string[]>([])
  const [showEndScreen, setShowEndScreen] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const ringOscRef = useRef<OscillatorNode | null>(null)
  const transcriptIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate avatar initial
  const avatarInitial = userName.charAt(0).toUpperCase()
  const avatarColors = [
    'from-violet-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-red-500',
  ]
  const colorIdx = userName.charCodeAt(0) % avatarColors.length

  // Start ringing sound
  const startRingTone = useCallback(() => {
    try {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const playBeep = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.value = 440
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.8)
        ringOscRef.current = osc
      }
      playBeep()
      const interval = setInterval(playBeep, 2000)
      return () => clearInterval(interval)
    } catch { /* Audio not supported */ }
  }, [])

  // Stop ringing
  const stopRingTone = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
  }, [])

  // Start mic + visualization
  const startMicVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.75
      source.connect(analyser)
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const draw = () => {
        animFrameRef.current = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)
        const bars: number[] = []
        const step = Math.floor(bufferLength / 30)
        for (let i = 0; i < 30; i++) {
          const val = dataArray[i * step] / 255
          bars.push(Math.max(0.05, val))
        }
        setFrequencyData(bars)
      }
      draw()
    } catch (err) {
      console.error('Mic access denied:', err)
      // Fallback: animate bars randomly
      const animate = () => {
        animFrameRef.current = requestAnimationFrame(animate)
        setFrequencyData(prev => prev.map(() => Math.random() * 0.6 + 0.05))
      }
      animate()
    }
  }, [])

  // Connect call (after ringing)
  const connectCall = useCallback(() => {
    stopRingTone()
    setPhase('connected')
    setCallDuration(0)
    startMicVisualization()

    // Start timer
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    // Simulate transcript lines
    const fakeLines = [
      `${userName}: Hey, how are you?`,
      `You: I'm doing great! How about you?`,
      `${userName}: Pretty good, just working on some stuff.`,
      `You: Nice, anything exciting?`,
      `${userName}: Yeah, been exploring new ideas lately.`,
      `You: That sounds awesome!`,
      `${userName}: We should catch up more often.`,
      `You: Definitely, let's do it!`,
    ]
    let lineIdx = 0
    transcriptIntervalRef.current = setInterval(() => {
      if (lineIdx < fakeLines.length) {
        setTranscript(prev => [...prev, fakeLines[lineIdx]])
        lineIdx++
      }
    }, 4000)
  }, [stopRingTone, startMicVisualization, userName])

  // End call
  const endCall = useCallback(() => {
    // Stop everything
    stopRingTone()
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (transcriptIntervalRef.current) clearInterval(transcriptIntervalRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }

    setPhase('ended')
    setShowEndScreen(true)

    // Save to call history
    const record: CallRecord = {
      id: `call_${Date.now()}`,
      userName,
      userId,
      direction: 'outgoing',
      duration: callDuration,
      timestamp: new Date().toISOString(),
      status: callDuration > 0 ? 'completed' : 'missed',
    }
    try {
      const existing: CallRecord[] = JSON.parse(localStorage.getItem('cc_call_history') || '[]')
      existing.unshift(record)
      localStorage.setItem('cc_call_history', JSON.stringify(existing))
    } catch { /* localStorage unavailable */ }
  }, [callDuration, userName, userId, stopRingTone])

  // Initial ringing on mount
  useEffect(() => {
    const cleanup = startRingTone()
    // Auto-connect after 4 seconds
    const connectTimeout = setTimeout(connectCall, 4000)
    return () => {
      cleanup?.()
      clearTimeout(connectTimeout)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (transcriptIntervalRef.current) clearInterval(transcriptIntervalRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') audioCtxRef.current.close().catch(() => {})
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle mute
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted })
    }
    setIsMuted(!isMuted)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  // ── End Screen ──
  if (showEndScreen) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #050510, #0a0a2e)' }}>
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-3xl text-white font-bold mx-auto mb-4">
            {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" /> : avatarInitial}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
          <p className="text-white/30 text-sm">Call ended</p>
        </div>

        <div className="w-full max-w-xs space-y-4 mb-8">
          <div className="rounded-xl border border-white/[0.06] p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-white/40 text-xs mb-1">Duration</p>
            <p className="text-2xl font-mono text-emerald-400 font-bold">{formatTime(callDuration)}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-white/40 text-xs mb-1">Status</p>
            <p className="text-sm text-emerald-400 font-medium">✓ Completed</p>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-xs">
          <Link
            href={`/call-user?user=${encodeURIComponent(userName)}&id=${userId}${avatarUrl ? `&avatar=${encodeURIComponent(avatarUrl)}` : ''}`}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium text-center tap-feedback"
            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
          >
            📞 Call Again
          </Link>
          <Link
            href="/clone-connect"
            className="flex-1 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 text-sm font-medium text-center tap-feedback"
          >
            💬 Message
          </Link>
        </div>

        <Link href="/clone-connect" className="mt-6 text-white/20 text-xs hover:text-white/40 transition-colors">
          ← Back to Connect
        </Link>
      </main>
    )
  }

  // ── Call Screen ──
  return (
    <main className="min-h-screen flex flex-col items-center relative" style={{ background: 'linear-gradient(135deg, #050510, #0a0a2e)' }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)', left: '-10%', top: '-10%', animation: 'orbFloat1 15s ease-in-out infinite' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)', right: '-10%', bottom: '-10%', animation: 'orbFloat2 18s ease-in-out infinite' }} />
        <div className="absolute w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animation: 'orbFloat3 12s ease-in-out infinite' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 pt-16 pb-8 flex-1">
        {/* Back button */}
        <Link href="/clone-connect" className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/40 text-sm tap-feedback">←</Link>

        {/* WebRTC note */}
        <div className="mb-4 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400/60 text-[10px] text-center">WebRTC — connect with Firebase for real P2P</p>
        </div>

        {/* Avatar with pulse rings */}
        <div className="relative mb-6">
          {phase === 'ringing' && (
            <>
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-violet-500/30" style={{ animation: 'pulseRing 2s ease-out infinite' }} />
              <div className="absolute inset-0 -m-8 rounded-full border-2 border-violet-500/20" style={{ animation: 'pulseRing 2s ease-out infinite 0.5s' }} />
              <div className="absolute inset-0 -m-12 rounded-full border-2 border-violet-500/10" style={{ animation: 'pulseRing 2s ease-out infinite 1s' }} />
            </>
          )}
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white relative"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: phase === 'connected' ? '0 0 40px rgba(16,185,129,0.3)' : '0 0 40px rgba(139,92,246,0.2)',
            }}
          >
            <div className="absolute inset-[-3px] rounded-full z-[-1]" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899, #10b981)', animation: 'borderRotate 3s linear infinite' }} />
            {avatarUrl ? <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" /> : avatarInitial}
          </div>
          {phase === 'connected' && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-3 border-[#050510] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          )}
        </div>

        {/* User info */}
        <h1 className="text-2xl font-bold text-white mb-1">{userName}</h1>
        <p className="text-white/30 text-sm mb-2">
          {phase === 'ringing' ? 'Calling...' : phase === 'connected' ? 'Connected' : 'Call ended'}
        </p>

        {/* Timer */}
        {phase === 'connected' && (
          <p className="text-3xl font-mono text-white font-bold mb-1" style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            {formatTime(callDuration)}
          </p>
        )}

        {/* Ringing dots */}
        {phase === 'ringing' && (
          <div className="flex gap-2 mb-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-violet-400" style={{ animation: 'blink 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="w-full my-6">
          <div className="flex items-end justify-center gap-[3px] h-24">
            {frequencyData.map((val, i) => {
              const isVoice = val > 0.3
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-75"
                  style={{
                    width: '4px',
                    height: `${Math.max(4, val * 96)}px`,
                    background: isVoice
                      ? `linear-gradient(to top, #10b981, #34d399)`
                      : `linear-gradient(to top, rgba(139,92,246,0.3), rgba(236,72,153,0.2))`,
                    boxShadow: isVoice ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
                    opacity: 0.4 + val * 0.6,
                  }}
                />
              )
            })}
          </div>
          <p className="text-center text-white/15 text-[10px] mt-2">
            {phase === 'connected' ? (isMuted ? '🔇 Muted' : '🎤 Listening...') : '⏳ Connecting...'}
          </p>
        </div>

        {/* Live Transcript */}
        {phase === 'connected' && transcript.length > 0 && (
          <div className="w-full mb-4 max-h-32 overflow-y-auto rounded-xl border border-white/[0.06] p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {transcript.map((line, i) => (
              <p key={i} className={`text-xs ${line.startsWith('You:') ? 'text-emerald-400/70' : 'text-violet-400/70'}`}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Control buttons */}
        {phase === 'connected' && (
          <div className="flex items-center justify-center gap-5 mb-4">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl tap-feedback transition-all ${
                isMuted
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                  : 'bg-white/[0.05] border border-white/[0.06] text-white/60'
              }`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl tap-feedback transition-all ${
                isSpeaker
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                  : 'bg-white/[0.05] border border-white/[0.06] text-white/60'
              }`}
              style={{ backdropFilter: 'blur(10px)' }}
            >
              {isSpeaker ? '🔊' : '🔈'}
            </button>
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback"
              style={{ boxShadow: '0 0 30px rgba(239,68,68,0.5)' }}
            >
              📵
            </button>
          </div>
        )}

        {/* Ringing decline button */}
        {phase === 'ringing' && (
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback"
            style={{ boxShadow: '0 0 30px rgba(239,68,68,0.5)' }}
          >
            📵
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes borderRotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -20px); }
          66% { transform: translate(-20px, 30px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-25px, 25px); }
          66% { transform: translate(25px, -15px); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </main>
  )
}

export default function CallUserPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #050510, #0a0a2e)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Loading call...</p>
        </div>
      </main>
    }>
      <CallUserContent />
    </Suspense>
  )
}
