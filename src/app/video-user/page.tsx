'use client'
import { useState, Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VideoUserPageInner() {
  const searchParams = useSearchParams()
  const userName = searchParams.get('user') || 'Unknown'
  const userId = searchParams.get('id') || '0'

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing')
  const [callTimer, setCallTimer] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCamOn, setIsCamOn] = useState(true)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [controlsVisible, setControlsVisible] = useState(true)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-connect after 3s
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (callState === 'ringing') setCallState('connected')
    }, 3000)
    return () => clearTimeout(timeout)
  }, [callState])

  // Start camera on connect
  useEffect(() => {
    if (callState !== 'connected') return

    timerRef.current = setInterval(() => setCallTimer(p => p + 1), 1000)

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        // Camera not available — show placeholder
      }
    }
    startCamera()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [callState, facingMode])

  // Auto-hide controls
  useEffect(() => {
    if (callState !== 'connected') return
    const resetHide = () => {
      setControlsVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 5000)
    }
    resetHide()
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [callState])

  const toggleMute = () => {
    setIsMuted(prev => {
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => { t.enabled = !prev })
      }
      return !prev
    })
  }

  const toggleCamera = () => {
    setIsCamOn(prev => {
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(t => { t.enabled = !prev })
      }
      return !prev
    })
  }

  const switchCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const endCall = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('cc_user_call_logs') || '[]')
      logs.unshift({
        id: `call_${Date.now()}`,
        userId,
        userName,
        type: 'video',
        duration: callTimer,
        timestamp: new Date().toISOString(),
      })
      localStorage.setItem('cc_user_call_logs', JSON.stringify(logs.slice(0, 50)))
    } catch {}
    setCallState('ended')
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
  }

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <main className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Ended state */}
      {callState === 'ended' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #050510, #080820)' }}>
          <div className="text-6xl mb-4">📵</div>
          <h2 className="text-xl font-bold text-white mb-1">Video Call Ended</h2>
          <p className="text-white/30 text-sm mb-2">{userName}</p>
          <p className="text-white/20 text-sm mb-8">Duration: {formatTimer(callTimer)}</p>
          <Link href="/clone-connect" className="px-6 py-3 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 text-sm tap-feedback hover:text-white transition-colors">
            Back to Connect
          </Link>
        </div>
      )}

      {/* Ringing state */}
      {callState === 'ringing' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #050510, #080820, #0d0520)' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-96 h-96 rounded-full top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 opacity-20" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)' }} />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full" style={{ animation: 'video-pulse 2s ease-out infinite', background: 'rgba(139,92,246,0.15)' }} />
              <div className="absolute inset-0 rounded-full" style={{ animation: 'video-pulse 2s ease-out 0.5s infinite', background: 'rgba(139,92,246,0.1)' }} />
              <div className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl" style={{ background: 'rgba(139,92,246,0.12)', boxShadow: '0 0 60px rgba(139,92,246,0.15)' }}>
                {userName[0]?.toUpperCase()}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
            <p className="text-violet-400/70 text-sm mb-6">📹 Video Calling...</p>
            <div className="flex gap-2 mb-12">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-violet-400" style={{ animation: 'ring-dot 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
            <button onClick={endCall} className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback" style={{ boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}>
              📵
            </button>
          </div>
        </div>
      )}

      {/* Connected — Full screen "their" video area */}
      {callState === 'connected' && (
        <>
          {/* Their video placeholder (full screen) */}
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #0a0a1e, #050510, #0d0520)' }} onClick={() => setControlsVisible(p => !p)}>
            {/* Simulated "their" video with animated gradient */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.1), transparent 60%)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center text-5xl mb-4" style={{ background: 'rgba(139,92,246,0.1)', boxShadow: '0 0 80px rgba(139,92,246,0.1)' }}>
                {userName[0]?.toUpperCase()}
              </div>
              <p className="text-white/30 text-sm">{userName}</p>
              <p className="text-violet-400/30 text-[10px] mt-1">Camera simulated</p>
            </div>
          </div>

          {/* Gradient overlay top */}
          <div className="absolute top-0 left-0 right-0 h-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }} />

          {/* PIP — My camera (bottom-right) */}
          <div className="absolute bottom-28 right-4 z-20 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl" style={{ background: 'rgba(0,0,0,0.8)' }}>
            {isCamOn ? (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-white/20 text-[9px]">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 right-1 flex justify-center">
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-white/50 text-[8px]">You</span>
            </div>
          </div>

          {/* Top bar — name + timer */}
          <div className={`absolute top-0 left-0 right-0 z-30 px-4 pt-4 pb-6 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between">
              <Link href="/clone-connect" className="w-9 h-9 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-md border border-white/[0.08] text-white/60 tap-feedback">
                ←
              </Link>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">{userName}</p>
                <p className="text-emerald-400 text-[10px] font-mono">{formatTimer(callTimer)} • 🟢 Connected</p>
              </div>
              <div className="w-9" /> {/* Spacer */}
            </div>
          </div>

          {/* Bottom controls */}
          <div className={`absolute bottom-0 left-0 right-0 z-30 px-6 pb-8 pt-12 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg tap-feedback transition-all ${
                  isMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 backdrop-blur-md text-white/70 border border-white/10'
                }`}
              >
                {isMuted ? '🔇' : '🎤'}
              </button>

              <button
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg tap-feedback transition-all ${
                  !isCamOn ? 'bg-red-500/80 text-white' : 'bg-white/10 backdrop-blur-md text-white/70 border border-white/10'
                }`}
              >
                {isCamOn ? '📹' : '📷'}
              </button>

              <button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl text-white tap-feedback"
                style={{ boxShadow: '0 0 30px rgba(239,68,68,0.5)' }}
              >
                📵
              </button>

              <button
                onClick={switchCamera}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white/70 border border-white/10 flex items-center justify-center text-lg tap-feedback"
              >
                🔄
              </button>

              <button
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white/70 border border-white/10 flex items-center justify-center text-lg tap-feedback"
              >
                ⚙️
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes video-pulse {
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

export default function VideoUserPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050510] flex items-center justify-center"><div className="text-white/40">Loading...</div></main>}>
      <VideoUserPageInner />
    </Suspense>
  )
}
