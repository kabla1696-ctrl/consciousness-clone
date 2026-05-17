'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#050510', text: '#ffffff', accent: '#8b5cf6', border: 'rgba(255,255,255,0.06)' },
  { id: 'midnight', name: 'Midnight', bg: '#1a1a2e', text: '#e0e0ff', accent: '#7c3aed', border: 'rgba(124,58,237,0.15)' },
  { id: 'cosmic', name: 'Cosmic', bg: 'linear-gradient(135deg, #2d1b69, #11052c)', text: '#f0e6ff', accent: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  { id: 'minimal', name: 'Minimal', bg: 'transparent', text: '#ffffff', accent: '#ffffff', border: 'rgba(255,255,255,0.15)' },
]

const BG_COLORS = ['#050510', '#0f0f23', '#1a1a2e', '#16213e', '#0d1117', '#1c1c3a', '#11052c', '#0a0a1a', '#1b1b3b', '#2d1b69', '#0c0c2d', '#141432']

const TEXT_SIZES = [
  { id: 'small', label: 'S', scale: 0.85 },
  { id: 'medium', label: 'M', scale: 1 },
  { id: 'large', label: 'L', scale: 1.15 },
]

interface WidgetConfig { theme: string; bgColor: string; textSize: string; showIcon: boolean; showTitle: boolean; showSubtitle: boolean }

const defaultConfig: WidgetConfig = { theme: 'dark', bgColor: '#050510', textSize: 'medium', showIcon: true, showTitle: true, showSubtitle: true }

export default function WidgetDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState<number | null>(null)
  const [config, setConfig] = useState<Record<number, WidgetConfig>>({})
  const [dailyQuote, setDailyQuote] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [memoryCount, setMemoryCount] = useState(0)
  const [chatCount, setChatCount] = useState(0)
  const [streakDays, setStreakDays] = useState(7)
  const [todayMood, setTodayMood] = useState('😊')
  const [lastMemory, setLastMemory] = useState('A beautiful day to remember...')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      await loadData(user.id)
      loadWidgetConfig(); loadDailyQuote(); setLoading(false)
    }
    init()
  }, [])

  const loadData = async (userId: string) => {
    const [memories, messages] = await Promise.all([
      supabase.from('memories').select('id,content,created_at', { count: 'exact' }).eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
      supabase.from('chat_messages').select('id', { count: 'exact' }).eq('user_id', userId),
    ])
    setMemoryCount(memories.count || 0); setChatCount(messages.count || 0)
    if (memories.data && memories.data.length > 0) {
      const content = memories.data[0].content || ''
      setLastMemory(content.length > 60 ? content.substring(0, 60) + '...' : content)
    }
  }

  const loadWidgetConfig = () => { try { const saved = localStorage.getItem('widget-config'); if (saved) setConfig(JSON.parse(saved)) } catch {} }

  const saveWidgetConfig = (widgetId: number, cfg: WidgetConfig) => {
    const newConfig = { ...config, [widgetId]: cfg }; setConfig(newConfig); localStorage.setItem('widget-config', JSON.stringify(newConfig))
  }

  const getConfig = (widgetId: number): WidgetConfig => config[widgetId] || defaultConfig

  const loadDailyQuote = () => {
    try { const cached = localStorage.getItem('daily-quote'); if (cached) { const { quote, timestamp } = JSON.parse(cached); if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { setDailyQuote(quote); return } } } catch {}
    generateQuote()
  }

  const generateQuote = async () => {
    setQuoteLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Generate a short, inspiring one-liner wisdom quote. Just the quote, nothing else. Keep it under 15 words.' }] }) })
      if (res.ok) { const data = await res.json(); const quote = data.content || data.message || 'Your consciousness grows with every memory you create.'; setDailyQuote(quote); localStorage.setItem('daily-quote', JSON.stringify({ quote, timestamp: Date.now() })) }
      else { setDailyQuote('Your consciousness grows with every memory you create.') }
    } catch { setDailyQuote('Your consciousness grows with every memory you create.') }
    setQuoteLoading(false)
  }

  const widgets = [
    {
      id: 0, name: 'Quick Add', size: '2×1', icon: '➕', color: 'from-violet-500 to-purple-600', desc: 'Add a memory instantly',
      render: (cfg: WidgetConfig) => {
        const theme = THEMES.find(t => t.id === cfg.theme) || THEMES[0]; const textSize = TEXT_SIZES.find(s => s.id === cfg.textSize) || TEXT_SIZES[1]
        return (
          <div style={{ background: theme.bg, color: theme.text, borderRadius: 16, padding: `${12 * textSize.scale}px`, display: 'flex', alignItems: 'center', gap: `${10 * textSize.scale}px`, border: `1px solid ${theme.border}`, minHeight: 72 }}>
            <div style={{ width: 44 * textSize.scale, height: 44 * textSize.scale, borderRadius: 12, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 * textSize.scale, flexShrink: 0 }}>+</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {cfg.showTitle && <div style={{ fontWeight: 700, fontSize: 13 * textSize.scale }}>Quick Add</div>}
              {cfg.showSubtitle && <div style={{ opacity: 0.4, fontSize: 10 * textSize.scale, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMemory}</div>}
            </div>
            {cfg.showIcon && <div style={{ fontSize: 20, opacity: 0.3 }}>🧠</div>}
          </div>
        )
      }
    },
    {
      id: 1, name: 'Mood Check', size: '2×1', icon: '🎭', color: 'from-pink-500 to-rose-500', desc: 'Track your daily mood',
      render: (cfg: WidgetConfig) => {
        const theme = THEMES.find(t => t.id === cfg.theme) || THEMES[0]; const textSize = TEXT_SIZES.find(s => s.id === cfg.textSize) || TEXT_SIZES[1]
        return (
          <div style={{ background: theme.bg, color: theme.text, borderRadius: 16, padding: `${12 * textSize.scale}px`, display: 'flex', alignItems: 'center', gap: `${10 * textSize.scale}px`, border: `1px solid ${theme.border}`, minHeight: 72 }}>
            <div style={{ fontSize: 32 * textSize.scale }}>{todayMood}</div>
            <div style={{ flex: 1 }}>
              {cfg.showTitle && <div style={{ fontWeight: 700, fontSize: 13 * textSize.scale }}>Mood Check</div>}
              {cfg.showSubtitle && <div style={{ opacity: 0.4, fontSize: 10 * textSize.scale, marginTop: 2 }}>How are you feeling?</div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {['😢', '😐', '😊', '😄', '🤩'].map((emoji, i) => (
                  <span key={i} style={{ fontSize: 14 * textSize.scale, opacity: emoji === todayMood ? 1 : 0.3, cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setTodayMood(emoji) }}>{emoji}</span>
                ))}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 2, name: 'Clone Quote', size: '2×2', icon: '💬', color: 'from-amber-500 to-orange-500', desc: 'Daily wisdom from your clone',
      render: (cfg: WidgetConfig) => {
        const theme = THEMES.find(t => t.id === cfg.theme) || THEMES[0]; const textSize = TEXT_SIZES.find(s => s.id === cfg.textSize) || TEXT_SIZES[1]
        return (
          <div style={{ background: theme.bg, color: theme.text, borderRadius: 16, padding: `${16 * textSize.scale}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: `1px solid ${theme.border}`, minHeight: 140 }}>
            <div>
              {cfg.showIcon && <div style={{ fontSize: 20, marginBottom: 8, opacity: 0.6 }}>✨</div>}
              {cfg.showTitle && <div style={{ fontWeight: 700, fontSize: 12 * textSize.scale, opacity: 0.5, marginBottom: 6 }}>Clone Quote</div>}
              <div style={{ fontSize: 14 * textSize.scale, fontStyle: 'italic', lineHeight: 1.4 }}>&ldquo;{dailyQuote || 'Loading wisdom...'}&rdquo;</div>
            </div>
            <div style={{ fontSize: 10 * textSize.scale, opacity: 0.3, marginTop: 8 }}>— Your Clone, Today</div>
          </div>
        )
      }
    },
    {
      id: 3, name: 'Stats', size: '2×1', icon: '📊', color: 'from-emerald-500 to-teal-500', desc: 'Your consciousness stats',
      render: (cfg: WidgetConfig) => {
        const theme = THEMES.find(t => t.id === cfg.theme) || THEMES[0]; const textSize = TEXT_SIZES.find(s => s.id === cfg.textSize) || TEXT_SIZES[1]
        return (
          <div style={{ background: theme.bg, color: theme.text, borderRadius: 16, padding: `${12 * textSize.scale}px`, display: 'flex', alignItems: 'center', gap: `${8 * textSize.scale}px`, border: `1px solid ${theme.border}`, minHeight: 72 }}>
            {cfg.showIcon && <div style={{ fontSize: 24, opacity: 0.5 }}>📊</div>}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, fontSize: 16 * textSize.scale, color: theme.accent }}>{memoryCount}</div>{cfg.showSubtitle && <div style={{ fontSize: 9 * textSize.scale, opacity: 0.4 }}>Memories</div>}</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, fontSize: 16 * textSize.scale, color: theme.accent }}>{chatCount}</div>{cfg.showSubtitle && <div style={{ fontSize: 9 * textSize.scale, opacity: 0.4 }}>Chats</div>}</div>
              <div style={{ textAlign: 'center' }}><div style={{ fontWeight: 800, fontSize: 16 * textSize.scale, color: theme.accent }}>{streakDays}</div>{cfg.showSubtitle && <div style={{ fontSize: 9 * textSize.scale, opacity: 0.4 }}>Streak 🔥</div>}</div>
            </div>
          </div>
        )
      }
    },
  ]

  const installSteps = [
    { step: 1, emoji: '👆', title: 'Long press on home screen', desc: 'Press and hold an empty area on your Android home screen' },
    { step: 2, emoji: '🔧', title: 'Select Widgets', desc: 'Tap the "Widgets" option from the menu that appears' },
    { step: 3, emoji: '🔍', title: 'Find Consciousness Clone', desc: 'Scroll or search for "Consciousness Clone" in the widget list' },
    { step: 4, emoji: '📱', title: 'Drag to home screen', desc: 'Press and hold the widget, then drag it to your desired position' },
    { step: 5, emoji: '🎨', title: 'Customize it!', desc: 'Tap the widget to open settings and personalize your experience' },
  ]

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    )
  }

  const activeConfig = selectedWidget !== null ? getConfig(selectedWidget) : defaultConfig

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-600/6 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 -left-32 w-72 h-72 bg-violet-600/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-xl hover:bg-white/[0.04] transition-colors">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="flex items-center gap-2.5 flex-1">
            <span className="text-xl">📱</span>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Widget Dashboard</h1>
              <p className="text-[10px] text-white/25">Customize your home screen widgets</p>
            </div>
          </div>
          <span className="text-[10px] px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold backdrop-blur-sm">Coming Soon</span>
        </div>
      </header>

      <div className="px-4 py-4 pb-24 relative z-10">
        {/* Widget Gallery */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Widget Gallery</h2>
          <p className="text-white/25 text-xs mb-4">Tap a widget to customize it</p>
          <div className="grid grid-cols-2 gap-3">
            {widgets.map((widget) => {
              const cfg = getConfig(widget.id); const isSelected = selectedWidget === widget.id
              return (
                <button key={widget.id} onClick={() => setSelectedWidget(isSelected ? null : widget.id)}
                  className={`rounded-2xl p-3 transition-all duration-300 text-left tap-feedback ${
                    isSelected ? 'ring-2 ring-violet-500/50 bg-violet-500/5 shadow-xl shadow-violet-500/10' : 'bg-white/[0.02] hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/10'
                  } border border-white/[0.06] backdrop-blur-xl hover:border-violet-500/15`}>
                  <div className="rounded-xl overflow-hidden mb-2 bg-[#0a0a1a] p-2" style={{ aspectRatio: widget.size === '2×2' ? '1/1.2' : '2/1' }}>
                    <div className="flex justify-between items-center px-1 mb-1"><span style={{ fontSize: 7, opacity: 0.3 }}>9:41</span><div className="flex gap-1"><span style={{ fontSize: 6, opacity: 0.3 }}>📶</span><span style={{ fontSize: 6, opacity: 0.3 }}>🔋</span></div></div>
                    <div className="flex-1">{widget.render(cfg)}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-1"><span className="text-sm">{widget.icon}</span><div><div className="text-xs font-semibold">{widget.name}</div><div className="text-[10px] text-white/25">{widget.size}</div></div></div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Customization Panel */}
        {selectedWidget !== null && (
          <section className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] backdrop-blur-xl overflow-hidden shadow-xl shadow-violet-500/5">
            <div className="p-4 border-b border-white/[0.04]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">🎨 Customize: {widgets[selectedWidget].name}</h3>
                <button onClick={() => setSelectedWidget(null)} className="text-white/25 text-xs tap-feedback hover:text-white/50 transition-colors">✕</button>
              </div>
            </div>
            <div className="p-4 space-y-5">
              <div>
                <label className="text-xs font-semibold text-white/40 block mb-2 uppercase tracking-wider">Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map((theme) => (
                    <button key={theme.id} onClick={() => saveWidgetConfig(selectedWidget, { ...activeConfig, theme: theme.id })}
                      className={`rounded-lg p-2 text-center transition-all tap-feedback ${activeConfig.theme === theme.id ? 'ring-2 ring-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                      <div className="w-6 h-6 rounded-md mx-auto mb-1" style={{ background: theme.bg, border: `1px solid ${theme.border}` }} />
                      <span className="text-[9px] text-white/30">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 block mb-2 uppercase tracking-wider">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {BG_COLORS.map((color) => (
                    <button key={color} onClick={() => saveWidgetConfig(selectedWidget, { ...activeConfig, bgColor: color })}
                      className={`w-8 h-8 rounded-lg transition-all tap-feedback ${activeConfig.bgColor === color ? 'ring-2 ring-violet-500 scale-110 shadow-lg shadow-violet-500/20' : 'hover:scale-105'}`}
                      style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 block mb-2 uppercase tracking-wider">Text Size</label>
                <div className="flex gap-2">
                  {TEXT_SIZES.map((size) => (
                    <button key={size.id} onClick={() => saveWidgetConfig(selectedWidget, { ...activeConfig, textSize: size.id })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all tap-feedback ${activeConfig.textSize === size.id ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08]'}`}>
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 block mb-2 uppercase tracking-wider">Display Options</label>
                <div className="space-y-2">
                  {([ { key: 'showIcon' as const, label: 'Show Icon' }, { key: 'showTitle' as const, label: 'Show Title' }, { key: 'showSubtitle' as const, label: 'Show Subtitle' } ]).map(({ key, label }) => (
                    <button key={key} onClick={() => saveWidgetConfig(selectedWidget, { ...activeConfig, [key]: !activeConfig[key] })}
                      className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-all tap-feedback">
                      <span className="text-xs text-white/50">{label}</span>
                      <div className={`w-9 h-5 rounded-full transition-all flex items-center ${activeConfig[key] ? 'bg-violet-500 justify-end shadow-lg shadow-violet-500/20' : 'bg-white/10 justify-start'}`}>
                        <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/40 block mb-2 uppercase tracking-wider">Live Preview</label>
                <div className="rounded-2xl bg-[#0a0a1a] p-4 flex justify-center">
                  <div className="w-full max-w-[200px]">
                    <div className="rounded-3xl border-2 border-white/[0.08] p-3 bg-[#050510]">
                      <div className="flex justify-between items-center px-2 mb-3"><span style={{ fontSize: 10, opacity: 0.3 }}>9:41</span><div className="flex gap-1.5"><span style={{ fontSize: 8, opacity: 0.3 }}>📶</span><span style={{ fontSize: 8, opacity: 0.3 }}>🔋</span></div></div>
                      <div className="text-center mb-4"><div className="text-3xl font-thin text-white/20">17</div><div className="text-[10px] text-white/15 uppercase tracking-widest">Sunday, May</div></div>
                      {widgets[selectedWidget].render(activeConfig)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Daily Quote */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">Daily Quote Generator</h2>
          <p className="text-white/25 text-xs mb-4">Your clone generates a new quote every day</p>
          <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden shadow-xl shadow-black/10">
            <div className="p-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-sm italic text-white/70 leading-relaxed mb-3">&ldquo;{quoteLoading ? 'Generating wisdom...' : dailyQuote}&rdquo;</p>
                <p className="text-[10px] text-white/25">— Your Clone, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="p-3 border-t border-white/[0.04] flex justify-between items-center">
              <span className="text-[10px] text-white/20">Cached for 24 hours</span>
              <button onClick={generateQuote} disabled={quoteLoading}
                className="text-xs px-4 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 tap-feedback hover:bg-amber-500/20 hover:shadow-lg hover:shadow-amber-500/10 transition-all disabled:opacity-50 backdrop-blur-sm">
                {quoteLoading ? '⟳ Generating...' : '🔄 New Quote'}
              </button>
            </div>
          </div>
        </section>

        {/* Widget Themes */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">Widget Themes</h2>
          <p className="text-white/25 text-xs mb-4">Choose a visual style for your widgets</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {THEMES.map((theme) => (
              <div key={theme.id} className="snap-center shrink-0">
                <div className="w-36 rounded-2xl border border-white/[0.06] overflow-hidden backdrop-blur-xl hover:border-violet-500/20 transition-all">
                  <div className="p-3" style={{ background: theme.bg, minHeight: 90 }}>
                    <div style={{ color: theme.text, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{theme.name}</div>
                    <div style={{ color: theme.text, opacity: 0.4, fontSize: 9 }}>Widget preview</div>
                    <div className="mt-2 h-1.5 rounded-full" style={{ background: theme.accent, width: '60%' }} />
                  </div>
                  <div className="p-2 bg-white/[0.02] text-center"><span className="text-[10px] text-white/30">{theme.name}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Install Instructions */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">How to Install</h2>
          <p className="text-white/25 text-xs mb-4">Add widgets to your Android home screen</p>
          <div className="space-y-3">
            {installSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-4 rounded-xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-4 hover:border-violet-500/15 hover:bg-white/[0.03] transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/10 flex items-center justify-center text-xl shrink-0">{step.emoji}</div>
                <div>
                  <div className="flex items-center gap-2"><span className="text-[10px] text-violet-400 font-mono font-bold">Step {step.step}</span></div>
                  <h3 className="text-sm font-semibold mt-0.5">{step.title}</h3>
                  <p className="text-xs text-white/25 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 backdrop-blur-xl border border-violet-500/15 p-5 shadow-lg shadow-violet-500/5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="text-sm font-bold text-violet-400 mb-2">Pro Tips</h3>
                <ul className="space-y-1.5">
                  {['Resize widgets by long-pressing and dragging edges', 'The Clone Quote widget refreshes every 24 hours', 'Quick Add lets you save memories without opening the app', 'Your widget config syncs across devices via your account'].map((tip, i) => (
                    <li key={i} className="text-xs text-white/30 flex items-start gap-2"><span className="text-violet-400 mt-0.5">•</span>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
