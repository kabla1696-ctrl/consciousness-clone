'use client'
import { useState, Suspense, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VoiceUserPageInner() {
  const searchParams = useSearchParams()
  const userName = searchParams.get('user') || 'Unknown'
  const userId = searchParams.get('id') || '0'

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing')
  const [callTimer, setCallTimer] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [myWaveHeights, setMyWaveHeights] = useState<number[]>(Array(30).fill(3))
  const [theirWaveHeights, setTheirWaveHeights] = useState<number[]>(Array(30).fill(3))

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const waveRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Auto-connect after 3 seconds of ringing
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (callState === 'ringing') {
        setCallState('connected')
      }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [callState])

  // Start mic + waveform on connect
  useEffect(() => {
    if (callState !== 'connected') return

    // Start timer
    timerRef.current = setInterval(() => {
      setCallTimer(prev => prev + 1)
    }, 1000)

    // Get mic access
    const startMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const ctx = new AudioContext()
        audioCtxRef.current = ctx
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        source.connect(analyser)
        analyserRef.current = analyser

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateWave = () => {
          analyser.getByteFrequencyData(dataArray)
          const step = Math.floor(dataArray.length / 30)
          const heights = Array.from({ length: 30 }, (_, i) => {
            const val = dataArray[i * step] || 0
            return Math.max(3, (val / 255) * 50)
          })
          if (!isMuted) {
            setMyWaveHeights(heights)
          }
          animFrameRef.current = requestAnimationFrame(updateWave)
        }
        updateWave()
      } catch {
        // No mic access — simulate
        simulateWaves()
      }
    }

    startMic()

    // Simulate their voice wave
    waveRef.current = setInterval(() => {
      setTheirWaveHeights(prev => prev.map(() => Math.max(3, Math.random() * 45)))
    }, 200)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveRef.current) clearInterval(waveRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [callState])

  // Simulate waves if no mic
  const simulateWaves = useCallback(() => {
    waveRef.current = setInterval(() => {
      if (!isMuted) {
        setMyWaveHeights(prev => prev.map(() => Math.max(3, Math.random() * 40)))
      }
      setTheirWaveHeights(prev => prev.map(() => Math.max(3, Math.random() * 45)))
    }, 200)
  }, [isMuted])

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => { t.enabled = !next })
      }
      if (next) {
        setMyWaveHeights(Array(30).fill(3))
      }
      return next
    })
  }

  const endCall = () => {
    // Save call log
    try {
      const logs = JSON.parse(localStorage.getItem('cc_user_call_logs') || '[]')
      logs.unshift({
        id: `call_${Date.now()}`,
        userId,
        userName,
        type: 'voice',
        duration: callTimer,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('cc_user_call_logs', JSON.stringify(logs.slice(0, 50)))
    } catch {}
    setCallState('ended')
    // Cleanup
    if (timerRef.current) clearInterval(timerRef.current)
    if (waveRef.current) clearInterval(waveRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
  }

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <main className="min-h-screen bg-[#050510] flex flex-col items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #050510, #080820, #050510)' }}>
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-30" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)' }} />
        <div className="absolute w-80 h-80 rounded-full bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-30" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)' }} />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/clone-connect" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 tap-feedback hover:text-white transition-colors">
          ←
        </Link>
      </div>

      {/* Ended state */}
      {callState === 'ended' && (
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <div aria-hidden="true" className="text-6xl mb-4">📵</div>
          <h2 className="text-xl font-bold text-white mb-1">Call Ended</h2>
          <p className="text-white/30 text-sm mb-2">{userName}</p>
          <p className="text-white/20 text-sm mb-8">Duration: {formatTimer(callTimer)}</p>
          <Link href="/clone-connect" className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 text-sm tap-feedback hover:text-white transition-colors">
            Back to Connect
          </Link>
        </div>
      )}

      {/* Ringing state */}
      {callState === 'ringing' && (
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Pulsing avatar */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full" style={{ animation: 'ring-pulse 2s ease-out infinite', background: 'rgba(16,185,129,0.15)' }} />
            <div className="absolute inset-0 rounded-full" style={{ animation: 'ring-pulse 2s ease-out 0.5s infinite', background: 'rgba(16,185,129,0.1)' }} />
            <div aria-hidden="true" className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl" style={{ background: 'rgba(16,185,129,0.12)', boxShadow: '0 0 60px rgba(16,185,129,0.15)' }}>
              {userName[0]?.toUpperCase()}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
          <p className="text-emerald-400/70 text-sm mb-6">Voice Calling...</p>

          {/* Ringing dots */}
          <div className="flex gap-2 mb-12">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2.5 h-2.5 rounded-full bg-emerald-400" style={{ animation: 'ring-dot 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
            ))}
          </div>

          {/* End call button */}
          <button onClick={endCall} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback" style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}>
            📵
          </button>
        </div>
      )}

      {/* Connected state */}
      {callState === 'connected' && (
        <div className="relative z-10 flex flex-col items-center w-full px-6">
          {/* Avatar + name */}
          <div className="mb-2 mt-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto" style={{ background: 'rgba(16,185,129,0.12)', boxShadow: '0 0 40px rgba(16,185,129,0.1)' }}>
              {userName[0]?.toUpperCase()}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{userName}</h2>
          <p className="text-emerald-400 text-sm font-mono mb-1">{formatTimer(callTimer)}</p>
          <p className="text-emerald-400/40 text-[10px] mb-6">🟢 Connected</p>

          {/* Their waveform */}
          <div className="w-full max-w-md mb-4">
            <p className="text-white/20 text-[10px] mb-2 text-center uppercase tracking-wider">{userName}</p>
            <div className="flex items-end justify-center gap-[3px] h-16 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] py-3">
              {theirWaveHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[6px] rounded-full transition-all duration-150"
                  style={{
                    height: `${h}px`,
                    background: 'linear-gradient(to top, rgba(59,130,246,0.4), rgba(59,130,246,0.8))',
                    boxShadow: h > 20 ? '0 0 8px rgba(59,130,246,0.3)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* My waveform */}
          <div className="w-full max-w-md mb-8">
            <p className="text-white/20 text-[10px] mb-2 text-center uppercase tracking-wider">You</p>
            <div className="flex items-end justify-center gap-[3px] h-16 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] py-3">
              {myWaveHeights.map((h, i) => (
                <div
                  key={i}
                  className="w-[6px] rounded-full transition-all duration-150"
                  style={{
                    height: `${h}px`,
                    background: isMuted
                      ? 'rgba(255,255,255,0.1)'
                      : `linear-gradient(to top, rgba(16,185,129,0.4), rgba(16,185,129,0.8))`,
                    boxShadow: !isMuted && h > 20 ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 tap-feedback transition-all ${
                isMuted
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                  : 'bg-white/[0.05] border border-white/[0.06] text-white/60'
              }`}
            >
              <span className="text-lg">{isMuted ? '🔇' : '🎤'}</span>
              <span className="text-[8px]">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback"
              style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
            >
              📵
            </button>

            <button
              onClick={() => setIsSpeaker(prev => !prev)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 tap-feedback transition-all ${
                isSpeaker
                  ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                  : 'bg-white/[0.05] border border-white/[0.06] text-white/60'
              }`}
            >
              <span className="text-lg">{isSpeaker ? '🔊' : '🔈'}</span>
              <span className="text-[8px]">Speaker</span>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes ring-dot {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </main>
  )
}

export default function VoiceUserPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="text-white/40">Loading...</div></main>}>
      <VoiceUserPageInner />
    </Suspense>
  )
}
