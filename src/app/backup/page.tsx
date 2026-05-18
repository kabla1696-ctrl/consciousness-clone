'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase-browser'
import { useT } from '../../lib/language-context'
import { useToast } from '../../components/Toast'
import ExportButton from '../../components/ExportButton'
import type { User } from '@supabase/supabase-js'
import {
  exportData,
  downloadBackup,
  validateBackup,
  getBackupSummary,
  importData,
  type BackupData,
  type ImportMode,
} from '../../lib/backup'

/* ------------------------------------------------------------------ */
/*  Data summary card                                                  */
/* ------------------------------------------------------------------ */

function SummaryItem({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-violet-500/20 transition-all duration-300">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40 truncate">{label}</p>
        <p className="text-sm font-bold text-white/90">{count.toLocaleString()}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Import preview                                                     */
/* ------------------------------------------------------------------ */

function ImportPreview({
  data,
  mode,
  onModeChange,
  onImport,
  onCancel,
  importing,
}: {
  data: BackupData
  mode: ImportMode
  onModeChange: (m: ImportMode) => void
  onImport: () => void
  onCancel: () => void
  importing: boolean
}) {
  const summary = getBackupSummary(data)
  const totalItems = Object.values(summary).reduce<number>((a, b) => typeof b === 'number' ? a + (b as number) : a, 0)

  return (
    <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 shadow-xl shadow-black/10 animate-[fadeSlideUp_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
          📋
        </div>
        <div>
          <h3 className="text-sm font-bold text-white/90">Backup Preview</h3>
          <p className="text-[10px] text-white/30">
            {totalItems} items • Exported {new Date(data.exportedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {summary.memories > 0 && <SummaryItem icon="🧠" label="Memories" count={summary.memories} />}
        {summary.chatMessages > 0 && <SummaryItem icon="💬" label="Chats" count={summary.chatMessages} />}
        {summary.moodEntries > 0 && <SummaryItem icon="😊" label="Moods" count={summary.moodEntries} />}
        {summary.voiceJournals > 0 && <SummaryItem icon="🎙️" label="Voice" count={summary.voiceJournals} />}
        {summary.familyMembers > 0 && <SummaryItem icon="👨‍👩‍👧" label="Family" count={summary.familyMembers} />}
        {summary.legacyLetters > 0 && <SummaryItem icon="✉️" label="Letters" count={summary.legacyLetters} />}
        {summary.timeCapsules > 0 && <SummaryItem icon="⏳" label="Capsules" count={summary.timeCapsules} />}
        {summary.skills > 0 && <SummaryItem icon="🎯" label="Skills" count={summary.skills} />}
        {summary.cloneQuizResults > 0 && <SummaryItem icon="🧩" label="Quizzes" count={summary.cloneQuizResults} />}
      </div>

      {/* Import mode toggle */}
      <div className="mb-5">
        <p className="text-xs text-white/40 mb-2.5 font-medium">Import mode</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModeChange('merge')}
            className={`p-3 rounded-xl border text-center transition-all duration-300 tap-feedback ${
              mode === 'merge'
                ? 'border-violet-500/40 bg-violet-500/10 shadow-lg shadow-violet-500/5'
                : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <p className="text-lg mb-1">🔀</p>
            <p className="text-xs font-semibold">Merge</p>
            <p className="text-[10px] text-white/30 mt-0.5">Add to existing</p>
          </button>
          <button
            onClick={() => onModeChange('replace')}
            className={`p-3 rounded-xl border text-center transition-all duration-300 tap-feedback ${
              mode === 'replace'
                ? 'border-red-500/40 bg-red-500/10 shadow-lg shadow-red-500/5'
                : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <p className="text-lg mb-1">🔄</p>
            <p className="text-xs font-semibold">Replace</p>
            <p className="text-[10px] text-white/30 mt-0.5">Overwrite all</p>
          </button>
        </div>
        {mode === 'replace' && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-[10px] text-red-300/80 flex items-center gap-1.5">
              <span>⚠️</span> This will delete all existing data before importing
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          onClick={onCancel}
          disabled={importing}
          className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm font-medium text-white/60 hover:bg-white/[0.08] transition-all tap-feedback disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onImport}
          disabled={importing}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all tap-feedback disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {importing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Importing...
            </>
          ) : (
            <>📥 Import</>
          )}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Import results                                                     */
/* ------------------------------------------------------------------ */

function ImportResults({ result }: { result: { success: boolean; counts: Record<string, number>; errors: string[] } }) {
  const totalImported = Object.values(result.counts).reduce((a, b) => a + b, 0)
  const labels: Record<string, string> = {
    memories: 'Memories',
    chatMessages: 'Chat Messages',
    moodEntries: 'Mood Entries',
    voiceJournals: 'Voice Journals',
    familyMembers: 'Family Members',
    legacyLetters: 'Legacy Letters',
    timeCapsules: 'Time Capsules',
    skills: 'Skills',
  }

  return (
    <div className={`rounded-2xl border p-5 animate-[fadeSlideUp_0.3s_ease-out] ${
      result.success
        ? 'bg-emerald-500/5 border-emerald-500/20'
        : 'bg-amber-500/5 border-amber-500/20'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{result.success ? '✅' : '⚠️'}</span>
        <div>
          <h3 className="text-sm font-bold text-white/90">
            {result.success ? 'Import Complete' : 'Import Completed with Errors'}
          </h3>
          <p className="text-[10px] text-white/40">{totalImported} items imported</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {Object.entries(result.counts).filter(([, v]) => v > 0).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
            <span className="text-xs text-emerald-400">+{count}</span>
            <span className="text-[10px] text-white/40">{labels[key] || key}</span>
          </div>
        ))}
      </div>

      {result.errors.length > 0 && (
        <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] text-red-300/80 font-medium mb-1">Errors:</p>
          {result.errors.map((err, i) => (
            <p key={i} className="text-[10px] text-red-300/60">• {err}</p>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function BackupPage() {
  const t = useT()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Export state
  const [dataSummary, setDataSummary] = useState<{
    memories: number; chatMessages: number; moodEntries: number
  } | null>(null)

  // Import state
  const [dragOver, setDragOver] = useState(false)
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean; counts: Record<string, number>; errors: string[]
  } | null>(null)

  // Last backup
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      // Load counts for summary
      const [mem, chat, mood] = await Promise.all([
        supabase.from('memories').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('mood_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setDataSummary({
        memories: mem.count || 0,
        chatMessages: chat.count || 0,
        moodEntries: mood.count || 0,
      })

      if (typeof window !== 'undefined') {
        setLastBackup(localStorage.getItem('last_backup_at'))
      }
      setLoading(false)
    }
    init()
  }, [])

  const processFile = useCallback(async (file: File) => {
    setParsedBackup(null)
    setImportResult(null)

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a .json backup file')
      return
    }

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const validation = validateBackup(json)

      if (!validation.valid) {
        toast.error(validation.error || 'Invalid backup file')
        return
      }

      setParsedBackup(json as BackupData)
    } catch {
      toast.error('Failed to parse backup file')
    }
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleImport = async () => {
    if (!parsedBackup || !user) return
    setImporting(true)

    try {
      const result = await importData(user.id, parsedBackup, importMode)
      setImportResult(result)

      if (result.success) {
        toast.success('Data imported successfully! 🎉')
        // Refresh counts
        const [mem, chat, mood] = await Promise.all([
          supabase.from('memories').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('mood_entries').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ])
        setDataSummary({
          memories: mem.count || 0,
          chatMessages: chat.count || 0,
          moodEntries: mood.count || 0,
        })
      } else {
        toast.warning('Import completed with some errors')
      }
    } catch (err) {
      console.error('Import error:', err)
      toast.error('Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }

  const resetImport = () => {
    setParsedBackup(null)
    setImportResult(null)
    setImportMode('merge')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="tap-feedback p-1 rounded-xl hover:bg-white/[0.04] transition-colors">
            <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-base shadow-lg shadow-violet-500/20">💾</div>
          <div className="flex-1">
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">{t('Backup & Restore')}</h1>
            <p className="text-[10px] text-white/30">{t('Export or import your consciousness data')}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 max-w-lg mx-auto relative z-10">

        {/* ─── Last backup reminder ─── */}
        {lastBackup && (
          <div className="mb-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-violet-500/5 border border-violet-500/15">
            <span className="text-sm">🕐</span>
            <p className="text-[11px] text-white/40">
              Last backup: <span className="text-violet-300/70 font-medium">
                {new Date(lastBackup).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </p>
          </div>
        )}

        {!lastBackup && (
          <div className="mb-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <span className="text-sm">💡</span>
            <p className="text-[11px] text-amber-300/60">
              No backups yet. Export your data to keep it safe!
            </p>
          </div>
        )}

        {/* ─── Export Section ─── */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 mb-6 shadow-xl shadow-black/10 hover:border-violet-500/15 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20">
              📤
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90">Export Your Consciousness</h3>
              <p className="text-[10px] text-white/30">Download everything as a JSON file</p>
            </div>
          </div>

          {/* Data summary */}
          {dataSummary && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              <SummaryItem icon="🧠" label="Memories" count={dataSummary.memories} />
              <SummaryItem icon="💬" label="Chats" count={dataSummary.chatMessages} />
              <SummaryItem icon="😊" label="Moods" count={dataSummary.moodEntries} />
            </div>
          )}

          {/* Export includes note */}
          <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
            <p className="text-[10px] text-white/30 font-medium mb-1.5">Export includes:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Memories', 'Chat History', 'Moods', 'Voice Journals', 'Family', 'Letters', 'Capsules', 'Settings', 'Favorites'].map(item => (
                <span key={item} className="px-2 py-0.5 rounded-md bg-violet-500/10 text-[9px] text-violet-300/60 border border-violet-500/10">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <ExportButton className="w-full" />
        </div>

        {/* ─── Import Section ─── */}
        <div className="rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] p-5 shadow-xl shadow-black/10 hover:border-violet-500/15 transition-all duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/20">
              📥
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90">Restore from Backup</h3>
              <p className="text-[10px] text-white/30">Import a previously exported .json file</p>
            </div>
          </div>

          {/* Import results (shown after import) */}
          {importResult && (
            <div className="mb-4">
              <ImportResults result={importResult} />
              <button
                onClick={resetImport}
                className="mt-3 w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 hover:bg-white/[0.08] transition-all tap-feedback"
              >
                Import Another File
              </button>
            </div>
          )}

          {/* Preview (shown after file selection, before import) */}
          {!importResult && parsedBackup && (
            <div className="mb-4">
              <ImportPreview
                data={parsedBackup}
                mode={importMode}
                onModeChange={setImportMode}
                onImport={handleImport}
                onCancel={resetImport}
                importing={importing}
              />
            </div>
          )}

          {/* Drop zone (shown when no file selected) */}
          {!parsedBackup && !importResult && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center
                transition-all duration-300 tap-feedback
                ${dragOver
                  ? 'border-violet-500/50 bg-violet-500/10 scale-[1.02]'
                  : 'border-white/[0.06] bg-white/[0.01] hover:border-violet-500/20 hover:bg-white/[0.03]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mb-3">
                <span className="text-3xl">{dragOver ? '📥' : '📁'}</span>
              </div>
              <p className="text-sm font-medium text-white/60 mb-1">
                {dragOver ? 'Drop your backup here' : 'Drag & drop your backup file'}
              </p>
              <p className="text-[10px] text-white/30">or tap to browse • .json files only</p>
            </div>
          )}
        </div>

        {/* ─── Auto-backup reminder ─── */}
        <div className="mt-6 p-4 rounded-2xl bg-white/[0.015] border border-white/[0.03]">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">🔔</span>
            <div>
              <p className="text-xs font-semibold text-white/50 mb-1">Backup Reminder</p>
              <p className="text-[10px] text-white/30 leading-relaxed">
                We recommend exporting your data weekly. Your consciousness is precious — keep a copy safe!
                Backups include all your memories, chats, moods, and settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global animations */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
