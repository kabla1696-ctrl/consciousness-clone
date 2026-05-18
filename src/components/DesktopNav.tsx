'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

const NotificationCenter = dynamic(() => import('./NotificationCenter'), { ssr: false })
const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false })
import { useTheme } from '@/lib/theme-context'

type NavItem = { href: string; icon: string; label: string }
type NavSection = { title: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Core',
    items: [
      { href: '/dashboard', icon: '📊', label: 'Dashboard' },
      { href: '/chat', icon: '💬', label: 'AI Chat' },
      { href: '/vault', icon: '🔒', label: 'Vault' },
      { href: '/feed', icon: '📰', label: 'Feed' },
    ],
  },
  {
    title: 'AI Features',
    items: [
      { href: '/clone-social', icon: '🌐', label: 'Clone Social' },
      { href: '/personality-quiz', icon: '🧬', label: 'Personality Quiz' },
      { href: '/mood-tracker', icon: '🎭', label: 'Mood Tracker' },
      { href: '/dream-lab', icon: '🌙', label: 'Dream Lab' },
      { href: '/voice', icon: '🎙️', label: 'Voice Clone' },
      { href: '/clone-diary', icon: '📖', label: 'Clone Diary' },
      { href: '/clone-poet', icon: '✍️', label: 'Clone Poet' },
      { href: '/clone-podcast', icon: '🎧', label: 'Clone Podcast' },
    ],
  },
  {
    title: 'Memory',
    items: [
      { href: '/life-story', icon: '📚', label: 'Life Story' },
      { href: '/legacy-letter', icon: '💌', label: 'Legacy Letter' },
      { href: '/time-capsule', icon: '⏳', label: 'Time Capsule' },
      { href: '/memory-dna', icon: '🧬', label: 'Memory DNA' },
      { href: '/achievements', icon: '🏆', label: 'Achievements' },
      { href: '/relationships', icon: '❤️', label: 'Relationships' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { href: '/analytics', icon: '📈', label: 'Analytics' },
      { href: '/calendar', icon: '📅', label: 'Calendar' },
      { href: '/insights', icon: '💡', label: 'Insights' },
      { href: '/backup', icon: '☁️', label: 'Backup' },
      { href: '/notifications', icon: '🔔', label: 'Notifications' },
      { href: '/settings', icon: '⚙️', label: 'Settings' },
    ],
  },
]

const MORE_ITEMS: NavItem[] = [
  { href: '/memories', icon: '📝', label: 'Memories' },
  { href: '/clone-connect', icon: '🤝', label: 'Messages' },
  { href: '/public-profile', icon: '🌐', label: 'Profile' },
  { href: '/language', icon: '🌍', label: 'Language' },
  { href: '/last-words', icon: '📜', label: 'Last Words' },
  { href: '/dead-mans-switch', icon: '⏰', label: "Dead Man's Switch" },
  { href: '/future-self', icon: '🔮', label: 'Future Self' },
  { href: '/predictions', icon: '🌟', label: 'Predictions' },
  { href: '/memory-stories', icon: '✨', label: 'Memory Stories' },
  { href: '/mirror-mode', icon: '🪞', label: 'Mirror Mode' },
  { href: '/emotion-engine', icon: '💜', label: 'Emotion Engine' },
  { href: '/personality-snapshots', icon: '📸', label: 'Personality Snapshots' },
  { href: '/goals', icon: '🎯', label: 'Life Goals' },
  { href: '/life-score', icon: '📊', label: 'Life Score' },
  { href: '/mindfulness', icon: '🧘', label: 'Mindfulness' },
  { href: '/idea-generator', icon: '💡', label: 'Idea Generator' },
  { href: '/soul-playlist', icon: '🎵', label: 'Soul Playlist' },
  { href: '/photo-memories', icon: '📸', label: 'Photo Memories' },
  { href: '/voice-journal', icon: '🎤', label: 'Voice Journal' },
  { href: '/clone-quiz', icon: '🎮', label: 'Clone Quiz' },
  { href: '/clone-network', icon: '🤝', label: 'Clone Network' },
  { href: '/referral', icon: '🎁', label: 'Refer & Earn' },
  { href: '/share', icon: '🔗', label: 'Share Clone' },
  { href: '/heir-access', icon: '🔑', label: 'Heir Access' },
  { href: '/heartbeat', icon: '💓', label: 'Heartbeat Memory' },
  { href: '/astronaut', icon: '🚀', label: 'Astronaut Mode' },
  { href: '/clone-identity', icon: '🪪', label: 'Clone Identity' },
  { href: '/daily-briefing', icon: '☀️', label: 'Daily Briefing' },
  { href: '/widget', icon: '📱', label: 'Widget' },
  { href: '/soul-sync', icon: '💕', label: 'Soul Sync' },
  { href: '/soul-transfer', icon: '🧬', label: 'Soul Transfer' },
  { href: '/time-travel', icon: '⏰', label: 'Time Travel' },
  { href: '/death-simulation', icon: '💀', label: 'Death Simulation' },
  { href: '/death-detection', icon: '⚰️', label: 'Death Detection' },
  { href: '/ghost-mode', icon: '👻', label: 'Ghost Mode' },
  { href: '/clone-therapy', icon: '🧘', label: 'Clone Therapy' },
  { href: '/memory-milestones', icon: '🏅', label: 'Milestones' },
  { href: '/clone-confessions', icon: '🤫', label: 'Confessions' },
  { href: '/memory-auction', icon: '🔨', label: 'Memory Auction' },
  { href: '/soul-tattoo', icon: '🖋️', label: 'Soul Tattoo' },
  { href: '/clone-dating', icon: '💕', label: 'Clone Dating' },
  { href: '/digital-reincarnation', icon: '♻️', label: 'Reincarnation' },
  { href: '/memory-marketplace', icon: '🏪', label: 'Marketplace' },
  { href: '/dream-sharing', icon: '💭', label: 'Dream Sharing' },
  { href: '/clone-orchestra', icon: '🎼', label: 'Clone Orchestra' },
  { href: '/soul-frequency', icon: '📡', label: 'Soul Frequency' },
  { href: '/clone-passport', icon: '🛂', label: 'Clone Passport' },
  { href: '/emotional-weather', icon: '🌤️', label: 'Emotional Weather' },
  { href: '/soulmate-ring', icon: '💍', label: 'Soulmate Ring' },
  { href: '/memory-constellation', icon: '⭐', label: 'Constellation' },
  { href: '/clone-therapy-dog', icon: '🐕', label: 'Therapy Dog' },
  { href: '/legacy-tree', icon: '🌳', label: 'Legacy Tree' },
  { href: '/clone-voice-calls', icon: '📞', label: 'Voice Calls' },
  { href: '/voice-call', icon: '📞', label: 'Live Voice Call' },
  { href: '/memory-encryption', icon: '🔒', label: 'Blockchain Memory' },
  { href: '/personality-evolution', icon: '🧬', label: 'Evolution' },
  { href: '/memory-triggers', icon: '⚡', label: 'Memory Triggers' },
  { href: '/clone-guardian', icon: '🛡️', label: 'Guardian Angel' },
  { href: '/soul-mirror', icon: '🪞', label: 'Soul Mirror' },
  { href: '/memory-reels', icon: '🎬', label: 'Memory Reels' },
  { href: '/clone-tournament', icon: '⚔️', label: 'Clone Battles' },
  { href: '/chat-user', icon: '💬', label: 'User Chat' },
  { href: '/voice-user', icon: '📞', label: 'User Voice Call' },
  { href: '/video-user', icon: '📹', label: 'User Video Call' },
  { href: '/clone-evolution', icon: '🧬', label: 'Evolution Tree' },
  { href: '/memory-smell', icon: '🌸', label: 'Memory Smell' },
  { href: '/clone-sleep', icon: '😴', label: 'Clone Sleep' },
  { href: '/soul-encryption', icon: '🔐', label: 'Soul Encryption' },
  { href: '/memory-weather', icon: '🌤️', label: 'Memory Weather' },
  { href: '/clone-dna', icon: '🧬', label: 'Clone DNA' },
  { href: '/soul-mining', icon: '⛏️', label: 'Soul Mining' },
  { href: '/clone-level', icon: '📊', label: 'Clone Level' },
  { href: '/soul-leaderboard', icon: '🏆', label: 'Leaderboard' },
  { href: '/clone-achievements', icon: '🎖️', label: 'Achievements' },
  { href: '/clone-predictions', icon: '🔮', label: 'AI Predictions' },
  { href: '/memory-artist', icon: '🎨', label: 'AI Artist' },
  { href: '/soul-diagnosis', icon: '🩺', label: 'Soul Diagnosis' },
  { href: '/memory-time-machine', icon: '⏳', label: 'Time Machine' },
  { href: '/soul-market', icon: '🏪', label: 'Soul Market' },
  { href: '/clone-embassy', icon: '🏛️', label: 'Clone Embassy' },
  { href: '/memory-museum', icon: '🏛️', label: 'Memory Museum' },
  { href: '/last-breath', icon: '💀', label: 'Last Breath' },
  { href: '/memory-ghost', icon: '👻', label: 'Memory Ghost' },
  { href: '/soul-cemetery', icon: '⚰️', label: 'Soul Cemetery' },
  { href: '/digital-seance', icon: '🕯️', label: 'Digital Seance' },
  { href: '/clone-aura', icon: '✨', label: 'Clone Aura' },
  { href: '/memory-palace', icon: '🏰', label: 'Memory Palace' },
  { href: '/memory-replay', icon: '▶️', label: 'Memory Replay' },
  { href: '/call-user', icon: '📞', label: 'Voice Call Users' },
  { href: '/family', icon: '👨\u200d👩\u200d👧\u200d👦', label: 'Family' },
  { href: '/mood', icon: '🎭', label: 'Mood' },
  { href: '/personality', icon: '🧬', label: 'Personality' },
  { href: '/legacy', icon: '📜', label: 'Legacy' },
  { href: '/memory-map', icon: '🗺️', label: 'Memory Map' },
  { href: '/skills', icon: '💪', label: 'Skills' },
  { href: '/consciousness-backup', icon: '🧠', label: 'Consciousness Backup' },
  { href: '/dream-mode', icon: '💤', label: 'Dream Mode' },
  { href: '/clone-feed', icon: '📡', label: 'Clone Feed' },
  { href: '/clone-settings', icon: '⚙️', label: 'Clone Settings' },
]

export default function DesktopNav() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { colorMode, toggleColorMode } = useTheme()

  const handleKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <>
    <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    <aside role="complementary" aria-label="Sidebar navigation" className={`hidden md:flex fixed left-0 top-0 bottom-0 z-[100] flex-col bg-[#0a0a1a]/90 backdrop-blur-xl border-r border-white/[0.06] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20 flex-shrink-0">🧠</div>
        {!collapsed && <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Consciousness Clone</span>}
        <NotificationCenter />
        <button onClick={() => setSearchOpen(true)} aria-label="Search" className="text-white/20 hover:text-white/50 text-sm tap-feedback" title="Search (⌘K)">🔍</button>
        <button onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="ml-auto text-white/20 hover:text-white/50 text-xs tap-feedback">☰</button>
      </div>

      {/* Nav Items */}
      <nav role="navigation" aria-label="Main navigation" className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all tap-feedback group ${active ? 'bg-violet-500/15 text-violet-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <span className={`text-lg flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>{item.icon}</span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* More Section */}
        <div>
          <button
            onClick={() => setShowMore(!showMore)}
            aria-label={showMore ? 'Show less navigation' : 'Show more navigation'}
            aria-expanded={showMore}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all tap-feedback w-full text-white/30 hover:text-white/50 hover:bg-white/[0.03] ${collapsed ? 'justify-center' : ''}`}
          >
            <span className="text-lg flex-shrink-0">⋯</span>
            {!collapsed && <span className="text-sm font-medium">{showMore ? 'Show Less' : 'Show More'}</span>}
          </button>
          {showMore && (
            <div className="space-y-0.5">
              {MORE_ITEMS.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all tap-feedback group ${active ? 'bg-violet-500/15 text-violet-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'}`}>
                    <span className={`text-lg flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>{item.icon}</span>
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={toggleColorMode}
          aria-label={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-all tap-feedback"
          title={colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="text-lg flex-shrink-0">{colorMode === 'dark' ? '☀️' : '🌙'}</span>
          {!collapsed && <span className="text-sm font-medium">{colorMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        {!collapsed && <div className="text-[10px] text-white/15 mt-2">Consciousness Clone v2.0</div>}
      </div>
    </aside>
    </>
  )
}
