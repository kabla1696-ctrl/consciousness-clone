'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase-browser'
import AvatarUpload from '../../components/AvatarUpload'
import AnimatedCounter from '../../components/AnimatedCounter'
import ActivityFeed from '../../components/ActivityFeed'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('../../components/BarChart'), { ssr: false })
import { fetchDashboardStats, type DashboardStats } from '../../lib/dashboard-data'
import type { User } from '@supabase/supabase-js'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [personalityTraits, setPersonalityTraits] = useState<{ label: string; value: number; color: string }[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      setAvatarUrl(user.user_metadata?.avatar_url ?? null)
      setDisplayName(
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        'User'
      )
      setBio(user.user_metadata?.bio ?? '')
      setAuthLoading(false)
      setTimeout(() => setIsLoaded(true), 100)

      // Fetch stats
      try {
        const s = await fetchDashboardStats()
        setStats(s)
      } catch { /* ignore */ }

      // Load personality traits from localStorage
      try {
        const raw = localStorage.getItem('cc_personality_traits')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPersonalityTraits(parsed)
          }
        }
        // Fallback: try to load from memories personality category
        if (!raw) {
          const mems = JSON.parse(localStorage.getItem('cc_memories') || '[]')
          const personalityMem = (mems as Record<string, unknown>[]).find((m: Record<string, unknown>) => m.category === 'personality')
          if (personalityMem?.content) {
            // Parse trait names from content like "Personality Profile: creative, analytical, ..."
            const match = (personalityMem.content as string).match(/Personality Profile: ([^.]+)/)
            if (match) {
              const traitNames = match[1].split(',').map((t: string) => t.trim())
              const colors = ['#8b5cf6', '#d946ef', '#06b6d4', '#f59e0b', '#10b981']
              const traits = traitNames.map((name: string, i: number) => ({
                label: name.charAt(0).toUpperCase() + name.slice(1),
                value: Math.max(40, 100 - i * 12),
                color: colors[i % colors.length],
              }))
              setPersonalityTraits(traits)
            }
          }
        }
      } catch { /* ignore */ }
    }
    init()
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

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName, bio },
      })
      if (error) throw error
      setToast('Profile saved!')
      setEditing(false)
    } catch {
      setToast('Failed to save profile')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDeleteAccount = async () => {
    setSaving(true)
    try {
      // Clear local data
      localStorage.clear()
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch {
      setToast('Failed to delete account')
      setSaving(false)
    }
  }

  const handleClearData = () => {
    try {
      const keysToKeep = ['cc_theme', 'cc_language']
      const allKeys = Object.keys(localStorage)
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key)
        }
      })
      setToast('All data cleared!')
      setStats(null)
      setPersonalityTraits([])
    } catch {
      setToast('Failed to clear data')
    }
    setShowClearConfirm(false)
    setTimeout(() => setToast(null), 3000)
  }

  if (authLoading) {
    return null // loading.tsx handles this
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const statsData = [
    { label: 'Memories', value: stats?.memoryCount ?? 0, emoji: '🧠' },
    { label: 'Days Active', value: stats?.streakDays ?? 0, emoji: '📅' },
    { label: 'Achievements', value: stats?.achievementCount ?? 0, emoji: '🏆' },
    { label: 'Streak', value: stats?.streakDays ?? 0, emoji: '🔥' },
  ]

  const quickLinks = [
    { icon: '⚙️', label: 'Settings', href: '/settings', gradient: 'from-violet-500/20 to-purple-500/20' },
    { icon: '💾', label: 'Backup', href: '/backup', gradient: 'from-blue-500/20 to-cyan-500/20' },
    { icon: '🏆', label: 'Achievements', href: '/achievements', gradient: 'from-amber-500/20 to-orange-500/20' },
    { icon: '🤝', label: 'Relationships', href: '/relationships', gradient: 'from-pink-500/20 to-rose-500/20' },
  ]

  return (
    <main className="min-h-screen pb-24 md:pb-8 overflow-x-hidden" style={{ background: '#050510' }}>
      {/* Animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#d946ef' : '#06b6d4',
              '--duration': `${Math.random() * 10 + 6}s`,
              '--delay': `${Math.random() * 5}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

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

      <div className="px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* ── Profile Header ── */}
        <div
          className={`bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 text-center space-y-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <AvatarUpload
            userId={user?.id ?? ''}
            currentAvatar={avatarUrl}
            onUpload={handleAvatarUpload}
            size={120}
            name={displayName}
          />

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
                placeholder="Display name"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditing(false)
                    setDisplayName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'User')
                    setBio(user?.user_metadata?.bio ?? '')
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/60 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-bold text-white">{displayName}</h2>
                <p className="text-sm text-white/40 mt-0.5">{user?.email}</p>
                <p className="text-xs text-white/25 mt-1">Member since {memberSince}</p>
              </div>

              <div className="flex justify-center gap-2 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium">
                  ✨ Pro
                </span>
                <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium">
                  🧬 Clone Active
                </span>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-2 px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] text-white/70 text-sm font-medium transition-colors"
              >
                ✏️ Edit Profile
              </button>
            </>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          {statsData.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-3 text-center"
            >
              <div className="text-lg mb-1">{s.emoji}</div>
              <div className="text-lg font-bold text-white">
                <AnimatedCounter end={s.value} duration={1000} />
              </div>
              <div className="text-[9px] text-white/30 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Bio / About ── */}
        <div
          className={`bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-semibold text-white/70 mb-2">About</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            {bio || 'No bio yet. Your consciousness clone is learning about you...'}
          </p>
        </div>

        {/* ── Personality Card ── */}
        <div
          className={`bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/70">🧬 Personality Profile</h3>
            <Link
              href="/personality"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Retake Quiz →
            </Link>
          </div>

          {personalityTraits.length > 0 ? (
            <BarChart
              data={personalityTraits.map(t => ({
                label: t.label,
                value: t.value,
                color: `linear-gradient(to top, ${t.color}cc, ${t.color})`,
              }))}
              height={160}
              showLabels={true}
            />
          ) : (
            <div className="text-center py-6">
              <p className="text-white/30 text-sm mb-3">
                Take the personality quiz to see your traits
              </p>
              <Link
                href="/personality"
                className="inline-block px-4 py-2 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/30 transition-colors"
              >
                🧬 Take Quiz
              </Link>
            </div>
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div
          className={`bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-semibold text-white/70 mb-4">📊 Recent Activity</h3>
          <ActivityFeed />
        </div>

        {/* ── Quick Links ── */}
        <div
          className={`transition-all duration-700 delay-[350ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h3 className="text-sm font-semibold text-white/70 mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`bg-white/[0.03] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3 hover:bg-white/[0.06] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-lg`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div
          className={`bg-white/[0.02] rounded-2xl border border-red-500/20 p-5 transition-all duration-700 delay-[400ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <h3 className="text-sm font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl p-3.5 text-orange-400 text-sm font-medium transition-colors text-left flex items-center gap-3"
            >
              <span>🗑️</span>
              <div>
                <div>Clear All Data</div>
                <div className="text-xs text-orange-400/50 font-normal mt-0.5">Remove all local memories, chats, and settings</div>
              </div>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl p-3.5 text-red-400 text-sm font-medium transition-colors text-left flex items-center gap-3"
            >
              <span>☠️</span>
              <div>
                <div>Delete Account</div>
                <div className="text-xs text-red-400/50 font-normal mt-0.5">Permanently delete your account and all data</div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Logout ── */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl p-4 text-white/50 hover:text-white/70 text-sm font-medium transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a1a] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-red-400">Delete Account?</h3>
            <p className="text-sm text-white/50">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Data Confirmation Modal ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a1a] border border-orange-500/30 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-orange-400">Clear All Data?</h3>
            <p className="text-sm text-white/50">
              This will remove all your local memories, chat history, and settings. Your account will remain active.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] text-white/60 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-sm text-white animate-[fadeInUp_0.3s_ease]">
          {toast}
        </div>
      )}
    </main>
  )
}
