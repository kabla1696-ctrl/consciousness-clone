'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false })
const NotificationCenter = dynamic(() => import('./NotificationCenter'), { ssr: false })

const TABS = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/clone-feed', icon: '📰', label: 'Feed' },
  { href: '/clone-connect', icon: '💬', label: 'Chat' },
  { href: '/vault', icon: '🧠', label: 'Memory' },
]

// Pages that have their own bottom input bars
const HIDE_NAV_PAGES = ['/chat', '/clone-connect', '/chat-user', '/voice-call', '/voice-user', '/video-user', '/call-user']

export default function MobileNav() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  
  // Hide bottom nav on pages with their own input
  if (HIDE_NAV_PAGES.some(p => pathname.startsWith(p))) return null
  
  return (
    <>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    <nav role="navigation" aria-label="Mobile navigation" className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 py-1">
        {/* Notification button */}
        <div className="flex flex-col items-center gap-0.5 py-2 px-3 tap-feedback relative min-w-[44px] min-h-[44px] justify-center">
          <NotificationCenter />
          <span className="text-[9px] font-medium text-white/30">Alerts</span>
        </div>
        {/* Search button */}
        <button onClick={() => setSearchOpen(true)} aria-label="Search" className="flex flex-col items-center gap-0.5 py-2 px-3 tap-feedback relative min-w-[44px] min-h-[44px] justify-center">
          <span className="text-lg opacity-50">🔍</span>
          <span className="text-[9px] font-medium text-white/30">Search</span>
        </button>
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link key={tab.href} href={tab.href} prefetch={true} aria-current={active ? 'page' : undefined} className="flex flex-col items-center gap-0.5 py-2 px-3 tap-feedback relative min-w-[44px] min-h-[44px] justify-center">
              {active && <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />}
              <span className={`text-lg transition-all ${active ? 'scale-110' : 'opacity-50'}`}>{tab.icon}</span>
              <span className={`text-[9px] font-medium ${active ? 'text-violet-400' : 'text-white/30'}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
    </>
  )
}
