import { supabase } from './supabase-browser'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BackupData {
  version: 1
  exportedAt: string
  userId: string
  profile: Record<string, unknown> | null
  memories: Record<string, unknown>[]
  chatMessages: Record<string, unknown>[]
  moodEntries: Record<string, unknown>[]
  voiceJournals: Record<string, unknown>[]
  familyMembers: Record<string, unknown>[]
  legacyLetters: Record<string, unknown>[]
  timeCapsules: Record<string, unknown>[]
  skills: Record<string, unknown>[]
  cloneQuizResults: Record<string, unknown>[]
  settings: Record<string, unknown>
  favorites: string[]
  activityFeed: Record<string, unknown>[]
}

export interface ImportResult {
  success: boolean
  counts: {
    memories: number
    chatMessages: number
    moodEntries: number
    voiceJournals: number
    familyMembers: number
    legacyLetters: number
    timeCapsules: number
    skills: number
  }
  errors: string[]
}

export type ImportMode = 'merge' | 'replace'

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export async function exportData(userId: string): Promise<BackupData> {
  const [
    memoriesRes,
    chatRes,
    moodRes,
    voiceRes,
    familyRes,
    legacyRes,
    capsuleRes,
    skillsRes,
    quizRes,
  ] = await Promise.all([
    supabase.from('memories').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('mood_entries').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('voice_journals').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('family_members').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('legacy_letters').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('time_capsules').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('skills').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    supabase.from('clone_quiz_results').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
  ])

  // Gather localStorage data (client-side only)
  let settings: Record<string, unknown> = {}
  let favorites: string[] = []
  let activityFeed: Record<string, unknown>[] = []

  if (typeof window !== 'undefined') {
    try { settings = JSON.parse(localStorage.getItem('clone_settings') || '{}') } catch { /* ignore */ }
    try { favorites = JSON.parse(localStorage.getItem('favorites') || '[]') } catch { /* ignore */ }
    try { activityFeed = JSON.parse(localStorage.getItem('activity_feed') || '[]') } catch { /* ignore */ }
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    userId,
    profile: null, // profile is derived from auth, not stored separately
    memories: memoriesRes.data || [],
    chatMessages: chatRes.data || [],
    moodEntries: moodRes.data || [],
    voiceJournals: voiceRes.data || [],
    familyMembers: familyRes.data || [],
    legacyLetters: legacyRes.data || [],
    timeCapsules: capsuleRes.data || [],
    skills: skillsRes.data || [],
    cloneQuizResults: quizRes.data || [],
    settings,
    favorites,
    activityFeed,
  }
}

/* ------------------------------------------------------------------ */
/*  Download helper                                                    */
/* ------------------------------------------------------------------ */

export function downloadBackup(data: BackupData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `consciousness-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Record last backup timestamp
  if (typeof window !== 'undefined') {
    localStorage.setItem('last_backup_at', new Date().toISOString())
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

export function validateBackup(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid file format' }
  }
  const d = data as Record<string, unknown>
  if (d.version !== 1) {
    return { valid: false, error: `Unsupported backup version: ${String(d.version)}` }
  }
  if (!d.userId || typeof d.userId !== 'string') {
    return { valid: false, error: 'Missing userId in backup' }
  }
  if (!Array.isArray(d.memories)) {
    return { valid: false, error: 'Missing or invalid memories data' }
  }
  return { valid: true }
}

/* ------------------------------------------------------------------ */
/*  Data summary                                                       */
/* ------------------------------------------------------------------ */

export function getBackupSummary(data: BackupData) {
  return {
    memories: data.memories.length,
    chatMessages: data.chatMessages.length,
    moodEntries: data.moodEntries.length,
    voiceJournals: data.voiceJournals.length,
    familyMembers: data.familyMembers.length,
    legacyLetters: data.legacyLetters.length,
    timeCapsules: data.timeCapsules.length,
    skills: data.skills.length,
    cloneQuizResults: data.cloneQuizResults.length,
    exportedAt: data.exportedAt,
  }
}

/* ------------------------------------------------------------------ */
/*  Import                                                             */
/* ------------------------------------------------------------------ */

function stripMeta<T extends Record<string, unknown>>(items: T[]): Omit<T, 'id' | 'created_at'>[] {
  return items.map(({ id, created_at, ...rest }) => rest as Omit<T, 'id' | 'created_at'>)
}

export async function importData(
  userId: string,
  data: BackupData,
  mode: ImportMode,
): Promise<ImportResult> {
  const errors: string[] = []
  const counts = {
    memories: 0,
    chatMessages: 0,
    moodEntries: 0,
    voiceJournals: 0,
    familyMembers: 0,
    legacyLetters: 0,
    timeCapsules: 0,
    skills: 0,
  }

  // In replace mode, delete existing data first
  if (mode === 'replace') {
    const tables = ['memories', 'chat_messages', 'mood_entries', 'voice_journals', 'family_members', 'legacy_letters', 'time_capsules', 'skills', 'clone_quiz_results'] as const
    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)
      if (error) errors.push(`Delete ${table}: ${error.message}`)
    }
  }

  // Reassign user_id to current user and insert
  const insertTable = async (
    table: string,
    items: Record<string, unknown>[],
    countKey: keyof typeof counts,
  ) => {
    if (!items.length) return
    const cleaned = stripMeta(items).map(item => ({ ...item, user_id: userId }))
    // Batch in chunks of 500
    for (let i = 0; i < cleaned.length; i += 500) {
      const chunk = cleaned.slice(i, i + 500)
      const { error } = await supabase.from(table).insert(chunk)
      if (error) {
        errors.push(`Insert ${table}: ${error.message}`)
      } else {
        counts[countKey] += chunk.length
      }
    }
  }

  await Promise.all([
    insertTable('memories', data.memories, 'memories'),
    insertTable('chat_messages', data.chatMessages, 'chatMessages'),
    insertTable('mood_entries', data.moodEntries, 'moodEntries'),
    insertTable('voice_journals', data.voiceJournals, 'voiceJournals'),
    insertTable('family_members', data.familyMembers, 'familyMembers'),
    insertTable('legacy_letters', data.legacyLetters, 'legacyLetters'),
    insertTable('time_capsules', data.timeCapsules, 'timeCapsules'),
    insertTable('skills', data.skills, 'skills'),
  ])

  // Restore localStorage data
  if (typeof window !== 'undefined') {
    if (data.settings && Object.keys(data.settings).length > 0) {
      if (mode === 'replace') {
        localStorage.setItem('clone_settings', JSON.stringify(data.settings))
      } else {
        try {
          const existing = JSON.parse(localStorage.getItem('clone_settings') || '{}')
          localStorage.setItem('clone_settings', JSON.stringify({ ...existing, ...data.settings }))
        } catch {
          localStorage.setItem('clone_settings', JSON.stringify(data.settings))
        }
      }
    }
    if (data.favorites?.length > 0) {
      if (mode === 'replace') {
        localStorage.setItem('favorites', JSON.stringify(data.favorites))
      } else {
        try {
          const existing: string[] = JSON.parse(localStorage.getItem('favorites') || '[]')
          const merged = [...new Set([...existing, ...data.favorites])]
          localStorage.setItem('favorites', JSON.stringify(merged))
        } catch {
          localStorage.setItem('favorites', JSON.stringify(data.favorites))
        }
      }
    }
    if (data.activityFeed?.length > 0) {
      if (mode === 'replace') {
        localStorage.setItem('activity_feed', JSON.stringify(data.activityFeed))
      } else {
        try {
          const existing: Record<string, unknown>[] = JSON.parse(localStorage.getItem('activity_feed') || '[]')
          localStorage.setItem('activity_feed', JSON.stringify([...existing, ...data.activityFeed]))
        } catch {
          localStorage.setItem('activity_feed', JSON.stringify(data.activityFeed))
        }
      }
    }
  }

  return { success: errors.length === 0, counts, errors }
}
