'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase-browser'

interface CloneSettings {
  humor: number
  empathy: number
  formality: number
  creativity: number
  directness: number
  language: string
  responseStyle: string
  avatar: string
}

const DEFAULT_SETTINGS: CloneSettings = {
  humor: 50, empathy: 70, formality: 40, creativity: 60, directness: 50,
  language: 'mixed', responseStyle: 'medium', avatar: '🧠',
}

const AVATARS = ['🧠', '🤖', '👾', '🎭', '🔮', '✨', '🌀', '💡', '🦊', '🐉', '👻', '🦄']
const LANGUAGES = [
  { value: 'banglish', label: 'Banglish', desc: 'Bangla + English mix' },
  { value: 'english', label: 'English', desc: 'Pure English' },
  { value: 'mixed', label: 'Mixed', desc: 'Natural blend' },
]
const STYLES = [
  { value: 'short', label: 'Short', desc: 'Concise replies', icon: '⚡' },
  { value: 'medium', label: 'Medium', desc: 'Balanced', icon: '💬' },
  { value: 'long', label: 'Long', desc: 'Detailed', icon: '📝' },
]
const SLIDERS = [
  { key: 'humor' as const, label: 'Humor', icon: '😂', low: 'Serious', high: 'Funny' },
  { key: 'empathy' as const, label: 'Empathy', icon: '❤️', low: 'Logical', high: 'Caring' },
  { key: 'formality' as const, label: 'Formality', icon: '👔', low: 'Casual', high: 'Formal' },
  { key: 'creativity' as const, label: 'Creativity', icon: '🎨', low: 'Practical', high: 'Creative' },
  { key: 'directness' as const, label: 'Directness', icon: '🎯', low: 'Diplomatic', high: 'Direct' },
]

interface ChatMessage { role: 'user' | 'clone'; content: string }

export default function CloneSettings() {
  const [user, setUser] = useState<any>(null)
  const [settings, setSettings] = useState<CloneSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      const stored = localStorage.getItem('clone_settings')
      if (stored) { try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) }) } catch {} }
    }
    init()
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const updateSetting = <K extends keyof CloneSettings>(key: K, value: CloneSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value })); setSaved(false)
  }

  const saveSettings = () => {
    localStorage.setItem('clone_settings', JSON.stringify(settings))
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading || !user) return
    const userContent = chatInput.trim(); setChatInput('')
    const userMsg: ChatMessage = { role: 'user', content: userContent }
    setChatMessages(prev => [...prev, userMsg]); setChatLoading(true)
    try {
      const { data: memories } = await supabase.from('memories').select('content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
      const memoryContext = memories?.map(m => m.content).join('\n') || ''
      const systemPrompt = `You are a consciousness clone with these personality settings:\n- Humor: ${settings.humor}% (0=serious, 100=hilarious)\n- Empathy: ${settings.empathy}% (0=logical, 100=deeply caring)\n- Formality: ${settings.formality}% (0=casual, 100=formal)\n- Creativity: ${settings.creativity}% (0=practical, 100=imaginative)\n- Directness: ${settings.directness}% (0=diplomatic, 100=blunt)\n- Language preference: ${settings.language}\n- Response style: ${settings.responseStyle}\n\nAdjust your personality based on these settings. If humor is high, be witty. If empathy is high, be warm. If formality is low, use casual language. Match the ${settings.language} language preference.`
      const response = await fetch('https://consciousness-clone.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'system', content: systemPrompt }, ...chatMessages.slice(-6).map(m => ({ role: m.role === 'clone' ? 'assistant' : m.role, content: m.content })), { role: 'user', content: userContent }], memories: memoryContext }),
      })
      if (!response.ok) throw new Error('API error')
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'clone', content: data.reply || 'Hmm, thinking...' }])
    } catch (err) {
      console.error('Chat error:', err)
      setChatMessages(prev => [...prev, { role: 'clone', content: 'Oops, my brain glitched. Try again! 🧠' }])
    }
    setChatLoading(false)
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-xl hover:bg-white/[0.04] transition-colors">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-base shadow-lg shadow-violet-500/20">⚙️</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Clone Settings</h1>
            <p className="text-[10px] text-white/30">Customize your clone&apos;s personality</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto relative z-10">
        {/* Avatar Selection */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 mb-6 shadow-xl shadow-black/10 hover:border-violet-500/15 transition-all duration-500">
          <h3 className="text-sm font-bold mb-4 tracking-wide">🎭 Clone Avatar</h3>
          <div className="grid grid-cols-6 gap-2.5">
            {AVATARS.map(avatar => (
              <button key={avatar} onClick={() => updateSetting('avatar', avatar)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl tap-feedback transition-all duration-300 ${
                  settings.avatar === avatar
                    ? 'bg-violet-500/20 border-2 border-violet-500/40 shadow-lg shadow-violet-500/20 scale-110'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:scale-105 hover:border-violet-500/20'
                }`}>
                {avatar}
              </button>
            ))}
          </div>
        </div>

        {/* Personality Sliders */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 mb-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold mb-5 tracking-wide">🧬 Personality Traits</h3>
          <div className="space-y-6">
            {SLIDERS.map(slider => (
              <div key={slider.key}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{slider.icon}</span>
                    <span className="text-sm font-semibold">{slider.label}</span>
                  </div>
                  <span className="text-violet-400 text-sm font-mono bg-violet-500/10 px-2 py-0.5 rounded-lg">{settings[slider.key]}%</span>
                </div>
                <div className="relative">
                  <input type="range" min={0} max={100} value={settings[slider.key]}
                    onChange={e => updateSetting(slider.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-white/[0.06] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-violet-500 [&::-webkit-slider-thumb]:to-fuchsia-500
                      [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/40 [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:hover:shadow-xl [&::-webkit-slider-thumb]:hover:shadow-violet-500/60 [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-all
                      [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-violet-500 [&::-moz-range-thumb]:to-fuchsia-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer" />
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-white/20">{slider.low}</span>
                    <span className="text-[10px] text-white/20">{slider.high}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Preference */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 mb-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold mb-4 tracking-wide">🌐 Language Preference</h3>
          <div className="space-y-2.5">
            {LANGUAGES.map(lang => (
              <button key={lang.value} onClick={() => updateSetting('language', lang.value)}
                className={`w-full p-3.5 rounded-xl border flex items-center gap-3 tap-feedback transition-all duration-300 ${
                  settings.language === lang.value
                    ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/5'
                    : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]'
                }`}>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  settings.language === lang.value ? 'border-violet-400' : 'border-white/20'
                }`}>
                  {settings.language === lang.value && <div className="w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{lang.label}</p>
                  <p className="text-[10px] text-white/25">{lang.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Response Style */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 mb-6 shadow-xl shadow-black/10">
          <h3 className="text-sm font-bold mb-4 tracking-wide">💬 Response Style</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {STYLES.map(style => (
              <button key={style.value} onClick={() => updateSetting('responseStyle', style.value)}
                className={`p-4 rounded-xl border text-center tap-feedback transition-all duration-300 ${
                  settings.responseStyle === style.value
                    ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/5 scale-[1.02]'
                    : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08] hover:scale-[1.02]'
                }`}>
                <div className="text-3xl mb-2">{style.icon}</div>
                <p className="text-sm font-semibold">{style.label}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button onClick={saveSettings}
          className={`w-full py-4 rounded-xl font-semibold text-base tap-feedback mb-8 transition-all duration-500 relative overflow-hidden ${
            saved
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 shadow-xl shadow-violet-500/20 hover:shadow-2xl hover:shadow-violet-500/30 hover:scale-[1.01] active:scale-[0.99]'
          }`}>
          {saved ? '✓ Settings Saved!' : '💾 Save Settings'}
        </button>

        {/* Preview Chat */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] overflow-hidden shadow-xl shadow-black/10">
          <div className="p-4 border-b border-white/[0.04] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20">
              {settings.avatar}
            </div>
            <div>
              <h3 className="text-sm font-bold">Talk to Your Clone</h3>
              <p className="text-[10px] text-white/25">Preview your customized clone</p>
            </div>
          </div>

          <div className="h-64 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 animate-bounce">{settings.avatar}</div>
                <p className="text-white/25 text-sm">Say hello to your clone!</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-br-sm shadow-lg shadow-violet-500/10'
                    : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm'
                }`}>
                  <p className="text-white/90 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-white/[0.06] px-4 py-3 bg-white/[0.03]">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-violet-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-white/[0.04] flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
              placeholder="Talk to your clone..."
              className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 transition-all text-white placeholder:text-white/15 text-sm" />
            <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl text-sm font-semibold tap-feedback disabled:opacity-30 hover:shadow-lg hover:shadow-violet-500/20 transition-all">
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
