import { supabase } from './supabase-browser'

export interface DashboardStats {
  memoryCount: number
  moodCount: number
  chatCount: number
  achievementCount: number
  streakDays: number
  totalWords: number
}

export interface RecentActivityItem {
  id: string
  type: string
  label: string
  path: string
  icon: string
  timestamp: number
}

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Count memories from Supabase, falling back to localStorage */
export async function getMemoryCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { count } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) return count
    }
  } catch { /* fall through */ }

  // Fallback: localStorage
  const local = safeParse<unknown[]>('cc_memories', [])
  if (Array.isArray(local) && local.length > 0) return local.length

  const stored = parseInt(localStorage.getItem('cc_memory_count') || '0', 10)
  return isNaN(stored) ? 0 : stored
}

/** Count mood tracker entries from Supabase, falling back to localStorage */
export async function getMoodEntries(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { count } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (count !== null) return count
    }
  } catch { /* fall through */ }

  const stored = parseInt(localStorage.getItem('cc_mood_count') || '0', 10)
  return isNaN(stored) ? 0 : stored
}

/** Count chat messages from localStorage */
export function getChatCount(): number {
  const local = safeParse<unknown[]>('cc_chat_messages', [])
  if (Array.isArray(local) && local.length > 0) return local.length

  const stored = parseInt(localStorage.getItem('cc_chat_count') || '0', 10)
  return isNaN(stored) ? 0 : stored
}

/** Count unlocked achievements from localStorage */
export function getAchievementCount(): number {
  const achievements = safeParse<Array<{ unlocked?: boolean }>>('clone-achievements', [])
  if (Array.isArray(achievements) && achievements.length > 0) {
    return achievements.filter(a => a.unlocked).length
  }
  return 0
}

/** Calculate login streak from localStorage */
export function getStreakDays(): number {
  const stored = parseInt(localStorage.getItem('cc_streak') || '0', 10)
  if (!isNaN(stored) && stored > 0) return stored

  // Calculate from last_active dates if streak not tracked
  const lastActive = localStorage.getItem('cc_last_active')
  if (!lastActive) return 0

  try {
    const last = new Date(lastActive)
    const now = new Date()
    const diffMs = now.getTime() - last.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return diffDays <= 1 ? 1 : 0
  } catch {
    return 0
  }
}

/** Count total words across all memories */
export async function getTotalWords(): Promise<number> {
  let textContent = ''

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('memories')
        .select('content')
        .eq('user_id', user.id)
      if (data && data.length > 0) {
        textContent = data.map(m => m.content || '').join(' ')
      }
    }
  } catch { /* fall through */ }

  // Fallback: localStorage
  if (!textContent) {
    textContent = localStorage.getItem('cc_memories_text') || ''
    if (!textContent) {
      const memories = safeParse<Array<{ content?: string }>>('cc_memories', [])
      if (Array.isArray(memories)) {
        textContent = memories.map(m => m.content || '').join(' ')
      }
    }
  }

  if (!textContent.trim()) return 0
  return textContent.trim().split(/\s+/).filter(Boolean).length
}

/** Get last 5 recent activities from localStorage */
export function getRecentActivity(): RecentActivityItem[] {
  const activities = safeParse<RecentActivityItem[]>('cc_recent_activity', [])
  if (!Array.isArray(activities)) return []
  return activities.slice(0, 5)
}

/** Fetch all dashboard stats at once */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [memoryCount, moodCount, totalWords] = await Promise.all([
    getMemoryCount(),
    getMoodEntries(),
    getTotalWords(),
  ])

  return {
    memoryCount,
    moodCount,
    chatCount: getChatCount(),
    achievementCount: getAchievementCount(),
    streakDays: getStreakDays(),
    totalWords,
  }
}
