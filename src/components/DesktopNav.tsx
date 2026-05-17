'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/clone-feed', icon: '📰', label: 'Social Feed' },
  { href: '/voice-call', icon: '📞', label: 'Voice Call' },
  { href: '/clone-connect', icon: '💬', label: 'Messages' },
  { href: '/memories', icon: '🧠', label: 'Memories' },
  { href: '/personality', icon: '🧬', label: 'Personality' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
  { href: '/vault', icon: '🔐', label: 'Vault' },
  { href: '/public-profile', icon: '🌐', label: 'Profile' },
  { href: '/language', icon: '🌍', label: 'Language' },
]

export default function DesktopNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[100] flex-col bg-[#0a0a1a]/90 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20 flex-shrink-0">🧠</div>
        {!collapsed && <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Consciousness Clone</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-white/20 hover:text-white/50 text-xs tap-feedback">☰</button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all tap-feedback group ${active ? 'bg-violet-500/15 text-violet-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
              <span className={`text-lg flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      {!collapsed && (
        <div className="p-4 border-t border-white/[0.06]">
          <div className="text-[10px] text-white/15">Consciousness Clone v2.0</div>
        </div>
      )}
    </aside>
  )
}
