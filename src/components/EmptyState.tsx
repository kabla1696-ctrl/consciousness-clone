'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon = '📭', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>{icon}</div>
      <h3 className="text-xl font-semibold text-white/80 mb-2">{title}</h3>
      {description && <p className="text-white/40 text-sm max-w-xs mb-6">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all">
          {actionLabel}
        </button>
      )}
    </div>
  )
}
