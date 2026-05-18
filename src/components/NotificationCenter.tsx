'use client'
import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/lib/notifications-context'

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications
  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach(n => {
    const d = new Date(n.timestamp)
    const today = new Date()
    const key = d.toDateString() === today.toDateString() ? 'Today' :
      d.toDateString() === new Date(today.getTime() - 86400000).toDateString() ? 'Yesterday' : 'Earlier'
    grouped[key] = grouped[key] || []
    grouped[key].push(n)
  })

  const iconMap: Record<string, string> = { memory: '🧠', chat: '💬', achievement: '🏆', system: '⚙️', social: '👥' }

  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60 hover:text-white">
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-[500px] rounded-2xl border border-white/10 bg-[#0a0a18]/95 backdrop-blur-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">Mark all read</button>
                <button onClick={clearAll} className="text-xs text-white/30 hover:text-white/50">Clear</button>
              </div>
            </div>
            <div className="flex gap-2">
              {(['all', 'unread'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-violet-500/20 text-violet-300' : 'text-white/40 hover:text-white/60'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto max-h-80">
            {Object.entries(grouped).length === 0 ? (
              <div className="p-8 text-center text-white/30 text-sm">No notifications</div>
            ) : Object.entries(grouped).map(([label, items]) => (
              <div key={label}>
                <div className="px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider font-medium">{label}</div>
                {items.map(n => (
                  <button key={n.id} onClick={() => { markAsRead(n.id); setOpen(false) }}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${!n.read ? 'bg-violet-500/5' : ''}`}>
                    <span className="text-lg mt-0.5">{iconMap[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!n.read ? 'text-white font-medium' : 'text-white/60'}`}>{n.title}</p>
                      <p className="text-xs text-white/30 truncate">{n.body}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
