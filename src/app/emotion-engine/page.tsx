'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface EmotionData {
  joy: number
  sadness: number
  anger: number
  fear: number
  surprise: number
  disgust: number
  trust: number
  anticipation: number
}

interface EmotionEntry {
  id: string
  text: string
  emotions: EmotionData
  dominant: string
  timestamp: string
  cloneResponse: string
}

const EMOTION_COLORS: Record<string, string> = {
  joy: '#facc15',
  sadness: '#3b82f6',
  anger: '#ef4444',
  fear: '#8b5cf6',
  surprise: '#f97316',
  disgust: '#22c55e',
  trust: '#06b6d4',
  anticipation: '#ec4899',
}

const EMOTION_EMOJIS: Record<string, string> = {
  joy: '😊',
  sadness: '😢',
  anger: '😤',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  trust: '🤝',
  anticipation: '🔮',
}

const INITIAL_EMOTIONS: EmotionData = {
  joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, trust: 0, anticipation: 0,
}

const STORAGE_KEY = 'emotion-engine-data'

function detectEmotionLocal(text: string): EmotionData {
  const lower = text.toLowerCase()
  const emotions = { ...INITIAL_EMOTIONS }
  const keywords: Record<string, string[]> = {
    joy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'fantastic', 'awesome', 'laugh', 'smile', 'fun', 'best', 'beautiful', 'celebrate', 'grateful', 'thankful', 'blessed', 'delighted', 'cheerful'],
    sadness: ['sad', 'depressed', 'lonely', 'miss', 'cry', 'lost', 'broken', 'heart', 'pain', 'grief', 'sorry', 'unfortunately', 'miserable', 'hopeless', 'down', 'blue', 'melancholy', 'sorrow', 'tearful'],
    anger: ['angry', 'furious', 'hate', 'annoyed', 'frustrated', 'mad', 'rage', 'stupid', 'idiot', 'terrible', 'worst', 'disgusting', 'ridiculous', 'outraged', 'livid', 'pissed', 'infuriating'],
    fear: ['afraid', 'scared', 'terrified', 'worried', 'anxious', 'nervous', 'panic', 'fear', 'horror', 'dread', 'threat', 'danger', 'nightmare', 'phobia', 'trembling', 'frightened'],
    surprise: ['wow', 'omg', 'unbelievable', 'shocked', 'surprised', 'unexpected', 'incredible', 'no way', 'what', 'seriously', 'astonishing', 'mind-blown', 'stunning', 'jaw-drop'],
    disgust: ['gross', 'disgusting', 'ew', 'nasty', 'repulsive', 'sick', 'vile', 'revolting', 'yuck', 'awful', 'horrible', 'nauseating', 'repugnant'],
    trust: ['trust', 'believe', 'faith', 'reliable', 'honest', 'loyal', 'dependable', 'confident', 'safe', 'secure', 'comfortable', 'sure', 'certain', 'count on'],
    anticipation: ['waiting', 'excited', "can't wait", 'looking forward', 'hope', 'plan', 'expect', 'soon', 'tomorrow', 'future', 'dream', 'goal', 'imagine', 'wonder', 'curious', 'eager'],
  }
  let totalHits = 0
  for (const [emotion, words] of Object.entries(keywords)) {
    const hits = words.filter(w => lower.includes(w)).length
    if (hits > 0) { emotions[emotion as keyof EmotionData] = hits; totalHits += hits }
  }
  if (totalHits > 0) {
    for (const key of Object.keys(emotions)) {
      emotions[key as keyof EmotionData] = Math.round((emotions[key as keyof EmotionData] / totalHits) * 100)
    }
  } else { emotions.trust = 40; emotions.anticipation = 30; emotions.joy = 30 }
  return emotions
}

function getDominantEmotion(emotions: EmotionData): string {
  let max = 0; let dominant = 'trust'
  for (const [key, val] of Object.entries(emotions)) { if (val > max) { max = val; dominant = key } }
  return dominant
}

export default function EmotionEngine() {
  const t = useT()
  const [text, setText] = useState('')
  const [currentEmotions, setCurrentEmotions] = useState<EmotionData | null>(null)
  const [currentDominant, setCurrentDominant] = useState('')
  const [cloneResponse, setCloneResponse] = useState('')
  const [history, setHistory] = useState<EmotionEntry[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) { try { setHistory(JSON.parse(stored)) } catch {} }
  }, [])

  const saveHistory = (entries: EmotionEntry[]) => {
    setHistory(entries)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }

  const analyzeEmotion = async () => {
    if (!text.trim() || analyzing) return
    setAnalyzing(true)
    const localEmotions = detectEmotionLocal(text)
    const dominant = getDominantEmotion(localEmotions)
    setCurrentEmotions(localEmotions)
    setCurrentDominant(dominant)
    drawEmotionWheel(localEmotions)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Analyze the emotions in this text: "${text}"\n\nReturn a JSON object with:\n{\n  "emotions": { "joy": 0-100, "sadness": 0-100, "anger": 0-100, "fear": 0-100, "surprise": 0-100, "disgust": 0-100, "trust": 0-100, "anticipation": 0-100 },\n  "dominant": "the dominant emotion name",\n  "response": "A empathetic clone response (2-3 sentences) that acknowledges the emotion and responds appropriately. Be warm and understanding."\n}\nReturn ONLY valid JSON.` }],
          memories: '',
        }),
      })
      const data = await response.json()
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.emotions) { setCurrentEmotions(parsed.emotions); setCurrentDominant(parsed.dominant || dominant); drawEmotionWheel(parsed.emotions) }
          setCloneResponse(parsed.response || '')
          const entry: EmotionEntry = { id: Date.now().toString(), text, emotions: parsed.emotions || localEmotions, dominant: parsed.dominant || dominant, timestamp: new Date().toISOString(), cloneResponse: parsed.response || '' }
          saveHistory([entry, ...history.slice(0, 99)])
        }
      } catch {
        setCloneResponse(`I sense ${dominant} in your words. I'm here for you. 💜`)
        const entry: EmotionEntry = { id: Date.now().toString(), text, emotions: localEmotions, dominant, timestamp: new Date().toISOString(), cloneResponse: `I sense ${dominant} in your words. I'm here for you. 💜` }
        saveHistory([entry, ...history.slice(0, 99)])
      }
    } catch {
      setCloneResponse(`I sense ${dominant} in your words. I'm here for you. 💜`)
      const entry: EmotionEntry = { id: Date.now().toString(), text, emotions: localEmotions, dominant, timestamp: new Date().toISOString(), cloneResponse: `I sense ${dominant} in your words. I'm here for you. 💜` }
      saveHistory([entry, ...history.slice(0, 99)])
    }
    setAnalyzing(false)
  }

  const drawEmotionWheel = (emotions: EmotionData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = 240
    canvas.width = size * 2; canvas.height = size * 2
    canvas.style.width = `${size}px`; canvas.style.height = `${size}px`
    ctx.scale(2, 2)
    const cx = size / 2, cy = size / 2, radius = size / 2 - 20
    const emotionKeys = Object.keys(emotions) as (keyof EmotionData)[]
    ctx.clearRect(0, 0, size, size)
    for (let r = radius; r > 0; r -= radius / 4) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; ctx.stroke()
    }
    const sliceAngle = (Math.PI * 2) / emotionKeys.length
    emotionKeys.forEach((key, i) => {
      const value = emotions[key] / 100
      const startAngle = i * sliceAngle - Math.PI / 2
      const endAngle = startAngle + sliceAngle
      const r = radius * Math.max(0.1, value)
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, endAngle); ctx.closePath()
      ctx.fillStyle = EMOTION_COLORS[key] + '40'; ctx.fill()
      ctx.strokeStyle = EMOTION_COLORS[key]; ctx.lineWidth = 2; ctx.stroke()
      const labelAngle = startAngle + sliceAngle / 2
      const labelR = radius + 14
      const lx = cx + Math.cos(labelAngle) * labelR, ly = cy + Math.sin(labelAngle) * labelR
      ctx.font = '10px system-ui'; ctx.fillStyle = EMOTION_COLORS[key]; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(`${EMOTION_EMOJIS[key]} ${emotions[key]}%`, lx, ly)
    })
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fillStyle = '#8b5cf6'; ctx.fill()
  }

  const getWeeklyReport = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekEntries = history.filter(e => new Date(e.timestamp).getTime() > weekAgo)
    if (weekEntries.length === 0) return null
    const avgEmotions: EmotionData = { ...INITIAL_EMOTIONS }
    weekEntries.forEach(entry => { for (const key of Object.keys(avgEmotions)) { avgEmotions[key as keyof EmotionData] += entry.emotions[key as keyof EmotionData] || 0 } })
    for (const key of Object.keys(avgEmotions)) { avgEmotions[key as keyof EmotionData] = Math.round(avgEmotions[key as keyof EmotionData] / weekEntries.length) }
    const dominantCounts: Record<string, number> = {}
    weekEntries.forEach(e => { dominantCounts[e.dominant] = (dominantCounts[e.dominant] || 0) + 1 })
    const topEmotion = Object.entries(dominantCounts).sort((a, b) => b[1] - a[1])[0]
    return { avgEmotions, totalEntries: weekEntries.length, topEmotion: topEmotion?.[0] || 'trust', topEmotionCount: topEmotion?.[1] || 0 }
  }

  const weeklyReport = getWeeklyReport()

  return (
    <main className="min-h-screen bg-[#050510] pb-24 relative">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-fuchsia-600/8 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-purple-500/6 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] hover:border-violet-500/30 transition-all duration-300 group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-base bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">{t('emotion engine')}</h1>
            <p className="text-gray-500 text-[11px]">{t('detect emotions')}</p>
          </div>
          <button onClick={() => setShowReport(!showReport)} className="px-4 py-2 rounded-xl bg-violet-500/10 backdrop-blur-sm border border-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/20 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
            📊 Report
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-5 relative z-10">
        {/* Input Card */}
        <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] shadow-2xl shadow-black/20 hover:border-violet-500/20 transition-all duration-500">
          <label className="text-gray-300 text-xs font-semibold mb-3 block tracking-wide uppercase">{t('mood')}</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('emotion engine placeholder')}
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/40 focus:shadow-lg focus:shadow-violet-500/5 resize-none transition-all duration-300"
          />
          <button
            onClick={analyzeEmotion}
            disabled={!text.trim() || analyzing}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl text-white text-sm font-semibold hover:shadow-xl hover:shadow-violet-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400/0 via-white/10 to-violet-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {analyzing ? (
              <span className="flex items-center justify-center gap-2 relative z-10">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing emotions...
              </span>
            ) : (
              <span className="relative z-10">🧠 {t('analysis')}</span>
            )}
          </button>
        </div>

        {/* Emotion Wheel */}
        {currentEmotions && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] shadow-2xl shadow-black/20 hover:border-violet-500/15 transition-all duration-500">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-sm font-bold tracking-wide">Emotion Wheel</h3>
              <span className="text-2xl animate-bounce">{EMOTION_EMOJIS[currentDominant]}</span>
            </div>
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="drop-shadow-lg" />
            </div>
            <div className="text-center mt-5">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Dominant Emotion</p>
              <p className="text-lg font-bold capitalize" style={{ color: EMOTION_COLORS[currentDominant] }}>
                {EMOTION_EMOJIS[currentDominant]} {currentDominant}
              </p>
            </div>
          </div>
        )}

        {/* Clone Response */}
        {cloneResponse && (
          <div className="relative bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 rounded-2xl p-5 border border-violet-500/15 shadow-lg shadow-violet-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <span className="text-xl">🧠</span>
              <p className="text-violet-300 text-xs font-bold tracking-wide uppercase">Your Clone Says</p>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed relative z-10">{cloneResponse}</p>
          </div>
        )}

        {/* Emotion Bars */}
        {currentEmotions && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] shadow-2xl shadow-black/20">
            <h3 className="text-white text-sm font-bold mb-4 tracking-wide">Breakdown</h3>
            <div className="space-y-3">
              {(Object.entries(currentEmotions) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-3 group">
                  <span className="text-sm w-6 group-hover:scale-125 transition-transform">{EMOTION_EMOJIS[emotion]}</span>
                  <span className="text-gray-400 text-xs w-20 capitalize font-medium">{emotion}</span>
                  <div className="flex-1 h-2.5 bg-white/[0.04] rounded-full">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, backgroundColor: EMOTION_COLORS[emotion], boxShadow: `0 0 12px ${EMOTION_COLORS[emotion]}40` }} />
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right font-mono">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Report */}
        {showReport && weeklyReport && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-6 border border-white/[0.06] shadow-2xl shadow-black/20">
            <h3 className="text-white text-sm font-bold mb-5 tracking-wide">📊 {t('analysis')}</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 text-center border border-white/[0.06] hover:border-violet-500/20 transition-all">
                <p className="text-3xl font-black bg-gradient-to-b from-violet-300 to-fuchsia-400 bg-clip-text text-transparent">{weeklyReport.totalEntries}</p>
                <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-wider">Entries This Week</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-xl p-4 text-center border border-white/[0.06] hover:border-violet-500/20 transition-all">
                <p className="text-3xl">{EMOTION_EMOJIS[weeklyReport.topEmotion]}</p>
                <p className="text-gray-500 text-[10px] mt-1">Most Frequent: <span className="capitalize text-gray-300 font-medium">{weeklyReport.topEmotion}</span></p>
              </div>
            </div>
            <h4 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Average Emotions</h4>
            <div className="space-y-2.5">
              {(Object.entries(weeklyReport.avgEmotions) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-sm w-6">{EMOTION_EMOJIS[emotion]}</span>
                  <span className="text-gray-400 text-xs w-20 capitalize">{emotion}</span>
                  <div className="flex-1 h-2 bg-white/[0.04] rounded-full">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: EMOTION_COLORS[emotion] }} />
                  </div>
                  <span className="text-gray-400 text-xs w-10 text-right font-mono">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReport && !weeklyReport && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.06] text-center">
            <p className="text-gray-500 text-sm">No entries this week. Start analyzing your emotions!</p>
          </div>
        )}

        {/* History Timeline */}
        {history.length > 0 && (
          <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/[0.06] shadow-2xl shadow-black/20">
            <h3 className="text-white text-sm font-bold mb-4 tracking-wide">🕐 Emotion Timeline</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {history.slice(0, 20).map((entry, i) => (
                <div key={entry.id} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: EMOTION_COLORS[entry.dominant] + '15', border: `1px solid ${EMOTION_COLORS[entry.dominant]}30`, boxShadow: `0 0 16px ${EMOTION_COLORS[entry.dominant]}10` }}>
                      {EMOTION_EMOJIS[entry.dominant]}
                    </div>
                    {i < Math.min(history.length, 20) - 1 && <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">{entry.text}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] capitalize font-semibold" style={{ color: EMOTION_COLORS[entry.dominant] }}>{entry.dominant}</span>
                      <span className="text-gray-700 text-[10px]">•</span>
                      <span className="text-gray-600 text-[10px]">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 && !currentEmotions && (
          <div className="text-center py-16">
            <div className="text-6xl mb-5 animate-bounce">🎭</div>
            <p className="text-gray-300 text-base font-semibold">Your emotional journey starts here</p>
            <p className="text-gray-600 text-xs mt-2">Type something above to analyze your emotions</p>
          </div>
        )}
      </div>
    </main>
  )
}
