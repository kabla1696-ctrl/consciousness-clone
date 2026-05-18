'use client'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/lib/theme-context'

// ── Collapsible Card ────────────────────────────────────────────
function SettingsCard({
  icon,
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  icon: string
  title: string
  subtitle?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="glass-card mb-3 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <h2 className="font-semibold">{icon} {title}</h2>
          {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        <svg
          className="w-5 h-5 text-white/30 transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? '600px' : '0px',
          opacity: open ? 1 : 0,
          overflow: 'hidden',
        }}
      >
        <div className="px-5 pb-5 pt-0">{children}</div>
      </div>
    </section>
  )
}

// ── Toggle Switch ───────────────────────────────────────────────
function Toggle({
  enabled,
  onToggle,
  accentColor,
}: {
  enabled: boolean
  onToggle: () => void
  accentColor: string
}) {
  return (
    <button
      onClick={onToggle}
      className="w-14 h-8 rounded-full relative transition-all duration-300 flex-shrink-0"
      style={{
        background: enabled ? accentColor : 'rgba(255,255,255,0.1)',
      }}
    >
      <div
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: enabled ? '30px' : '4px' }}
      />
    </button>
  )
}

// ── Toggle Row ──────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
  accentColor,
}: {
  label: string
  description?: string
  enabled: boolean
  onToggle: () => void
  accentColor: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} accentColor={accentColor} />
    </div>
  )
}

// ── Action Button ───────────────────────────────────────────────
function ActionButton({
  label,
  onClick,
  variant = 'default',
  accentColor,
}: {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  accentColor: string
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border"
      style={
        variant === 'danger'
          ? {
              background: 'rgba(239,68,68,0.1)',
              borderColor: 'rgba(239,68,68,0.2)',
              color: '#ef4444',
            }
          : {
              background: `rgba(${accentColor.match(/\d+/g)?.join(',') || '139,92,246'},0.1)`,
              borderColor: `rgba(${accentColor.match(/\d+/g)?.join(',') || '139,92,246'},0.2)`,
              color: accentColor,
            }
      }
    >
      {label}
    </button>
  )
}

// ── Confirmation Modal ──────────────────────────────────────────
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  accentColor,
}: {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  accentColor: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="glass-card p-6 max-w-sm w-full relative z-10 border border-white/10">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/60 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: accentColor, color: '#fff' }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Settings Page ──────────────────────────────────────────
export default function SettingsPage() {
  const { theme, setTheme, themes, colorMode, toggleColorMode } = useTheme()

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [hapticEnabled, setHapticEnabled] = useState(true)

  // Privacy toggles
  const [profileVisible, setProfileVisible] = useState(true)
  const [activityStatus, setActivityStatus] = useState(true)

  // Modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', onConfirm: () => {} })

  // Toast notification
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Persist notification prefs
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cc_notifications')
      if (stored) {
        const p = JSON.parse(stored)
        if (p.push !== undefined) setPushEnabled(p.push)
        if (p.email !== undefined) setEmailEnabled(p.email)
        if (p.sound !== undefined) setSoundEnabled(p.sound)
        if (p.haptic !== undefined) setHapticEnabled(p.haptic)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        'cc_notifications',
        JSON.stringify({ push: pushEnabled, email: emailEnabled, sound: soundEnabled, haptic: hapticEnabled })
      )
    } catch {}
  }, [pushEnabled, emailEnabled, soundEnabled, hapticEnabled])

  // Persist privacy prefs
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cc_privacy')
      if (stored) {
        const p = JSON.parse(stored)
        if (p.profileVisible !== undefined) setProfileVisible(p.profileVisible)
        if (p.activityStatus !== undefined) setActivityStatus(p.activityStatus)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        'cc_privacy',
        JSON.stringify({ profileVisible, activityStatus })
      )
    } catch {}
  }, [profileVisible, activityStatus])

  // ── Actions ────────────────────────────────────────────────────
  const handleClearSearchHistory = () => {
    setConfirmModal({
      open: true,
      title: 'Clear Search History',
      message: 'This will permanently delete your search history. This action cannot be undone.',
      onConfirm: () => {
        try { localStorage.removeItem('cc_search_history') } catch {}
        setConfirmModal(m => ({ ...m, open: false }))
        showToast('Search history cleared')
      },
    })
  }

  const handleClearActivityHistory = () => {
    setConfirmModal({
      open: true,
      title: 'Clear Activity History',
      message: 'This will permanently delete your activity history. This action cannot be undone.',
      onConfirm: () => {
        try { localStorage.removeItem('cc_activity_history') } catch {}
        setConfirmModal(m => ({ ...m, open: false }))
        showToast('Activity history cleared')
      },
    })
  }

  const handleClearAllData = () => {
    setConfirmModal({
      open: true,
      title: 'Clear All Local Data',
      message:
        'This will remove ALL locally stored data including settings, preferences, and cached content. You will need to reconfigure the app. This action cannot be undone.',
      onConfirm: () => {
        try { localStorage.clear() } catch {}
        setConfirmModal(m => ({ ...m, open: false }))
        showToast('All local data cleared')
      },
    })
  }

  const handleExportData = () => {
    window.location.href = '/backup'
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
          })
          showToast('Data imported successfully — reloading…')
          setTimeout(() => window.location.reload(), 1200)
        } catch {
          showToast('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 sm:px-6 py-8 overflow-x-hidden">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.color }}>
          ⚙️ Settings
        </h1>

        {/* ── 1. Appearance ─────────────────────────────────────── */}
        <SettingsCard icon="🎨" title="Appearance" subtitle="Theme & accent color" defaultOpen>
          {/* Dark / Light mode toggle */}
          <div className="flex items-center justify-between py-3 mb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <span className="text-xl">{colorMode === 'dark' ? '🌙' : '☀️'}</span>
              <div>
                <p className="font-medium text-sm">{colorMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-white/40 mt-0.5">Switch between dark and light themes</p>
              </div>
            </div>
            <button
              onClick={toggleColorMode}
              className="relative w-16 h-8 rounded-full transition-all duration-300 flex items-center"
              style={{
                background: colorMode === 'dark'
                  ? 'rgba(99,102,241,0.3)'
                  : 'rgba(250,204,21,0.3)',
              }}
            >
              <div
                className="absolute w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-300 shadow-md"
                style={{
                  left: colorMode === 'dark' ? '4px' : '36px',
                  background: colorMode === 'dark' ? '#6366f1' : '#facc15',
                }}
              >
                {colorMode === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-4">
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
            className="p-4 rounded-xl text-center text-sm font-semibold transition-all duration-500"
            style={{
              background: theme.glow,
              color: theme.color,
              border: `1px solid ${theme.color}33`,
            }}
          >
            Preview — {theme.name} theme active
          </div>
        </SettingsCard>

        {/* ── 2. Notifications ──────────────────────────────────── */}
        <SettingsCard icon="🔔" title="Notifications" subtitle="Push, email & feedback">
          <ToggleRow
            label="Push Notifications"
            description="Receive push alerts on this device"
            enabled={pushEnabled}
            onToggle={() => setPushEnabled(!pushEnabled)}
            accentColor={theme.color}
          />
          <ToggleRow
            label="Email Notifications"
            description="Get notified via email"
            enabled={emailEnabled}
            onToggle={() => setEmailEnabled(!emailEnabled)}
            accentColor={theme.color}
          />
          <ToggleRow
            label="Sound Effects"
            description="Audio feedback for actions"
            enabled={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
            accentColor={theme.color}
          />
          <ToggleRow
            label="Haptic Feedback"
            description="Vibration on supported devices"
            enabled={hapticEnabled}
            onToggle={() => setHapticEnabled(!hapticEnabled)}
            accentColor={theme.color}
          />
        </SettingsCard>

        {/* ── 3. Privacy ────────────────────────────────────────── */}
        <SettingsCard icon="🔒" title="Privacy" subtitle="Visibility & data controls">
          <ToggleRow
            label="Profile Visibility"
            description="Allow others to see your profile"
            enabled={profileVisible}
            onToggle={() => setProfileVisible(!profileVisible)}
            accentColor={theme.color}
          />
          <ToggleRow
            label="Activity Status"
            description="Show when you are online"
            enabled={activityStatus}
            onToggle={() => setActivityStatus(!activityStatus)}
            accentColor={theme.color}
          />
          <div className="mt-4 space-y-2">
            <ActionButton
              label="Clear Search History"
              onClick={handleClearSearchHistory}
              accentColor={theme.color}
            />
            <ActionButton
              label="Clear Activity History"
              onClick={handleClearActivityHistory}
              accentColor={theme.color}
            />
          </div>
        </SettingsCard>

        {/* ── 4. Data ───────────────────────────────────────────── */}
        <SettingsCard icon="💾" title="Data" subtitle="Backup, import & storage">
          <div className="space-y-2">
            <ActionButton
              label="📤  Export Data"
              onClick={handleExportData}
              accentColor={theme.color}
            />
            <ActionButton
              label="📥  Import Data"
              onClick={handleImportData}
              accentColor={theme.color}
            />
            <div className="pt-2">
              <ActionButton
                label="🗑️  Clear All Local Data"
                onClick={handleClearAllData}
                variant="danger"
                accentColor={theme.color}
              />
            </div>
          </div>
        </SettingsCard>

        {/* ── 5. Language ───────────────────────────────────────── */}
        <SettingsCard icon="🌐" title="Language" subtitle="Display language">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Current language</p>
              <p className="font-semibold mt-0.5">English</p>
            </div>
            <a
              href="/language"
              className="text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{
                background: `rgba(${theme.color.match(/\d+/g)?.join(',') || '139,92,246'},0.1)`,
                color: theme.color,
              }}
            >
              Change →
            </a>
          </div>
        </SettingsCard>

        {/* ── 6. About ──────────────────────────────────────────── */}
        <SettingsCard icon="ℹ️" title="About" subtitle="Version & legal">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/50">App Version</span>
              <span className="font-mono font-semibold">v2.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Build</span>
              <span className="font-mono font-semibold">#2024.05.18</span>
            </div>
            <div className="border-t border-white/[0.06] pt-3 space-y-2">
              <a href="/privacy-policy" className="flex items-center justify-between hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <span>Privacy Policy</span>
                <span className="text-white/30">→</span>
              </a>
              <a href="/terms" className="flex items-center justify-between hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <span>Terms of Service</span>
                <span className="text-white/30">→</span>
              </a>
              <a href="/blog" className="flex items-center justify-between hover:bg-white/[0.02] -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <span>Blog</span>
                <span className="text-white/30">→</span>
              </a>
            </div>
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-white/40 text-xs mb-2">Follow us</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                >
                  𝕏
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                >
                  ⟨/⟩
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                >
                  🎮
                </a>
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>

      {/* ── Confirmation Modal ────────────────────────────────── */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(m => ({ ...m, open: false }))}
        accentColor={theme.color}
      />

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div
            className="px-5 py-3 rounded-xl text-sm font-semibold shadow-lg backdrop-blur-md"
            style={{
              background: `${theme.color}22`,
              color: theme.color,
              border: `1px solid ${theme.color}44`,
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}
