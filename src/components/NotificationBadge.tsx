'use client'
import React from 'react'

interface NotificationBadgeProps {
  count: number
  className?: string
}

const NotificationBadge = React.memo(function NotificationBadge({ count, className = '' }: NotificationBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? '99+' : String(count)

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse ${className}`}
    >
      {display}
    </span>
  )
})

export default NotificationBadge
