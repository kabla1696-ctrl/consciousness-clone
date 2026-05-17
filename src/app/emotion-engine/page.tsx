'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

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

// Simple local emotion detection (keyword-based, fast fallback)
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
    anticipation: ['waiting', 'excited', 'can\'t wait', 'looking forward', 'hope', 'plan', 'expect', 'soon', 'tomorrow', 'future', 'dream', 'goal', 'imagine', 'wonder', 'curious', 'eager'],
  }

  let totalHits = 0
  for (const [emotion, words] of Object.entries(keywords)) {
    const hits = words.filter(w => lower.includes(w)).length
    if (hits > 0) {
      emotions[emotion as keyof EmotionData] = hits
      totalHits += hits
    }
  }

  // Normalize to percentages
  if (totalHits > 0) {
    for (const key of Object.keys(emotions)) {
      emotions[key as keyof EmotionData] = Math.round((emotions[key as keyof EmotionData] / totalHits) * 100)
    }
  } else {
    // Default to neutral/trust if no keywords match
    emotions.trust = 40
    emotions.anticipation = 30
    emotions.joy = 30
  }

  return emotions
}

function getDominantEmotion(emotions: EmotionData): string {
  let max = 0
  let dominant = 'trust'
  for (const [key, val] of Object.entries(emotions)) {
    if (val > max) {
      max = val
      dominant = key
    }
  }
  return dominant
}

export default function EmotionEngine() {
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
    if (stored) {
      try { setHistory(JSON.parse(stored)) } catch {}
    }
  }, [])

  const saveHistory = (entries: EmotionEntry[]) => {
    setHistory(entries)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }

  const analyzeEmotion = async () => {
    if (!text.trim() || analyzing) return
    setAnalyzing(true)

    // Quick local detection
    const localEmotions = detectEmotionLocal(text)
    const dominant = getDominantEmotion(localEmotions)
    setCurrentEmotions(localEmotions)
    setCurrentDominant(dominant)
    drawEmotionWheel(localEmotions)

    // Get AI-refined analysis + clone response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Analyze the emotions in this text: "${text}"

Return a JSON object with:
{
  "emotions": { "joy": 0-100, "sadness": 0-100, "anger": 0-100, "fear": 0-100, "surprise": 0-100, "disgust": 0-100, "trust": 0-100, "anticipation": 0-100 },
  "dominant": "the dominant emotion name",
  "response": "A empathetic clone response (2-3 sentences) that acknowledges the emotion and responds appropriately. Be warm and understanding."
}
Return ONLY valid JSON.`
          }],
          memories: '',
        }),
      })

      const data = await response.json()
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (parsed.emotions) {
            setCurrentEmotions(parsed.emotions)
            setCurrentDominant(parsed.dominant || dominant)
            drawEmotionWheel(parsed.emotions)
          }
          setCloneResponse(parsed.response || '')

          const entry: EmotionEntry = {
            id: Date.now().toString(),
            text,
            emotions: parsed.emotions || localEmotions,
            dominant: parsed.dominant || dominant,
            timestamp: new Date().toISOString(),
            cloneResponse: parsed.response || '',
          }
          saveHistory([entry, ...history.slice(0, 99)])
        }
      } catch {
        setCloneResponse(`I sense ${dominant} in your words. I'm here for you. 💜`)
        const entry: EmotionEntry = {
          id: Date.now().toString(),
          text,
          emotions: localEmotions,
          dominant,
          timestamp: new Date().toISOString(),
          cloneResponse: `I sense ${dominant} in your words. I'm here for you. 💜`,
        }
        saveHistory([entry, ...history.slice(0, 99)])
      }
    } catch {
      setCloneResponse(`I sense ${dominant} in your words. I'm here for you. 💜`)
      const entry: EmotionEntry = {
        id: Date.now().toString(),
        text,
        emotions: localEmotions,
        dominant,
        timestamp: new Date().toISOString(),
        cloneResponse: `I sense ${dominant} in your words. I'm here for you. 💜`,
      }
      saveHistory([entry, ...history.slice(0, 99)])
    }

    setAnalyzing(false)
  }

  const drawEmotionWheel = (emotions: EmotionData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = 240
    canvas.width = size * 2 // retina
    canvas.height = size * 2
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(2, 2)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 20
    const emotionKeys = Object.keys(emotions) as (keyof EmotionData)[]

    ctx.clearRect(0, 0, size, size)

    // Draw background circles
    for (let r = radius; r > 0; r -= radius / 4) {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw emotion segments
    const sliceAngle = (Math.PI * 2) / emotionKeys.length
    emotionKeys.forEach((key, i) => {
      const value = emotions[key] / 100
      const startAngle = i * sliceAngle - Math.PI / 2
      const endAngle = startAngle + sliceAngle
      const r = radius * Math.max(0.1, value)

      // Filled wedge
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = EMOTION_COLORS[key] + '40'
      ctx.fill()
      ctx.strokeStyle = EMOTION_COLORS[key]
      ctx.lineWidth = 2
      ctx.stroke()

      // Label
      const labelAngle = startAngle + sliceAngle / 2
      const labelR = radius + 14
      const lx = cx + Math.cos(labelAngle) * labelR
      const ly = cy + Math.sin(labelAngle) * labelR
      ctx.font = '10px system-ui'
      ctx.fillStyle = EMOTION_COLORS[key]
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${EMOTION_EMOJIS[key]} ${emotions[key]}%`, lx, ly)
    })

    // Center dot
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#8b5cf6'
    ctx.fill()
  }

  // Weekly report
  const getWeeklyReport = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weekEntries = history.filter(e => new Date(e.timestamp).getTime() > weekAgo)
    if (weekEntries.length === 0) return null

    const avgEmotions: EmotionData = { ...INITIAL_EMOTIONS }
    weekEntries.forEach(entry => {
      for (const key of Object.keys(avgEmotions)) {
        avgEmotions[key as keyof EmotionData] += entry.emotions[key as keyof EmotionData] || 0
      }
    })
    for (const key of Object.keys(avgEmotions)) {
      avgEmotions[key as keyof EmotionData] = Math.round(avgEmotions[key as keyof EmotionData] / weekEntries.length)
    }

    const dominantCounts: Record<string, number> = {}
    weekEntries.forEach(e => {
      dominantCounts[e.dominant] = (dominantCounts[e.dominant] || 0) + 1
    })
    const topEmotion = Object.entries(dominantCounts).sort((a, b) => b[1] - a[1])[0]

    return { avgEmotions, totalEntries: weekEntries.length, topEmotion: topEmotion?.[0] || 'trust', topEmotionCount: topEmotion?.[1] || 0 }
  }

  const weeklyReport = getWeeklyReport()

  return (
    <main className="page-transition min-h-screen bg-[#050510] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-white font-semibold text-base">Emotion Engine</h1>
            <p className="text-gray-500 text-xs">Real-time emotion detection</p>
          </div>
          <button
            onClick={() => setShowReport(!showReport)}
            className="ml-auto px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/30 transition-colors"
          >
            📊 Report
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Input */}
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <label className="text-gray-300 text-xs font-medium mb-2 block">How are you feeling? What&apos;s on your mind?</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type anything — your clone will read your emotions..."
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none"
          />
          <button
            onClick={analyzeEmotion}
            disabled={!text.trim() || analyzing}
            className="w-full mt-3 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
          >
            {analyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing emotions...
              </span>
            ) : (
              '🧠 Analyze Emotions'
            )}
          </button>
        </div>

        {/* Emotion Wheel */}
        {currentEmotions && (
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-semibold">Emotion Wheel</h3>
              <span className="text-lg">{EMOTION_EMOJIS[currentDominant]}</span>
            </div>
            <div className="flex justify-center">
              <canvas ref={canvasRef} />
            </div>
            <div className="text-center mt-3">
              <p className="text-gray-400 text-xs">Dominant Emotion</p>
              <p className="text-white font-semibold capitalize" style={{ color: EMOTION_COLORS[currentDominant] }}>
                {EMOTION_EMOJIS[currentDominant]} {currentDominant}
              </p>
            </div>
          </div>
        )}

        {/* Clone Response */}
        {cloneResponse && (
          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-2xl p-4 border border-violet-500/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span>
              <p className="text-violet-300 text-xs font-medium">Your Clone Says</p>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">{cloneResponse}</p>
          </div>
        )}

        {/* Emotion Bars (current) */}
        {currentEmotions && (
          <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
            <h3 className="text-white text-sm font-semibold mb-3">Breakdown</h3>
            <div className="space-y-2.5">
              {(Object.entries(currentEmotions) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xs w-5">{EMOTION_EMOJIS[emotion]}</span>
                  <span className="text-gray-400 text-xs w-20 capitalize">{emotion}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${value}%`, backgroundColor: EMOTION_COLORS[emotion] }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Report */}
        {showReport && weeklyReport && (
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
            <h3 className="text-white text-sm font-semibold mb-4">📊 Weekly Emotion Report</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl font-bold text-violet-400">{weeklyReport.totalEntries}</p>
                <p className="text-gray-500 text-[10px]">Entries This Week</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                <p className="text-2xl">{EMOTION_EMOJIS[weeklyReport.topEmotion]}</p>
                <p className="text-gray-500 text-[10px]">Most Frequent: <span className="capitalize text-gray-300">{weeklyReport.topEmotion}</span></p>
              </div>
            </div>
            <h4 className="text-gray-400 text-xs font-medium mb-2">Average Emotions</h4>
            <div className="space-y-2">
              {(Object.entries(weeklyReport.avgEmotions) as [string, number][]).sort((a, b) => b[1] - a[1]).map(([emotion, value]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-xs w-5">{EMOTION_EMOJIS[emotion]}</span>
                  <span className="text-gray-400 text-xs w-20 capitalize">{emotion}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${value}%`, backgroundColor: EMOTION_COLORS[emotion] }}
                    />
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReport && !weeklyReport && (
          <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 text-center">
            <p className="text-gray-500 text-xs">No entries this week. Start analyzing your emotions!</p>
          </div>
        )}

        {/* History Timeline */}
        {history.length > 0 && (
          <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
            <h3 className="text-white text-sm font-semibold mb-3">🕐 Emotion Timeline</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {history.slice(0, 20).map((entry, i) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{ backgroundColor: EMOTION_COLORS[entry.dominant] + '20', border: `1px solid ${EMOTION_COLORS[entry.dominant]}40` }}
                    >
                      {EMOTION_EMOJIS[entry.dominant]}
                    </div>
                    {i < Math.min(history.length, 20) - 1 && <div className="w-px h-full bg-white/5 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-gray-300 text-xs line-clamp-2">{entry.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] capitalize" style={{ color: EMOTION_COLORS[entry.dominant] }}>{entry.dominant}</span>
                      <span className="text-gray-600 text-[10px]">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 && !currentEmotions && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🎭</p>
            <p className="text-gray-300 text-sm font-medium">Your emotional journey starts here</p>
            <p className="text-gray-500 text-xs mt-1">Type something above to analyze your emotions</p>
          </div>
        )}
      </div>
    </main>
  )
}
