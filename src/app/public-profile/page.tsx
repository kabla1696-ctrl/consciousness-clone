'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'
import OptimizedImage from '@/components/OptimizedImage'
import { useT } from '../../lib/language-context'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  display_name: string
  bio: string
  avatar_url: string
  is_public: boolean
  total_chats: number
  rating: number
  created_at: string
}

export default function PublicProfile() {
  const t = useT()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadProfile(user.id)
      const pic = localStorage.getItem('cc_profile_pic')
      if (pic) setProfilePic(pic)
    }
    init()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('public_profiles')
        .select('id, user_id, display_name, bio, avatar_url, is_public, total_chats, rating, created_at')
        .eq('user_id', userId)
        .single()

      if (data) {
        setProfile(data as Profile)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
        setIsPublic(data.is_public || false)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName.trim(),
        bio: bio.trim(),
        is_public: isPublic,
      }

      if (profile) {
        const { data } = await supabase
          .from('public_profiles')
          .update(profileData)
          .eq('id', profile.id)
          .select()
          .single()

        if (data) setProfile(data as Profile)
      } else {
        const { data } = await supabase
          .from('public_profiles')
          .insert({ ...profileData, total_chats: 0, rating: 0 })
          .select()
          .single()

        if (data) setProfile(data as Profile)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    }

    setSaving(false)
  }

  const copyShareLink = () => {
    const link = `${window.location.origin}/clone/${user?.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getShareLink = () => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/clone/${user?.id}`
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <div className="text-white/30 text-sm">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-600/[0.04] rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-fuchsia-600/[0.03] rounded-full blur-[128px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-amber-600/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.05] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1.5 rounded-lg hover:bg-white/[0.05] transition">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{t('public profile')}</h1>
        </div>
      </header>

      <div className="relative z-10 pt-6 px-4 max-w-2xl mx-auto pb-24 md:pb-8">
        {/* Profile Preview Card */}
        <div className="relative rounded-2xl border border-white/[0.08] p-6 mb-6 backdrop-blur-2xl bg-white/[0.02]">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-fuchsia-500/[0.02] pointer-events-none" />

          <div className="relative flex items-center gap-5 mb-6">
            {/* Avatar with glow + upload */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold shadow-xl shadow-violet-500/20 border border-white/[0.1]">
                {profilePic ? <OptimizedImage src={profilePic} alt="Profile" width={80} height={80} className="w-full h-full object-cover rounded-2xl" /> : (displayName ? displayName[0].toUpperCase() : '🧠')}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-500 border-2 border-[#050510] flex items-center justify-center text-[10px] cursor-pointer tap-feedback shadow-lg z-10">
                📷
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => { setProfilePic(reader.result as string); localStorage.setItem('cc_profile_pic', reader.result as string) }
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{displayName || 'Your Clone'}</h2>
              <p className="text-white/30 text-sm mt-1">{bio || 'No bio yet'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="relative grid grid-cols-3 gap-3">
            {[
              { value: profile?.total_chats || 0, label: 'Chats', color: 'text-violet-400', glow: 'shadow-violet-500/10' },
              { value: profile?.rating?.toFixed(1) || '0.0', suffix: '⭐', label: 'Rating', color: 'text-amber-400', glow: 'shadow-amber-500/10' },
              { value: isPublic ? '🌍' : '🔒', label: isPublic ? 'Public' : 'Private', color: isPublic ? 'text-emerald-400' : 'text-white/30', glow: isPublic ? 'shadow-emerald-500/10' : '' },
            ].map((stat, i) => (
              <div key={i} className={`text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 shadow-lg ${stat.glow}`}>
                <div className={`text-xl font-bold ${stat.color} drop-shadow-lg`}>{stat.value}{stat.suffix}</div>
                <div className="text-white/20 text-xs mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="relative rounded-2xl border border-white/[0.06] p-6 mb-6 backdrop-blur-2xl bg-white/[0.015]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent" />

          <h3 className="relative text-lg font-semibold mb-5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Edit Profile</h3>

          <div className="relative space-y-5">
            {/* Display Name */}
            <div>
              <label className="text-white/35 text-xs mb-1.5 block font-medium uppercase tracking-wider">{t('display name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all text-white placeholder:text-white/15 backdrop-blur-sm"
                placeholder={t('public profile placeholder')}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/35 text-xs mb-1.5 block font-medium uppercase tracking-wider">{t('bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none text-white placeholder:text-white/15 backdrop-blur-sm"
                rows={3}
                placeholder={t('clone description placeholder')}
              />
              <p className="text-white/15 text-xs mt-1.5">{bio.length}/200 characters</p>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300">
              <div>
                <p className="font-medium text-white/80">{t('public')}</p>
                <p className="text-white/25 text-sm mt-0.5">Allow others to discover and chat with your clone</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isPublic ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30' : 'bg-white/[0.08]'}`}
              >
                <div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300"
                  style={{ transform: isPublic ? 'translateX(30px)' : 'translateX(0)', left: '2px' }}
                />
              </button>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="group relative w-full py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
              <span className="relative z-10">{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="relative rounded-2xl border border-white/[0.06] p-6 backdrop-blur-2xl bg-white/[0.015]">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-violet-500/[0.02] pointer-events-none" />

          <h3 className="relative text-lg font-semibold mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{t('share link')} 🔗</h3>
          <p className="relative text-white/25 text-sm mb-4">Send this link to let anyone chat with your AI clone</p>

          <div className="relative flex gap-2">
            <div className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/40 text-sm truncate backdrop-blur-sm font-mono">
              {getShareLink()}
            </div>
            <button
              onClick={copyShareLink}
              className={`group relative px-5 py-3 rounded-xl font-medium transition-all duration-300 overflow-hidden ${
                copied
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/10'
                  : 'bg-violet-500/15 text-violet-400 border border-violet-500/25 hover:bg-violet-500/25 hover:shadow-lg hover:shadow-violet-500/10'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {!isPublic && (
            <p className="relative text-amber-400/50 text-xs mt-4 flex items-center gap-1.5">
              <span className="text-amber-400/70">⚠️</span> Your profile is currently private. Toggle public to share.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
