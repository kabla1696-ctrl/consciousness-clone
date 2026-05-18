'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'

interface Message { id: string; role: 'user' | 'clone'; text: string; timestamp: number }
interface Memory { title?: string; content?: string; text?: string; [key: string]: unknown }
interface CallLog { id: string; duration: number; messageCount: number; timestamp: string; preview: string[] }
interface SpeechRecognitionEvent { resultIndex: number; results: SpeechRecognitionResultList }
interface SpeechRecognitionErrorEvent extends Event { error: string }
interface SpeechRecognitionInstance {
  continuous: boolean; interimResults: boolean; lang: string; maxAlternatives: number
  start(): void; stop(): void; abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

export default function CloneVoiceCallPage() {
  const t = useT()
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [callTimer, setCallTimer] = useState(0)
  const [cloneName, setCloneName] = useState('Your Clone')
  const [memories, setMemories] = useState<Memory[]>([])
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(30).fill(5))

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const waveRef = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const loopActiveRef = useRef(false)
  const messagesRef = useRef<Message[]>([])

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Load clone name & memories on mount
  useEffect(() => {
    const name = localStorage.getItem('cc_user_name') || 'Your Clone'
    setCloneName(name)
    const mem = localStorage.getItem('cc_memories')
    if (mem) {
      try { setMemories(JSON.parse(mem).slice(0, 20)) } catch {}
    }
  }, [])

  // Wave animation
  useEffect(() => {
    if (callState === 'connected' && (isListening || isSpeaking)) {
      waveRef.current = setInterval(() => {
        setWaveHeights(Array.from({ length: 30 }, () => 5 + Math.random() * (isSpeaking ? 45 : 30)))
      }, 100)
    } else {
      setWaveHeights(Array(30).fill(5))
    }
    return () => { if (waveRef.current) clearInterval(waveRef.current) }
  }, [callState, isListening, isSpeaking])

  // Call timer
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [callState])

  // Stop loop when call ends
  useEffect(() => {
    if (callState === 'ended' || callState === 'idle') {
      loopActiveRef.current = false
    }
  }, [callState])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // Play beep sound via AudioContext
  const playBeep = useCallback((freq: number, duration: number) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + duration / 1000)
    } catch {}
  }, [])

  // Get AI response
  const getCloneResponse = useCallback(async (userText: string, recentMsgs: Message[]) => {
    const memoryContext = memories.length > 0
      ? `\n\nUser's memories for context:\n${memories.map((m: Memory) => `- ${m.title}: ${m.content?.slice(0, 100)}`).join('\n')}`
      : ''

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are ${cloneName}'s consciousness clone on a LIVE VOICE CALL. Keep responses SHORT (1-2 sentences), natural, warm. You're talking LIVE, not writing. Be personal, reference their memories when relevant.${memoryContext}` },
            ...recentMsgs.slice(-6).map(m => ({ role: m.role === 'clone' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: userText }
          ]
        })
      })
      const data = await res.json()
      // API returns { reply } format
      return data.reply || data.choices?.[0]?.message?.content || "I'm here with you. Tell me more."
    } catch {
      return "I'm sorry, I couldn't process that. Can you say it again?"
    }
  }, [cloneName, memories])

  // Speak text using SpeechSynthesis
  const speakText = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return }
      window.speechSynthesis.cancel()

      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1.05
      utter.pitch = 1
      utter.volume = 0.9

      // Pick a good voice
      const voices = window.speechSynthesis.getVoices()
      const goodVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'))
        || voices.find(v => v.lang.startsWith('en') && v.localService)
        || voices.find(v => v.lang.startsWith('en'))
      if (goodVoice) utter.voice = goodVoice

      utter.onstart = () => setIsSpeaking(true)
      utter.onend = () => { setIsSpeaking(false); resolve() }
      utter.onerror = () => { setIsSpeaking(false); resolve() }
      window.speechSynthesis.speak(utter)
    })
  }, [])

  // Listen for speech using Web Speech API
  const listenForSpeech = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const window_ = window as unknown as Record<string, SpeechRecognitionConstructor | undefined>
      const SpeechRecognition = window_.SpeechRecognition || window_.webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert('Speech Recognition is not supported in this browser. Please use Chrome.')
        resolve('')
        return
      }

      // Cancel any ongoing synthesis so we can listen
      window.speechSynthesis?.cancel()

      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1
      recognitionRef.current = recognition

      let finalText = ''

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        setTranscript(finalText || interim)
      }

      recognition.onend = () => {
        setIsListening(false)
        setTranscript('')
        resolve(finalText.trim())
      }

      recognition.onerror = (_e: SpeechRecognitionErrorEvent) => {
        setIsListening(false)
        setTranscript('')
        // On 'no-speech' or 'aborted', just resolve empty — loop will retry
        resolve(finalText.trim() || '')
      }

      setIsListening(true)
      setTranscript('')
      try {
        recognition.start()
      } catch {
        setIsListening(false)
        resolve('')
      }
    })
  }, [])

  // Conversation loop — uses refs to avoid stale closures
  const conversationLoop = useCallback(async () => {
    while (loopActiveRef.current) {
      try {
        // Listen for user speech
        const userText = await listenForSpeech()
        if (!loopActiveRef.current) break

        if (!userText) {
          // No speech detected, small pause then retry
          await new Promise(r => setTimeout(r, 500))
          continue
        }

        // Add user message
        const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: userText, timestamp: Date.now() }
        setMessages(prev => {
          const updated = [...prev, userMsg]
          messagesRef.current = updated
          return updated
        })

        // Get clone response (pass current messages)
        const currentMsgs = [...messagesRef.current]
        const cloneText = await getCloneResponse(userText, currentMsgs)
        if (!loopActiveRef.current) break

        // Add clone message
        const cloneMsg: Message = { id: `c-${Date.now()}`, role: 'clone', text: cloneText, timestamp: Date.now() }
        setMessages(prev => {
          const updated = [...prev, cloneMsg]
          messagesRef.current = updated
          return updated
        })

        // Speak the response
        await speakText(cloneText)
        if (!loopActiveRef.current) break

        // Small pause before next listen cycle
        await new Promise(r => setTimeout(r, 300))
      } catch {
        if (!loopActiveRef.current) break
        await new Promise(r => setTimeout(r, 1000))
      }
    }
  }, [listenForSpeech, getCloneResponse, speakText])

  // Start call
  const startCall = useCallback(async () => {
    setCallState('ringing')
    setMessages([])
    setCallTimer(0)

    // Ring beeps
    playBeep(440, 200)
    setTimeout(() => playBeep(440, 200), 400)
    setTimeout(() => playBeep(440, 200), 800)

    setTimeout(async () => {
      setCallState('connected')
      loopActiveRef.current = true

      // Clone greets first
      const greetText = `Hey! It's ${cloneName}. Great to hear from you! How are you feeling today?`
      const greetMsg: Message = { id: `c-greet-${Date.now()}`, role: 'clone', text: greetText, timestamp: Date.now() }
      setMessages([greetMsg])
      messagesRef.current = [greetMsg]
      await speakText(greetText)

      // Start conversation loop
      if (loopActiveRef.current) {
        conversationLoop()
      }
    }, 2500)
  }, [cloneName, playBeep, speakText, conversationLoop])

  // End call
  const endCall = useCallback(() => {
    loopActiveRef.current = false
    setCallState('ended')

    // Stop recognition & speech
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
    }
    window.speechSynthesis?.cancel()

    // End beeps
    playBeep(300, 150)
    setTimeout(() => playBeep(200, 300), 200)

    // Save call log
    const currentMsgs = messagesRef.current
    const log = {
      id: Date.now().toString(),
      duration: callTimer,
      messageCount: currentMsgs.length,
      timestamp: new Date().toISOString(),
      preview: currentMsgs.filter(m => m.role === 'user').slice(0, 3).map(m => m.text)
    }
    try {
      const existing = JSON.parse(localStorage.getItem('cc_call_logs') || '[]')
      existing.unshift(log)
      localStorage.setItem('cc_call_logs', JSON.stringify(existing.slice(0, 50)))
    } catch {}
  }, [callTimer, playBeep])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      loopActiveRef.current = false
      if (recognitionRef.current) try { recognitionRef.current.abort() } catch {}
      window.speechSynthesis?.cancel()
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveRef.current) clearInterval(waveRef.current)
    }
  }, [])

  // ====== IDLE / ENDED SCREEN ======
  if (callState === 'idle' || callState === 'ended') {
    let logs: CallLog[] = []
    try { logs = JSON.parse(localStorage.getItem('cc_call_logs') || '[]') } catch {}

    return (
      <main className="min-h-screen bg-[#050510] relative">
        <style>{`
          @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6 } 100% { transform: scale(1.8); opacity: 0 } }
          @keyframes float-particle { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 0.6 } 80% { opacity: 0.6 } 100% { transform: translateY(-100vh); opacity: 0 } }
          @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        `}</style>

        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-particle ${6 + Math.random() * 5}s linear ${Math.random() * 4}s infinite`
              }}
            />
          ))}
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.05]">
          <div className="px-4 py-3 flex items-center gap-3">
            <Link href="/dashboard" className="text-white/40 hover:text-white/60 transition-colors">←</Link>
            <div>
              <h1 className="text-base font-bold text-white">📞 {t('Voice Call')}</h1>
              <p className="text-white/30 text-xs">{t('Talk to your clone LIVE')}</p>
            </div>
          </div>
        </header>

        <div className="relative z-10 px-4 py-8 pb-24 md:pb-8">
          {/* Ended banner */}
          {callState === 'ended' && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center" style={{ animation: 'fadeSlideUp 0.4s ease' }}>
              <p className="text-emerald-400 text-sm">{t('Call ended')}</p>
              <p className="text-white/30 text-xs">{formatTime(callTimer)} · {messagesRef.current.length} messages</p>
            </div>
          )}

          {/* Big call button */}
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
              <div className="absolute inset-0 rounded-full bg-emerald-500/10" style={{ animation: 'pulse-ring 2s ease-out 0.5s infinite' }} />
              <button
                onClick={startCall}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-5xl shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                📞
              </button>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{cloneName}</h2>
            <p className="text-emerald-400 text-sm">{t('Tap to start voice call')}</p>
            <p className="text-white/20 text-xs mt-2">{t('Your clone speaks and listens in real-time')}</p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: '🗣️', title: t('Natural Voice'), desc: t('Your clone speaks naturally') },
              { icon: '🧠', title: t('Memory Aware'), desc: t('References your memories') },
              { icon: '⚡', title: t('Real-time'), desc: t('Instant responses') },
              { icon: '🔒', title: t('Private'), desc: t('Calls stay between you') },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/[0.06] p-3 backdrop-blur-xl"
                style={{ background: 'rgba(255,255,255,0.02)', animation: `fadeSlideUp 0.4s ease ${i * 0.1}s both` }}
              >
                <div className="text-2xl mb-1">{f.icon}</div>
                <h3 className="text-xs font-semibold text-white/80">{f.title}</h3>
                <p className="text-white/30 text-[10px]">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Recent call logs */}
          {logs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/50 mb-3">{t('Recent Calls')}</h3>
              <div className="space-y-2">
                {logs.slice(0, 5).map((log: CallLog) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-sm">📞</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/60 truncate">{log.preview?.slice(0, 2).join(' → ') || t('Voice call')}</p>
                      <p className="text-white/20 text-[10px]">{new Date(log.timestamp).toLocaleDateString()} · {formatTime(log.duration)}</p>
                    </div>
                    <span className="text-emerald-400 text-[10px] shrink-0">{log.messageCount} msgs</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ====== RINGING SCREEN ======
  if (callState === 'ringing') {
    return (
      <main className="min-h-screen bg-[#050510] flex flex-col items-center justify-center relative">
        <style>{`
          @keyframes ring-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
          @keyframes ring-glow { 0% { box-shadow: 0 0 20px rgba(16,185,129,0.3) } 50% { box-shadow: 0 0 60px rgba(16,185,129,0.6) } 100% { box-shadow: 0 0 20px rgba(16,185,129,0.3) } }
          @keyframes dot-bounce { 0%,80%,100% { transform: translateY(0) } 40% { transform: translateY(-8px) } }
        `}</style>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent" />
        <div className="relative z-10 text-center">
          <div
            className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center text-6xl mx-auto mb-6"
            aria-hidden="true"
            style={{ animation: 'ring-pulse 0.8s ease infinite, ring-glow 1.5s ease infinite' }}
          >
            📞
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('Calling')} {cloneName}...</h2>
          <p className="text-emerald-400 text-sm animate-pulse">{t('Ringing')}</p>
          <div className="flex gap-1.5 justify-center mt-4">
            {[0, 0.2, 0.4].map((d, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ animation: `dot-bounce 1.2s ease ${d}s infinite` }}
              />
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ====== CONNECTED CALL SCREEN ======
  return (
    <main className="min-h-screen bg-[#050510] flex flex-col relative">
      <style>{`
        @keyframes wave-bar { 0%,100% { height: 4px } 50% { height: var(--h) } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
            {cloneName[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{cloneName}</h2>
            <p className="text-emerald-400 text-[10px]">
              {isListening ? '🎙️ ' + t('Listening') + '...' : isSpeaking ? '🗣️ ' + t('Speaking') + '...' : '💬 ' + t('Connected')}
            </p>
          </div>
        </div>
        <div className="text-white/30 text-xs font-mono bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
          {formatTime(callTimer)}
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="relative z-10 flex items-center justify-center gap-[3px] h-16 px-8 my-3 shrink-0">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full transition-[height] duration-75"
            style={{
              height: `${h}px`,
              background: isSpeaking
                ? 'linear-gradient(to top, #10b981, #6ee7b7)'
                : isListening
                  ? 'linear-gradient(to top, #8b5cf6, #c4b5fd)'
                  : 'rgba(255,255,255,0.08)',
              animation: (isListening || isSpeaking)
                ? `wave-bar 0.4s ease ${i * 0.02}s infinite alternate`
                : 'none',
              '--h': `${h}px`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Messages area */}
      <div className="relative z-10 flex-1 px-4 overflow-y-auto min-h-0">
        <div className="space-y-3 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{ animation: 'fadeSlideUp 0.3s ease both' }}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-violet-500/20 border border-violet-500/20 text-white/90 rounded-br-md'
                    : 'bg-emerald-500/10 border border-emerald-500/10 text-white/80 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {/* Live transcript preview */}
          {transcript && (
            <div className="flex justify-end" style={{ animation: 'fadeSlideUp 0.2s ease both' }}>
              <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md text-sm bg-violet-500/10 border border-violet-500/10 text-white/40 italic">
                {transcript}...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-4 py-5 flex items-center justify-center gap-6 shrink-0 bg-gradient-to-t from-[#050510] via-[#050510]/90 to-transparent">
        {/* Mute / stop listening */}
        <button
          onClick={() => {
            if (recognitionRef.current) {
              try { recognitionRef.current.abort() } catch {}
            }
            setIsListening(false)
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-red-500/20 border border-red-500/30 shadow-lg shadow-red-500/10'
              : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
          }`}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>

        {/* End call */}
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-2xl shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          📵
        </button>

        {/* Stop speaking */}
        <button
          onClick={() => window.speechSynthesis?.cancel()}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all cursor-pointer ${
            isSpeaking
              ? 'bg-amber-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10'
              : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]'
          }`}
        >
          🔇
        </button>
      </div>
    </main>
  )
}
