'use client'
import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'

export default function SettingsPage() {
  const { theme, setTheme, themes } = useTheme()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-8" style={{ color: theme.color }}>
          ⚙️ Settings
        </h1>

        {/* Accent Color */}
        <section className="glass-card p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Accent Color
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-12 h-12 rounded-full transition-all duration-300 border-2"
                  style={{
                    background: t.color,
                    borderColor: theme.id === t.id ? 'white' : 'transparent',
                    boxShadow: theme.id === t.id ? `0 0 20px ${t.glow}` : 'none',
                    transform: theme.id === t.id ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
                <span
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: theme.id === t.id ? t.color : 'rgba(255,255,255,0.4)' }}
                >
                  {t.name}
                </span>
              </button>
            ))}
          </div>
          {/* Preview */}
          <div
            className="mt-5 p-4 rounded-xl text-center text-sm font-semibold transition-all duration-500"
            style={{
              background: theme.glow,
              color: theme.color,
              border: `1px solid ${theme.color}33`,
            }}
          >
            Preview — {theme.name} theme active
          </div>
        </section>

        {/* Sound Effects */}
        <section className="glass-card p-5 mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">🔊 Sound Effects</h2>
            <p className="text-sm text-white/40 mt-1">Haptic & audio feedback</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-14 h-8 rounded-full relative transition-all duration-300"
            style={{
              background: soundEnabled ? theme.color : 'rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: soundEnabled ? '30px' : '4px' }}
            />
          </button>
        </section>

        {/* Notifications */}
        <section className="glass-card p-5 mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">🔔 Notifications</h2>
            <p className="text-sm text-white/40 mt-1">Push & in-app alerts</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="w-14 h-8 rounded-full relative transition-all duration-300"
            style={{
              background: notificationsEnabled ? theme.color : 'rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300"
              style={{ left: notificationsEnabled ? '30px' : '4px' }}
            />
          </button>
        </section>

        {/* Language */}
        <a href="/language" className="glass-card p-5 mb-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors block">
          <div>
            <h2 className="font-semibold">🌐 Language</h2>
            <p className="text-sm text-white/40 mt-1">Change app language</p>
          </div>
          <span className="text-white/30">→</span>
        </a>

        {/* Privacy */}
        <a href="/privacy" className="glass-card p-5 mb-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors block">
          <div>
            <h2 className="font-semibold">🔒 Privacy</h2>
            <p className="text-sm text-white/40 mt-1">Data & visibility controls</p>
          </div>
          <span className="text-white/30">→</span>
        </a>

        {/* About */}
        <section className="glass-card p-5 mb-4">
          <h2 className="font-semibold mb-2">ℹ️ About</h2>
          <div className="text-sm text-white/40 space-y-1">
            <p>Consciousness Clone v2.0.0</p>
            <p>Digital consciousness platform</p>
          </div>
        </section>
      </div>
    </div>
  )
}
