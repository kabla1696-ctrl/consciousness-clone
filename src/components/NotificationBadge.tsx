'use client'

interface NotificationBadgeProps {
  count: number
  className?: string
}

export default function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? '99+' : String(count)

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse ${className}`}
    >
      {display}
    </span>
  )
}
