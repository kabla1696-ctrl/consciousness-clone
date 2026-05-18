'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'page_visit' | 'feature_used' | 'memory_added' | 'chat_sent'
  label: string
  path: string
  icon: string
  timestamp: number
}

const ACTIVITY_ICONS: Record<string, string> = {
  page_visit: '👁️',
  feature_used: '⚡',
  memory_added: '📝',
  chat_sent: '💬',
}

const STORAGE_KEY = 'cc_recent_activity'
const MAX_ACTIVITIES = 20
const DISPLAY_COUNT = 5

function getTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function logActivity(activity: Omit<Activity, 'id' | 'timestamp'>) {
  try {
    const existing: Activity[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const newActivity: Activity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    }
    // Deduplicate: skip if last activity has same path and type within 30s
    if (existing.length > 0 && existing[0].path === activity.path && existing[0].type === activity.type && Date.now() - existing[0].timestamp < 30000) {
      return
    }
    const updated = [newActivity, ...existing].slice(0, MAX_ACTIVITIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch { /* ignore */ }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored: Activity[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setActivities(stored.slice(0, DISPLAY_COUNT))
    } catch { /* ignore */ }
  }, [])

  if (!mounted || activities.length === 0) return null

  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-white/25 mb-3 px-1">🕐 Recent Activity</h2>
      <div className="space-y-2">
        {activities.map((a, i) => (
          <Link
            key={a.id}
            href={a.path}
            className="block rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-white/[0.06] flex items-center justify-center text-sm shrink-0">
                {ACTIVITY_ICONS[a.type] || '🔹'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors truncate">{a.label}</p>
                <p className="text-[10px] text-white/20 mt-0.5">{a.path}</p>
              </div>
              <span className="text-[10px] text-white/15 shrink-0 font-mono">{getTimeAgo(a.timestamp)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
