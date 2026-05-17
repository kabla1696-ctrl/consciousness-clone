'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard', icon: '🏠', label: 'Home' },
  { href: '/clone-feed', icon: '📰', label: 'Feed' },
  { href: '/voice-call', icon: '📞', label: 'Call' },
  { href: '/clone-connect', icon: '💬', label: 'Chat' },
  { href: '/memories', icon: '🧠', label: 'Memories' },
]

export default function MobileNav() {
  const pathname = usePathname()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/[0.06] md:hidden safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-2 py-1">
        {TABS.map(tab => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 py-2 px-3 tap-feedback relative">
              {active && <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />}
              <span className={`text-lg transition-all ${active ? 'scale-110' : 'opacity-50'}`}>{tab.icon}</span>
              <span className={`text-[9px] font-medium ${active ? 'text-violet-400' : 'text-white/30'}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
