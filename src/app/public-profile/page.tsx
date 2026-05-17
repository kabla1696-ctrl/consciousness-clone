'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase-browser'

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
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)
      loadProfile(user.id)
    }
    init()
  }, [])

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      setProfile(data)
      setDisplayName(data.display_name || '')
      setBio(data.bio || '')
      setIsPublic(data.is_public || false)
    }
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)

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

      if (data) setProfile(data)
    } else {
      const { data } = await supabase
        .from('public_profiles')
        .insert({ ...profileData, total_chats: 0, rating: 0 })
        .select()
        .single()

      if (data) setProfile(data)
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
        <div className="text-white/40">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/95 backdrop-blur-xl border-b border-white/[0.04] safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1">
            <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold">Public Profile</h1>
        </div>
      </header>

      <div className="pt-4 px-4 max-w-2xl mx-auto pb-24">
        {/* Profile Preview Card */}
        <div className="rounded-2xl border border-white/[0.06] p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl">
              {displayName ? displayName[0].toUpperCase() : '🧠'}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{displayName || 'Your Clone'}</h2>
              <p className="text-white/40 text-sm mt-1">{bio || 'No bio yet'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-xl font-bold text-violet-400">{profile?.total_chats || 0}</div>
              <div className="text-white/30 text-xs">Chats</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-xl font-bold text-amber-400">{profile?.rating?.toFixed(1) || '0.0'} ⭐</div>
              <div className="text-white/30 text-xs">Rating</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className={`text-xl font-bold ${isPublic ? 'text-emerald-400' : 'text-white/30'}`}>
                {isPublic ? '🌍' : '🔒'}
              </div>
              <div className="text-white/30 text-xs">{isPublic ? 'Public' : 'Private'}</div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="rounded-2xl border border-white/[0.06] p-6 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>

          <div className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="text-white/40 text-sm mb-1.5 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition text-white placeholder:text-white/20"
                placeholder="How others will see your clone"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/40 text-sm mb-1.5 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500/50 transition resize-none text-white placeholder:text-white/20"
                rows={3}
                placeholder="A short description about your clone..."
              />
              <p className="text-white/20 text-xs mt-1">{bio.length}/200 characters</p>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div>
                <p className="font-medium">Make Profile Public</p>
                <p className="text-white/30 text-sm mt-0.5">Allow others to discover and chat with your clone</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative w-14 h-7 rounded-full transition-colors ${isPublic ? 'bg-violet-500' : 'bg-white/[0.08]'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${isPublic ? 'translate-x-7.5 left-0.5' : 'left-0.5'}`}
                  style={{ transform: isPublic ? 'translateX(30px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="rounded-2xl border border-white/[0.06] p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 className="text-lg font-semibold mb-2">Share Your Clone 🔗</h3>
          <p className="text-white/30 text-sm mb-4">Send this link to let anyone chat with your AI clone</p>

          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/50 text-sm truncate">
              {getShareLink()}
            </div>
            <button
              onClick={copyShareLink}
              className={`px-5 py-3 rounded-xl font-medium transition ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-violet-500/20 text-violet-400 border border-violet-500/30 hover:bg-violet-500/30'}`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {!isPublic && (
            <p className="text-amber-400/60 text-xs mt-3 flex items-center gap-1">
              <span>⚠️</span> Your profile is currently private. Toggle public to share.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
