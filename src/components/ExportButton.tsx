'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase-browser'
import { exportData, downloadBackup } from '../lib/backup'
import { useToast } from './Toast'

interface ExportButtonProps {
  variant?: 'primary' | 'ghost'
  className?: string
  onExportStart?: () => void
  onExportEnd?: () => void
}

export default function ExportButton({
  variant = 'primary',
  className = '',
  onExportStart,
  onExportEnd,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const toast = useToast()

  const handleExport = async () => {
    setExporting(true)
    onExportStart?.()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to export your data')
        return
      }

      const backup = await exportData(user.id)
      downloadBackup(backup)
      toast.success('Backup downloaded successfully! 🎉')
    } catch (err) {
      console.error('Export error:', err)
      toast.error('Failed to export data. Please try again.')
    } finally {
      setExporting(false)
      onExportEnd?.()
    }
  }

  const baseClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
    : 'bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-violet-500/30 text-white/80'

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      aria-label={exporting ? 'Exporting data' : 'Export data'}
      className={`
        relative flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl
        font-semibold text-sm transition-all duration-300 tap-feedback
        disabled:opacity-50 disabled:cursor-not-allowed
        ${baseClasses} ${className}
      `}
    >
      {exporting ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Exporting...</span>
          {/* Progress shimmer */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
        </>
      ) : (
        <>
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export Data</span>
        </>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  )
}
