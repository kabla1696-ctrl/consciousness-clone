'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'

interface NotificationSettings {
  memoryReminders: 'daily' | 'weekly' | 'never'
  achievementNotifications: boolean
  socialActivity: boolean
  systemUpdates: boolean
  marketingEmails: boolean
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  notificationSound: boolean
  emailFrequency: 'instant' | 'daily' | 'weekly'
}

const STORAGE_KEY = 'cc-notification-settings'

const DEFAULT_SETTINGS: NotificationSettings = {
  memoryReminders: 'daily',
  achievementNotifications: true,
  socialActivity: true,
  systemUpdates: true,
  marketingEmails: false,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  notificationSound: true,
  emailFrequency: 'daily',
}

function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean
  onChange: (val: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-white/80">{label}</div>
        {description && <div className="text-xs text-white/30 mt-0.5">{description}</div>}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
          enabled ? 'bg-violet-500/40 border-violet-500/50' : 'bg-white/5 border-white/10'
        } border`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-lg transition duration-300 ease-in-out mt-[2px] ${
            enabled ? 'translate-x-6 bg-violet-400' : 'translate-x-[3px] bg-white/30'
          }`}
        />
      </button>
    </div>
  )
}

function SelectField({
  value,
  onChange,
  label,
  description,
  options,
}: {
  value: string
  onChange: (val: string) => void
  label: string
  description?: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-sm font-medium text-white/80">{label}</div>
          {description && <div className="text-xs text-white/30 mt-0.5">{description}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
              value === opt.value
                ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                : 'glass-card text-white/40 hover:text-white/60'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TimeField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (val: string) => void
  label: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-white/50">{label}</span>
      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-violet-500/40 transition-colors"
      />
    </div>
  )
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
    } catch {}
  }, [])

  const update = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }, [settings])

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <div className="ambient-orb ambient-orb-violet" style={{ width: 250, height: 250, top: '5%', left: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '15%', right: '-8%' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/notifications" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold gradient-text">Notification Settings</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Categories */}
        <section className="glass-card rounded-2xl p-5 space-y-1">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Categories</h2>
          <div className="divide-y divide-white/[0.04]">
            <SelectField
              value={settings.memoryReminders}
              onChange={val => update('memoryReminders', val as NotificationSettings['memoryReminders'])}
              label="🧠 Memory Reminders"
              description="Get reminded to save new memories"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'never', label: 'Never' },
              ]}
            />
            <ToggleSwitch
              enabled={settings.achievementNotifications}
              onChange={val => update('achievementNotifications', val)}
              label="🏆 Achievement Notifications"
              description="Get notified when you unlock achievements"
            />
            <ToggleSwitch
              enabled={settings.socialActivity}
              onChange={val => update('socialActivity', val)}
              label="👥 Social Activity"
              description="Likes, comments, and new followers"
            />
            <ToggleSwitch
              enabled={settings.systemUpdates}
              onChange={val => update('systemUpdates', val)}
              label="⚙️ System Updates"
              description="App updates and maintenance notices"
            />
            <ToggleSwitch
              enabled={settings.marketingEmails}
              onChange={val => update('marketingEmails', val)}
              label="📧 Marketing Emails"
              description="Promotions, tips, and newsletters"
            />
          </div>
        </section>

        {/* Quiet Hours */}
        <section className="glass-card rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Quiet Hours</h2>
          <ToggleSwitch
            enabled={settings.quietHoursEnabled}
            onChange={val => update('quietHoursEnabled', val)}
            label="🌙 Enable Quiet Hours"
            description="Silence notifications during set hours"
          />
          {settings.quietHoursEnabled && (
            <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-1 fade-in-up">
              <TimeField
                value={settings.quietHoursStart}
                onChange={val => update('quietHoursStart', val)}
                label="Start time"
              />
              <TimeField
                value={settings.quietHoursEnd}
                onChange={val => update('quietHoursEnd', val)}
                label="End time"
              />
            </div>
          )}
        </section>

        {/* Sound & Email */}
        <section className="glass-card rounded-2xl p-5 space-y-1">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Delivery</h2>
          <div className="divide-y divide-white/[0.04]">
            <ToggleSwitch
              enabled={settings.notificationSound}
              onChange={val => update('notificationSound', val)}
              label="🔊 Notification Sound"
              description="Play a sound for incoming notifications"
            />
            <SelectField
              value={settings.emailFrequency}
              onChange={val => update('emailFrequency', val as NotificationSettings['emailFrequency'])}
              label="📬 Email Frequency"
              description="How often to receive email notifications"
              options={[
                { value: 'instant', label: 'Instant' },
                { value: 'daily', label: 'Daily Digest' },
                { value: 'weekly', label: 'Weekly Digest' },
              ]}
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'btn-gradient glow-btn'
            }`}
          >
            {saved ? '✓ Settings Saved' : 'Save Settings'}
          </button>
        </div>

        {/* Info */}
        <p className="text-center text-[10px] text-white/15 pt-2">
          Settings are stored locally on this device.
        </p>
      </div>
    </main>
  )
}
