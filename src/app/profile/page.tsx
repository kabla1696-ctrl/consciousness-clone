'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase-browser'
import AvatarUpload from '../../components/AvatarUpload'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setAvatarUrl(user.user_metadata?.avatar_url ?? null)
      setAuthLoading(false)
    })
  }, [])

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url)
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: url },
      })
      if (error) throw error
      setToast('Avatar updated!')
    } catch {
      setToast('Failed to save avatar')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (authLoading) {
    return null // loading.tsx handles this
  }

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split('@')[0] ??
    'User'

  const stats = [
    { label: 'Memories', value: '—', emoji: '🧠' },
    { label: 'Days Active', value: '—', emoji: '📅' },
    { label: 'Conversations', value: '—', emoji: '💬' },
  ]

  const settingsItems = [
    { icon: '🔔', label: 'Notifications', desc: 'Manage alerts', href: '/settings' },
    { icon: '🎨', label: 'Appearance', desc: 'Theme & display', href: '/settings' },
    { icon: '🔒', label: 'Privacy', desc: 'Data & security', href: '/settings' },
    { icon: '🌐', label: 'Language', desc: 'App language', href: '/settings' },
    { icon: '❓', label: 'Help & Support', desc: 'FAQ & contact', href: '/settings' },
  ]

  return (
    <main className="min-h-screen pb-24 md:pb-8" style={{ background: '#050510' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            ←
          </Link>
          <h1 className="text-base font-semibold text-white">Profile</h1>
          {saving && (
            <span className="ml-auto text-xs text-violet-400 animate-pulse">
              Saving…
            </span>
          )}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 relative z-10">
        {/* Profile hero */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 text-center space-y-4">
          <AvatarUpload
            userId={user?.id ?? ''}
            currentAvatar={avatarUrl}
            onUpload={handleAvatarUpload}
            size={96}
            name={displayName}
          />

          <div>
            <h2 className="text-lg font-bold text-white">{displayName}</h2>
            <p className="text-sm text-white/40">{user?.email}</p>
          </div>

          <div className="flex justify-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
              ✨ Pro
            </span>
            <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium">
              🧬 Clone Active
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 text-center"
            >
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
          <h3 className="text-sm font-semibold text-white/70 mb-2">About</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            {user?.user_metadata?.bio ?? 'No bio yet. Your consciousness clone is learning about you...'}
          </p>
        </div>

        {/* Settings list */}
        <div className="space-y-2">
          {settingsItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 flex items-center gap-3 hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-white/30">{item.desc}</div>
              </div>
              <span className="text-white/20">›</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-medium transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-sm text-white animate-[fadeInUp_0.3s_ease]">
          {toast}
        </div>
      )}
    </main>
  )
}
