import { FEATURES } from './features-data';

export type SearchResultType = 'feature' | 'memory' | 'chat' | 'setting' | 'navigation'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  icon: string
  href: string
  color?: string
  glow?: string
}

export interface GroupedResults {
  features: SearchResult[]
  memories: SearchResult[]
  chats: SearchResult[]
  settings: SearchResult[]
  navigation: SearchResult[]
}

const RECENT_SEARCHES_KEY = 'consciousness-recent-searches'
const MAX_RECENT = 8

// Settings pages derived from features
const SETTINGS_ITEMS: { title: string; desc: string; href: string; icon: string }[] = [
  { title: 'Clone Settings', desc: 'Customize your clone', href: '/clone-settings', icon: '⚙️' },
  { title: 'Language', desc: '47+ languages supported', href: '/language', icon: '🌍' },
  { title: 'Analytics', desc: 'Insights about your clone', href: '/analytics', icon: '📈' },
  { title: 'Public Profile', desc: 'Share your clone with world', href: '/public-profile', icon: '🌐' },
  { title: 'Consciousness Backup', desc: 'Backup your consciousness', href: '/consciousness-backup', icon: '☁️' },
]

function matchesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function searchFeatures(query: string): SearchResult[] {
  if (!query.trim()) return []
  return FEATURES
    .filter(f =>
      matchesQuery(f.title, query) ||
      matchesQuery(f.desc, query) ||
      matchesQuery(f.category, query)
    )
    .map(f => ({
      id: `feature-${f.href}`,
      type: 'feature' as SearchResultType,
      title: f.title,
      subtitle: f.desc,
      icon: f.icon,
      href: f.href,
      color: f.color,
      glow: f.glow,
    }))
}

export function searchMemories(query: string): SearchResult[] {
  if (!query.trim()) return []
  try {
    const raw = localStorage.getItem('consciousness-memories')
    if (!raw) return []
    const memories: { id?: string; title?: string; content?: string; date?: string }[] = JSON.parse(raw)
    return memories
      .filter(m =>
        matchesQuery(m.title || '', query) ||
        matchesQuery(m.content || '', query)
      )
      .slice(0, 10)
      .map(m => ({
        id: `memory-${m.id || m.title}`,
        type: 'memory' as SearchResultType,
        title: m.title || 'Untitled Memory',
        subtitle: (m.content || '').slice(0, 100) + ((m.content || '').length > 100 ? '…' : ''),
        icon: '📝',
        href: '/memories',
      }))
  } catch {
    return []
  }
}

export function searchChats(query: string): SearchResult[] {
  if (!query.trim()) return []
  try {
    const raw = localStorage.getItem('consciousness-chats')
    if (!raw) return []
    const chats: { id?: string; title?: string; lastMessage?: string; preview?: string }[] = JSON.parse(raw)
    return chats
      .filter(c =>
        matchesQuery(c.title || '', query) ||
        matchesQuery(c.lastMessage || '', query) ||
        matchesQuery(c.preview || '', query)
      )
      .slice(0, 8)
      .map(c => ({
        id: `chat-${c.id || c.title}`,
        type: 'chat' as SearchResultType,
        title: c.title || 'Chat',
        subtitle: c.lastMessage || c.preview || '',
        icon: '💬',
        href: `/chat${c.id ? `?id=${c.id}` : ''}`,
      }))
  } catch {
    return []
  }
}

export function searchSettings(query: string): SearchResult[] {
  if (!query.trim()) return []
  return SETTINGS_ITEMS
    .filter(s => matchesQuery(s.title, query) || matchesQuery(s.desc, query))
    .map(s => ({
      id: `setting-${s.href}`,
      type: 'setting' as SearchResultType,
      title: s.title,
      subtitle: s.desc,
      icon: s.icon,
      href: s.href,
    }))
}

export function searchNavigation(query: string): SearchResult[] {
  if (!query.trim()) return []
  const NAV_ITEMS = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard', desc: 'Home dashboard' },
    { href: '/clone-feed', icon: '📰', label: 'Social Feed', desc: 'Clone social media' },
    { href: '/clone-connect', icon: '💬', label: 'Messages', desc: 'Chat with clones' },
    { href: '/vault', icon: '🧠', label: 'Memories', desc: 'Your memory vault' },
    { href: '/personality', icon: '🧬', label: 'Personality', desc: 'Define your traits' },
    { href: '/analytics', icon: '📈', label: 'Analytics', desc: 'Insights & stats' },
    { href: '/public-profile', icon: '🌐', label: 'Profile', desc: 'Your public profile' },
    { href: '/language', icon: '🌍', label: 'Language', desc: 'Language settings' },
  ]
  return NAV_ITEMS
    .filter(n => matchesQuery(n.label, query) || matchesQuery(n.desc, query))
    .map(n => ({
      id: `nav-${n.href}`,
      type: 'navigation' as SearchResultType,
      title: n.label,
      subtitle: n.desc,
      icon: n.icon,
      href: n.href,
    }))
}

export function searchAll(query: string): GroupedResults {
  const features = searchFeatures(query)
  const memories = searchMemories(query)
  const chats = searchChats(query)
  const settings = searchSettings(query)
  const navigation = searchNavigation(query)
  return { features, memories, chats, settings, navigation }
}

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRecentSearch(query: string): void {
  if (!query.trim()) return
  const recent = getRecentSearches().filter(s => s !== query)
  recent.unshift(query.trim())
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

export const TRENDING_SEARCHES = [
  'memories', 'chat', 'personality', 'mood', 'dreams', 'legacy', 'goals', 'voice'
]
