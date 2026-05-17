'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../../lib/language-context'

interface HeartbeatMemory {
  id: string
  content: string
  bpm: number
  emotion: string
  emotionIcon: string
  created_at: string
}

const EMOTIONS = [
  { label: 'Calm', icon: '😌', min: 0, max: 70, color: 'from-blue-500 to-cyan-400' },
  { label: 'Normal', icon: '🙂', min: 70, max: 90, color: 'from-green-500 to-emerald-400' },
  { label: 'Excited', icon: '😃', min: 90, max: 110, color: 'from-yellow-500 to-orange-400' },
  { label: 'Intense', icon: '🔥', min: 110, max: 300, color: 'from-red-500 to-pink-500' },
]

function getEmotion(bpm: number) {
  return EMOTIONS.find(e => bpm >= e.min && bpm < e.max) || EMOTIONS[2]
}

export default function HeartbeatMemory() {
  const t = useT()
  const [user, setUser] = useState(true)
  const [view, setView] = useState<'measure' | 'history' | 'add'>('measure')
  const [measuring, setMeasuring] = useState(false)
  const [bpm, setBpm] = useState(0)
  const [rawValues, setRawValues] = useState<number[]>([])
  const [peaks, setPeaks] = useState<number[]>([])
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [memories, setMemories] = useState<HeartbeatMemory[]>([])
  const [newMemoryText, setNewMemoryText] = useState('')
  const [recordBpm, setRecordBpm] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [pulseScale, setPulseScale] = useState(1)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([])
  const [displayBpm, setDisplayBpm] = useState(0)
  const [wavePoints, setWavePoints] = useState<number[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const bpmIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const valuesRef = useRef<number[]>([])
  const lastPeakTimeRef = useRef<number[]>([])

  // Generate floating particles
  useEffect(() => {
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 10,
    }))
    setParticles(p)
  }, [])

  // Generate ECG wave points
  useEffect(() => {
    const generateWave = () => {
      const points: number[] = []
      for (let i = 0; i < 100; i++) {
        const t = i / 100
        // ECG-like waveform
        let y = 50
        const cycle = (t * 4) % 1
        if (cycle > 0.3 && cycle < 0.35) y = 50 - 15 // P wave
        else if (cycle > 0.4 && cycle < 0.42) y = 50 + 8 // Q
        else if (cycle > 0.42 && cycle < 0.48) y = 50 - 60 // R peak
        else if (cycle > 0.48 && cycle < 0.5) y = 50 + 12 // S
        else if (cycle > 0.55 && cycle < 0.65) y = 50 - 10 // T wave
        else y = 50 + (Math.random() - 0.5) * 2 // baseline noise
        points.push(y)
      }
      setWavePoints(points)
    }
    generateWave()
    const id = setInterval(generateWave, 2000)
    return () => clearInterval(id)
  }, [])

  // Smooth BPM counter animation
  useEffect(() => {
    if (bpm > 0) {
      const step = () => {
        setDisplayBpm(prev => {
          const diff = bpm - prev
          if (Math.abs(diff) < 1) return bpm
          return prev + diff * 0.1
        })
      }
      const id = setInterval(step, 50)
      return () => clearInterval(id)
    } else {
      setDisplayBpm(0)
    }
  }, [bpm])

  useEffect(() => {
    const stored = localStorage.getItem('heartbeat-memories')
    if (stored) setMemories(JSON.parse(stored))
  }, [])

  // Pulse animation
  useEffect(() => {
    if (measuring && bpm > 0) {
      const interval = 60000 / bpm
      const pulseAnim = () => {
        setPulseScale(1.15)
        setTimeout(() => setPulseScale(1), interval * 0.3)
      }
      pulseAnim()
      const id = setInterval(pulseAnim, interval)
      return () => clearInterval(id)
    }
  }, [measuring, bpm])

  const startCamera = async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch (err: any) {
      setCameraError('Camera access denied. Please allow camera permission.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (bpmIntervalRef.current) clearInterval(bpmIntervalRef.current)
    setCameraReady(false)
  }

  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !measuring) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    let redSum = 0
    let count = 0
    for (let i = 0; i < data.length; i += 16) {
      redSum += data[i]
      count++
    }
    const avgRed = redSum / count

    valuesRef.current.push(avgRed)
    if (valuesRef.current.length > 300) valuesRef.current.shift()

    const vals = valuesRef.current
    if (vals.length > 10) {
      const recent = vals.slice(-10)
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length
      const lastVal = vals[vals.length - 1]
      const prevVal = vals[vals.length - 2]

      if (lastVal > prevVal && lastVal > mean + 3) {
        const now = Date.now()
        const lastPeak = lastPeakTimeRef.current[lastPeakTimeRef.current.length - 1]
        if (!lastPeak || now - lastPeak > 400) {
          lastPeakTimeRef.current.push(now)
          if (lastPeakTimeRef.current.length > 10) lastPeakTimeRef.current.shift()
        }
      }
    }

    const pTimes = lastPeakTimeRef.current
    if (pTimes.length >= 2) {
      const intervals = []
      for (let i = 1; i < pTimes.length; i++) {
        intervals.push(pTimes[i] - pTimes[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      if (calculatedBpm > 30 && calculatedBpm < 220) {
        setBpm(calculatedBpm)
      }
    }

    setRawValues([...valuesRef.current])
    animFrameRef.current = requestAnimationFrame(processFrame)
  }, [measuring])

  const startMeasuring = async () => {
    await startCamera()
    setMeasuring(true)
    setBpm(0)
    valuesRef.current = []
    lastPeakTimeRef.current = []
  }

  const stopMeasuring = () => {
    setMeasuring(false)
    stopCamera()
  }

  useEffect(() => {
    if (measuring && cameraReady) {
      animFrameRef.current = requestAnimationFrame(processFrame)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [measuring, cameraReady, processFrame])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const addMemory = () => {
    if (!newMemoryText.trim()) return
    const emotion = recordBpm ? getEmotion(bpm) : { label: 'Manual', icon: '📝', color: 'from-violet-500 to-purple-400' }
    const memory: HeartbeatMemory = {
      id: Date.now().toString(),
      content: newMemoryText.trim(),
      bpm: recordBpm ? bpm : 0,
      emotion: emotion.label,
      emotionIcon: emotion.icon,
      created_at: new Date().toISOString(),
    }
    const updated = [memory, ...memories]
    setMemories(updated)
    localStorage.setItem('heartbeat-memories', JSON.stringify(updated))
    setNewMemoryText('')
    setShowAdd(false)
    setView('history')
  }

  const deleteMemory = (id: string) => {
    const updated = memories.filter(m => m.id !== id)
    setMemories(updated)
    localStorage.setItem('heartbeat-memories', JSON.stringify(updated))
  }

  const getEmotionColor = (emotion: string) => {
    const e = EMOTIONS.find(em => em.label === emotion)
    return e?.color || 'from-violet-500 to-purple-400'
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition relative">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: 'radial-gradient(circle, rgba(239,68,68,0.3), transparent)',
              animation: `float-particle ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-sm shadow-lg shadow-red-500/30">🫀</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">{t('heartbeat')} {t('memory')}</h1>
            <p className="text-[10px] text-red-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              {measuring ? `Measuring... ${bpm > 0 ? bpm + ' BPM' : ''}` : 'Capture your heartbeat'}
            </p>
          </div>
          <button
            onClick={() => setView(view === 'history' ? 'measure' : 'history')}
            className="text-white/40 hover:text-red-400 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full relative z-10">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          {(['measure', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                view === tab
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.05]'
              }`}
            >
              {tab === 'measure' ? '🫀 Measure' : '📜 History'}
            </button>
          ))}
        </div>

        {/* Measure View */}
        {view === 'measure' && (
          <div className="space-y-6">
            {/* Heart Visualization with Gradient Glow */}
            <div className="flex flex-col items-center py-8">
              {/* Gradient glow behind heart */}
              <div className="relative">
                <div
                  className="absolute inset-0 -m-8 rounded-full opacity-60 blur-3xl"
                  style={{
                    background: measuring && bpm > 0
                      ? 'radial-gradient(circle, rgba(239,68,68,0.4), rgba(236,72,153,0.2), transparent)'
                      : 'radial-gradient(circle, rgba(239,68,68,0.15), transparent)',
                    animation: bpm > 0 ? `glow-pulse ${60 / Math.max(bpm, 60)}s ease-in-out infinite` : 'none',
                  }}
                />
                <div
                  className="relative transition-transform duration-200"
                  style={{ transform: `scale(${pulseScale})` }}
                >
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center relative backdrop-blur-sm border border-red-500/10">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10"
                      style={{ animation: bpm > 0 ? `ping ${60 / bpm}s cubic-bezier(0,0,0.2,1) infinite` : 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }}
                    />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-500/5 to-pink-500/5" />
                    <span className="text-5xl relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">🫀</span>
                  </div>
                </div>
              </div>

              {/* Smooth BPM Counter */}
              <div className="mt-8 text-center">
                {bpm > 0 ? (
                  <>
                    <div className="relative">
                      <div className="text-6xl font-black tabular-nums bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]">
                        {Math.round(displayBpm)}
                      </div>
                      <div className="absolute inset-0 text-6xl font-black tabular-nums text-red-500/10 blur-lg">
                        {Math.round(displayBpm)}
                      </div>
                    </div>
                    <div className="text-xs text-white/40 mt-2 uppercase tracking-[0.3em] font-medium">{t('bpm')}</div>
                    <div className="mt-3 flex items-center gap-2 justify-center">
                      <span className="text-xl drop-shadow-lg">{getEmotion(bpm).icon}</span>
                      <span className={`text-sm font-semibold bg-gradient-to-r ${getEmotion(bpm).color} bg-clip-text text-transparent`}>
                        {getEmotion(bpm).label}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-white/30 text-sm">
                    {measuring ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        {t('camera')} {t('detection')}...
                      </span>
                    ) : t('heart rate')}
                  </div>
                )}
              </div>
            </div>

            {/* Camera Feed (hidden but active) */}
            <div className="hidden">
              <video ref={videoRef} playsInline muted className="w-full" />
              <canvas ref={canvasRef} width={160} height={120} />
            </div>

            {cameraError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
                {cameraError}
              </div>
            )}

            {/* Controls */}
            <div className="space-y-3">
              {!measuring ? (
                <button
                  onClick={startMeasuring}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm shadow-xl shadow-red-500/30 active:scale-[0.98] transition-all hover:shadow-red-500/40 hover:scale-[1.01] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-lg">📸</span>
                    {t('heart rate')} {t('detection')}
                  </span>
                  <span className="relative block text-xs text-white/60 mt-1">{t('camera')} {t('detection')}</span>
                </button>
              ) : (
                <button
                  onClick={stopMeasuring}
                  className="w-full py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-semibold text-sm active:scale-[0.98] transition backdrop-blur-sm hover:bg-white/[0.08]"
                >
                  Stop Measuring
                </button>
              )}

              {bpm > 0 && !measuring && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 font-medium text-sm active:scale-[0.98] transition backdrop-blur-sm hover:from-violet-500/30 hover:to-purple-500/30"
                >
                  💾 Save This Heartbeat with a Memory
                </button>
              )}
            </div>

            {/* Animated Pulse Wave (ECG-style) */}
            {measuring && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  Live Pulse Wave
                </p>
                <div className="h-24 relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(239,68,68,0)" />
                        <stop offset="30%" stopColor="rgba(239,68,68,0.8)" />
                        <stop offset="70%" stopColor="rgba(236,72,153,0.8)" />
                        <stop offset="100%" stopColor="rgba(236,72,153,0)" />
                      </linearGradient>
                      <linearGradient id="waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(239,68,68,0.3)" />
                        <stop offset="100%" stopColor="rgba(239,68,68,0)" />
                      </linearGradient>
                    </defs>
                    {/* Fill area */}
                    <path
                      d={`M ${wavePoints.map((y, i) => `${i},${y}`).join(' L ')} L 100,100 L 0,100 Z`}
                      fill="url(#waveFill)"
                    />
                    {/* Main line */}
                    <path
                      d={`M ${wavePoints.map((y, i) => `${i},${y}`).join(' L ')}`}
                      fill="none"
                      stroke="url(#waveGrad)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        from="200"
                        to="0"
                        dur={`${60 / Math.max(bpm, 60)}s`}
                        repeatCount="indefinite"
                      />
                    </path>
                    {/* Glow effect */}
                    <path
                      d={`M ${wavePoints.map((y, i) => `${i},${y}`).join(' L ')}`}
                      fill="none"
                      stroke="rgba(239,68,68,0.3)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      filter="blur(3px)"
                    />
                  </svg>
                  {/* Scanning line */}
                  <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-400 to-transparent animate-[scan_2s_linear_infinite]" />
                </div>
              </div>
            )}

            {/* Live Signal Bars */}
            {measuring && rawValues.length > 5 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Raw Signal</p>
                <div className="h-20 flex items-end gap-px">
                  {rawValues.slice(-80).map((v, i) => {
                    const min = Math.min(...rawValues.slice(-80))
                    const max = Math.max(...rawValues.slice(-80))
                    const range = max - min || 1
                    const height = ((v - min) / range) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t-sm transition-all duration-75"
                        style={{
                          height: `${Math.max(5, height)}%`,
                          opacity: 0.4 + (i / 80) * 0.6,
                          background: `linear-gradient(to top, rgba(239,68,68,${0.6 + (i / 80) * 0.4}), rgba(236,72,153,${0.4 + (i / 80) * 0.4}))`,
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add Memory Modal */}
            {showAdd && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-4 backdrop-blur-xl shadow-2xl shadow-violet-500/5">
                <h3 className="text-sm font-semibold text-white/80">Add a Memory</h3>
                <textarea
                  value={newMemoryText}
                  onChange={e => setNewMemoryText(e.target.value)}
                  placeholder="What are you feeling right now? What made your heart race?"
                  className="w-full h-24 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/40 transition"
                />
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setRecordBpm(!recordBpm)}
                    className={`w-10 h-6 rounded-full transition relative ${recordBpm ? 'bg-red-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${recordBpm ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-sm text-white/60">Record BPM ({bpm})</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAdd(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-white/40 text-sm hover:bg-white/[0.06] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMemory}
                    disabled={!newMemoryText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium disabled:opacity-30 shadow-lg shadow-red-500/20"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History View */}
        {view === 'history' && (
          <div className="space-y-3">
            {memories.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]">🫀</div>
                <p className="text-white/30 text-sm">No heartbeat memories yet</p>
                <button
                  onClick={() => setView('measure')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 text-sm hover:from-red-500/30 hover:to-pink-500/30 transition-all"
                >
                  Measure Your First Heartbeat
                </button>
              </div>
            ) : (
              memories.map((m, idx) => {
                const ec = getEmotionColor(m.emotion)
                return (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 group backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300 hover:border-white/[0.1] hover:shadow-lg hover:shadow-red-500/5"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.emotionIcon}</span>
                        <span className={`text-xs font-medium bg-gradient-to-r ${ec} bg-clip-text text-transparent`}>
                          {m.emotion}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMemory(m.id)}
                        className="text-white/10 hover:text-red-400 transition p-1 opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{m.content}</p>
                    {m.bpm > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                          <span className="text-red-400 text-xs">🫀</span>
                          <span className="text-sm font-bold text-red-300">{m.bpm}</span>
                          <span className="text-[10px] text-white/30">{t('bpm')}</span>
                        </div>
                        <div className="h-3 w-px bg-white/10" />
                        <p className="text-xs text-white/30 italic">
                          &ldquo;This memory made your heart race at {m.bpm} BPM&rdquo;
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] text-white/20 mt-2">
                      {new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )
              })
            )}

            {memories.length > 0 && (
              <button
                onClick={() => { setNewMemoryText(''); setRecordBpm(false); setShowAdd(true); setView('measure') }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-300/60 text-sm hover:border-red-500/40 hover:from-red-500/20 hover:to-pink-500/20 transition-all"
              >
                + Add Manual Memory
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float-particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scan {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </main>
  )
}
