'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'

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

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const bpmIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const valuesRef = useRef<number[]>([])
  const lastPeakTimeRef = useRef<number[]>([])

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

    // Simple peak detection
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

    // Calculate BPM from peaks
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
    <main className="min-h-screen flex flex-col bg-[#050510] page-transition">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-sm">🫀</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold">Heartbeat Memory</h1>
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

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          {(['measure', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                view === tab
                  ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border border-red-500/30'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.06]'
              }`}
            >
              {tab === 'measure' ? '🫀 Measure' : '📜 History'}
            </button>
          ))}
        </div>

        {/* Measure View */}
        {view === 'measure' && (
          <div className="space-y-6">
            {/* Heart Visualization */}
            <div className="flex flex-col items-center py-8">
              <div
                className="relative transition-transform duration-200"
                style={{ transform: `scale(${pulseScale})` }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 animate-ping" style={{ animationDuration: bpm > 0 ? `${60 / bpm}s` : '2s' }} />
                  <span className="text-5xl relative z-10">🫀</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                {bpm > 0 ? (
                  <>
                    <div className="text-5xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                      {bpm}
                    </div>
                    <div className="text-xs text-white/40 mt-1 uppercase tracking-widest">BPM</div>
                    <div className="mt-2 flex items-center gap-2 justify-center">
                      <span className="text-lg">{getEmotion(bpm).icon}</span>
                      <span className={`text-sm font-medium bg-gradient-to-r ${getEmotion(bpm).color} bg-clip-text text-transparent`}>
                        {getEmotion(bpm).label}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-white/30 text-sm">
                    {measuring ? 'Place finger on camera lens...' : 'Start measuring to see BPM'}
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
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                {cameraError}
              </div>
            )}

            {/* Controls */}
            <div className="space-y-3">
              {!measuring ? (
                <button
                  onClick={startMeasuring}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.98] transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">📸</span>
                    Start Heart Rate Measurement
                  </span>
                  <span className="block text-xs text-white/60 mt-1">Place finger on camera lens</span>
                </button>
              ) : (
                <button
                  onClick={stopMeasuring}
                  className="w-full py-4 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-white font-semibold text-sm active:scale-[0.98] transition"
                >
                  Stop Measuring
                </button>
              )}

              {bpm > 0 && !measuring && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-300 font-medium text-sm active:scale-[0.98] transition"
                >
                  💾 Save This Heartbeat with a Memory
                </button>
              )}
            </div>

            {/* Live Waveform */}
            {measuring && rawValues.length > 5 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-xs text-white/30 mb-3 uppercase tracking-wider">Live Signal</p>
                <div className="h-20 flex items-end gap-px overflow-hidden">
                  {rawValues.slice(-80).map((v, i) => {
                    const min = Math.min(...rawValues.slice(-80))
                    const max = Math.max(...rawValues.slice(-80))
                    const range = max - min || 1
                    const height = ((v - min) / range) * 100
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-red-500 to-pink-400 rounded-t-sm transition-all duration-75"
                        style={{ height: `${Math.max(5, height)}%`, opacity: 0.4 + (i / 80) * 0.6 }}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add Memory Modal */}
            {showAdd && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
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
                    className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-white/40 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addMemory}
                    disabled={!newMemoryText.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium disabled:opacity-30"
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
                <div className="text-4xl mb-3">🫀</div>
                <p className="text-white/30 text-sm">No heartbeat memories yet</p>
                <button
                  onClick={() => setView('measure')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 text-sm"
                >
                  Measure Your First Heartbeat
                </button>
              </div>
            ) : (
              memories.map(m => {
                const ec = getEmotionColor(m.emotion)
                return (
                  <div key={m.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 group">
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
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-400 text-xs">🫀</span>
                          <span className="text-sm font-bold text-red-300">{m.bpm}</span>
                          <span className="text-[10px] text-white/30">BPM</span>
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
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 text-red-300/60 text-sm hover:border-red-500/40 transition"
              >
                + Add Manual Memory
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
