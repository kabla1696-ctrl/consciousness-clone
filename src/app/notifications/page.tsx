'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useNotifications, Notification, NotificationType } from '../../lib/notifications-context'

type FilterType = 'all' | 'unread' | 'read'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
]

const TYPE_ROUTES: Record<NotificationType, string> = {
  memory: '/memories',
  chat: '/chat',
  achievement: '/achievements',
  system: '/settings',
  social: '/clone-social',
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const handleClick = () => {
    if (!notification.read) onRead(notification.id)
  }

  const route = TYPE_ROUTES[notification.type] || '/dashboard'

  return (
    <Link href={route} onClick={handleClick}>
      <div
        className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer ${
          notification.read
            ? 'glass-card opacity-60 hover:opacity-80'
            : 'gradient-border-card bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 hover-lift'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
            notification.read ? 'bg-white/5' : 'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 shadow-lg shadow-violet-500/10'
          }`}
        >
          {notification.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-sm ${notification.read ? 'text-white/50' : 'text-white'}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className={`text-xs mt-1 line-clamp-2 ${notification.read ? 'text-white/25' : 'text-white/50'}`}>
            {notification.body}
          </p>
          <span className={`text-[10px] mt-2 inline-block ${notification.read ? 'text-white/15' : 'text-white/30'}`}>
            {timeAgo(notification.timestamp)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ filter }: { filter: FilterType }) {
  const messages: Record<FilterType, { icon: string; title: string; desc: string }> = {
    all: { icon: '🔔', title: 'No notifications yet', desc: 'When something happens, you\'ll see it here.' },
    unread: { icon: '✅', title: 'All caught up!', desc: 'No unread notifications. You\'re on top of things.' },
    read: { icon: '📭', title: 'No read notifications', desc: 'Notifications you\'ve seen will appear here.' },
  }
  const msg = messages[filter]

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{msg.icon}</div>
      <h3 className="text-white/40 font-semibold text-lg mb-2">{msg.title}</h3>
      <p className="text-white/20 text-sm max-w-xs">{msg.desc}</p>
    </div>
  )
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications()
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.read)
      case 'read': return notifications.filter(n => n.read)
      default: return notifications
    }
  }, [notifications, filter])

  return (
    <main className="min-h-screen animated-gradient-bg noise-overlay page-transition pb-24">
      <div className="ambient-orb ambient-orb-violet" style={{ width: 250, height: 250, top: '5%', left: '-10%' }} />
      <div className="ambient-orb ambient-orb-fuchsia" style={{ width: 200, height: 200, bottom: '15%', right: '-8%' }} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050510]/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold gradient-text">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-violet-500/10"
              >
                Mark all read
              </button>
            )}
            <Link
              href="/notification-settings"
              className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-5 relative z-10">
        {/* Filters */}
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                filter === f.key
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'glass-card text-white/40 hover:text-white/60'
              }`}
            >
              {f.label}
              {f.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-[10px]">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filtered.length > 0 ? (
          <div className="space-y-3 stagger-children">
            {filtered.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))}
          </div>
        ) : (
          <EmptyState filter={filter} />
        )}

        {/* Clear All (only when there are notifications) */}
        {notifications.length > 0 && (
          <div className="pt-4 text-center">
            <button
              onClick={clearAll}
              className="text-xs text-white/20 hover:text-red-400/60 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/5"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
