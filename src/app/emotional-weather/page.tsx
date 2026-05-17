'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

type Mood = 'sunny' | 'rainy' | 'stormy' | 'cloudy' | 'rainbow'

interface WeatherDay {
  date: string
  mood: Mood
  intensity: number
  note: string
}

const MOOD_CONFIG: Record<Mood, { icon: string; label: string; color: string; gradient: string; bgGlow: string }> = {
  sunny: { icon: '☀️', label: 'Happy', color: 'text-amber-400', gradient: 'from-amber-500/20 to-yellow-500/10', bgGlow: 'rgba(245,158,11,0.15)' },
  rainy: { icon: '🌧️', label: 'Sad', color: 'text-blue-400', gradient: 'from-blue-500/20 to-cyan-500/10', bgGlow: 'rgba(59,130,246,0.15)' },
  stormy: { icon: '⛈️', label: 'Angry', color: 'text-red-400', gradient: 'from-red-500/20 to-orange-500/10', bgGlow: 'rgba(239,68,68,0.15)' },
  cloudy: { icon: '☁️', label: 'Anxious', color: 'text-gray-400', gradient: 'from-gray-500/20 to-slate-500/10', bgGlow: 'rgba(156,163,175,0.12)' },
  rainbow: { icon: '🌈', label: 'Hopeful', color: 'text-violet-400', gradient: 'from-violet-500/20 to-pink-500/10', bgGlow: 'rgba(139,92,246,0.15)' },
}

const MOODS: Mood[] = ['sunny', 'rainy', 'stormy', 'cloudy', 'rainbow']

function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: i % 2 === 0 ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)',
          '--duration': `${7 + Math.random() * 6}s`, '--delay': `${Math.random() * 4}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  )
}

function RainAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute w-[1px] bg-blue-400/20" style={{
          left: `${Math.random() * 100}%`,
          top: `-${Math.random() * 10}%`,
          height: `${10 + Math.random() * 20}px`,
          animation: `rain-fall ${0.5 + Math.random() * 0.5}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }} />
      ))}
      <style jsx global>{`
        @keyframes rain-fall { from { transform: translateY(-10px); } to { transform: translateY(100vh); } }
      `}</style>
    </div>
  )
}

function LightningFlash({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[2] bg-white/5 animate-[fade-out_0.3s_ease-out]" />
  )
}

export default function EmotionalWeatherPage() {
  const t = useT()
  const [forecast, setForecast] = useState<WeatherDay[]>([])
  const [todayMood, setTodayMood] = useState<Mood>('sunny')
  const [todayIntensity, setTodayIntensity] = useState(70)
  const [showPicker, setShowPicker] = useState(false)
  const [lightningFlash, setLightningFlash] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('emotional-weather-forecast')
    if (saved) {
      setForecast(JSON.parse(saved))
    } else {
      const generated: WeatherDay[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        generated.push({
          date: d.toISOString().split('T')[0],
          mood: MOODS[Math.floor(Math.random() * MOODS.length)],
          intensity: 40 + Math.floor(Math.random() * 50),
          note: '',
        })
      }
      setForecast(generated)
      localStorage.setItem('emotional-weather-forecast', JSON.stringify(generated))
    }

    const savedMood = localStorage.getItem('emotional-weather-today')
    if (savedMood) {
      const m = JSON.parse(savedMood)
      setTodayMood(m.mood)
      setTodayIntensity(m.intensity)
    }
  }, [])

  useEffect(() => {
    if (todayMood === 'stormy') {
      const interval = setInterval(() => {
        setLightningFlash(true)
        setTimeout(() => setLightningFlash(false), 200)
      }, 3000 + Math.random() * 4000)
      return () => clearInterval(interval)
    }
  }, [todayMood])

  const setMood = (mood: Mood) => {
    setTodayMood(mood)
    setShowPicker(false)
    localStorage.setItem('emotional-weather-today', JSON.stringify({ mood, intensity: todayIntensity }))
  }

  const setIntensity = (val: number) => {
    setTodayIntensity(val)
    localStorage.setItem('emotional-weather-today', JSON.stringify({ mood: todayMood, intensity: val }))
  }

  const config = MOOD_CONFIG[todayMood]

  const moodDistribution = MOODS.map(m => ({
    mood: m,
    count: forecast.filter(d => d.mood === m).length,
  })).filter(d => d.count > 0)

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <FloatingParticles />
      {todayMood === 'rainy' && <RainAnimation />}
      <LightningFlash show={lightningFlash} />

      <div className="ambient-orb ambient-orb-violet" style={{ width: 200, height: 200, top: '5%', left: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 180, height: 180, bottom: '20%', right: '-8%' }} />

      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold gradient-text">{t('emotional weather')}</h1>
            <p className="text-[11px] text-white/30">{t('forecast')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 relative z-10 max-w-lg mx-auto">
        {/* Today's Weather */}
        <div className={`glass-card rounded-3xl p-6 border border-white/[0.06] bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 30%, ${config.bgGlow}, transparent 70%)` }} />
          <div className="relative z-10">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Today&apos;s Emotional Weather</p>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-6xl mb-2 animate-[float-subtle_3s_ease-in-out_infinite]">{config.icon}</div>
                <h2 className={`text-2xl font-extrabold ${config.color}`}>{config.label}</h2>
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-white">{todayIntensity}%</p>
                <p className="text-xs text-white/30">Intensity</p>
              </div>
            </div>

            <div className="mt-4">
              <input type="range" min="10" max="100" value={todayIntensity}
                onChange={e => setIntensity(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-400" />
            </div>

            <button onClick={() => setShowPicker(!showPicker)}
              className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-medium hover:bg-white/10 transition-all">
              {showPicker ? '✕ Close' : 'Change Mood'}
            </button>
          </div>
        </div>

        {/* Mood Picker */}
        {showPicker && (
          <div className="glass-card rounded-2xl p-4 animate-[slide-up_0.3s_ease-out]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Select Mood</p>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map(mood => {
                const mc = MOOD_CONFIG[mood]
                return (
                  <button key={mood} onClick={() => setMood(mood)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-300 ${
                      todayMood === mood
                        ? `bg-gradient-to-b ${mc.gradient} border border-white/10 shadow-lg`
                        : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'
                    }`}>
                    <span className="text-2xl">{mc.icon}</span>
                    <span className={`text-[10px] font-medium ${todayMood === mood ? mc.color : 'text-white/40'}`}>{mc.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 7-Day Forecast */}
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[2px] mb-4">{t('forecast')}</h3>
          <div className="space-y-2">
            {forecast.map((day, i) => {
              const dc = MOOD_CONFIG[day.mood]
              const d = new Date(day.date)
              const isToday = day.date === new Date().toISOString().split('T')[0]
              return (
                <div key={day.date}
                  className={`glass-card hover-lift rounded-xl p-4 flex items-center gap-4 transition-all duration-300 stagger-children ${
                    isToday ? 'border border-white/10 bg-gradient-to-r ' + dc.gradient : ''
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="w-10 text-center">
                    <span className="text-2xl">{dc.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">
                        {isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/5 ${dc.color}`}>{dc.label}</span>
                    </div>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-16 bg-white/5 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full bg-gradient-to-r ${dc.gradient.replace('/20', '/60').replace('/10', '/40')}`}
                        style={{ width: `${day.intensity}%` }} />
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">{day.intensity}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[2px] mb-4">{t('mood patterns')}</h3>
          <div className="space-y-3">
            {moodDistribution.map(({ mood, count }) => {
              const mc = MOOD_CONFIG[mood]
              const pct = Math.round((count / forecast.length) * 100)
              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">{mc.icon}</span>
                  <div className="flex-1">
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${mc.gradient.replace('/20', '/50').replace('/10', '/30')} transition-all duration-1000`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-white/40 w-12 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Conditions */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-[2px] mb-3">Current Conditions</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">🌡️</p>
              <p className="text-xs text-white/30">Emotional Temp</p>
              <p className="text-sm font-bold text-amber-400">{Math.round(todayIntensity * 0.4 + 30)}°</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">💨</p>
              <p className="text-xs text-white/30">Mood Wind</p>
              <p className="text-sm font-bold text-blue-400">{Math.round(todayIntensity * 0.3)} mph</p>
            </div>
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg mb-1">💧</p>
              <p className="text-xs text-white/30">Emotion Humidity</p>
              <p className="text-sm font-bold text-violet-400">{Math.round(todayIntensity * 0.8)}%</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
