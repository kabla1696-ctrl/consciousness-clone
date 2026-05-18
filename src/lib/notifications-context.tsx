'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type NotificationType = 'memory' | 'chat' | 'achievement' | 'system' | 'social'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  timestamp: number
  icon: string
}

interface NotificationsContextValue {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'> & { id?: string; read?: boolean; timestamp?: number }) => void
  markAsRead: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const STORAGE_KEY = 'cc-notifications'

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 's1', type: 'memory', title: 'New memory saved', body: 'Your conversation about childhood dreams was saved to the vault.', read: false, timestamp: Date.now() - 1000 * 60 * 5, icon: '🧠' },
  { id: 's2', type: 'achievement', title: 'Achievement unlocked!', body: 'You earned "Deep Thinker" — 100 memories created.', read: false, timestamp: Date.now() - 1000 * 60 * 60 * 2, icon: '🏆' },
  { id: 's3', type: 'chat', title: 'Clone conversation', body: 'Your clone had a 15-minute chat with a visitor.', read: false, timestamp: Date.now() - 1000 * 60 * 60 * 5, icon: '💬' },
  { id: 's4', type: 'social', title: 'New follower', body: 'Someone started following your consciousness clone.', read: true, timestamp: Date.now() - 1000 * 60 * 60 * 24, icon: '👥' },
  { id: 's5', type: 'system', title: 'System update', body: 'Consciousness Clone v2.0 is now available with new features.', read: true, timestamp: Date.now() - 1000 * 60 * 60 * 48, icon: '⚙️' },
  { id: 's6', type: 'memory', title: 'Memory milestone', body: "You've created 50 memories this month!", read: true, timestamp: Date.now() - 1000 * 60 * 60 * 72, icon: '🧠' },
]

function generateId() {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setNotifications(JSON.parse(stored))
      } else {
        setNotifications(SAMPLE_NOTIFICATIONS)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOTIFICATIONS))
      }
    } catch {
      setNotifications(SAMPLE_NOTIFICATIONS)
    }
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)) } catch {}
    }
  }, [notifications])

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'timestamp'> & { id?: string; read?: boolean; timestamp?: number }) => {
    setNotifications(prev => [{ ...n, id: n.id ?? generateId(), read: n.read ?? false, timestamp: n.timestamp ?? Date.now() }, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
