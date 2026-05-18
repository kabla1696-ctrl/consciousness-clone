'use client'
import React, { useEffect, useState } from 'react'

interface Activity {
  id: string
  type: 'memory' | 'chat' | 'achievement' | 'mood' | 'feature'
  title: string
  time: number
  icon: string
}

const STORAGE_KEY = 'cc_activity_feed'

function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function addActivity(type: Activity['type'], title: string, icon: string) {
  const activities = loadActivities()
  activities.unshift({ id: crypto.randomUUID(), type, title, time: Date.now(), icon })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, 50)))
}

const ActivityFeed = React.memo(function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => { setActivities(loadActivities()) }, [])

  if (activities.length === 0) return (
    <div className="text-center py-8 text-white/30 text-sm">
      <span className="text-3xl block mb-2">📊</span>
      Activity will appear here as you use the app
    </div>
  )

  const iconColors: Record<string, string> = {
    memory: 'bg-violet-500/20 text-violet-400', chat: 'bg-blue-500/20 text-blue-400',
    achievement: 'bg-amber-500/20 text-amber-400', mood: 'bg-pink-500/20 text-pink-400',
    feature: 'bg-emerald-500/20 text-emerald-400'
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />
      <div className="space-y-4">
        {activities.slice(0, 10).map((a, i) => (
          <div key={a.id} className="flex items-start gap-3 relative" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColors[a.type] || 'bg-white/10'}`}>
              <span className="text-sm">{a.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{a.title}</p>
              <p className="text-xs text-white/30">{new Date(a.time).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

export default ActivityFeed
