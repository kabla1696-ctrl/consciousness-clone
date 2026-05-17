'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useT } from '../../lib/language-context'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  price: number
  rating: number
  reviews: number
  seller: string
  sellerAvatar: string
  preview: string
  tags: string[]
  createdAt: string
}

interface CartItem {
  listing: Listing
  quantity: number
}

const CATEGORIES = ['All', 'Travel', 'Cooking', 'Career', 'Parenting', 'Adventure']
const CAT_COLORS: Record<string, string> = {
  Travel: '#06b6d4',
  Cooking: '#f59e0b',
  Career: '#8b5cf6',
  Parenting: '#ec4899',
  Adventure: '#10b981',
}
const CAT_EMOJIS: Record<string, string> = {
  Travel: '✈️',
  Cooking: '🍳',
  Career: '💼',
  Parenting: '👶',
  Adventure: '🏔️',
}

const LS_LISTINGS = 'cc_marketplace_listings'
const LS_CART = 'cc_marketplace_cart'

function loadListings(): Listing[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LS_LISTINGS)
    if (stored) return JSON.parse(stored)
    return DEFAULT_LISTINGS
  } catch { return DEFAULT_LISTINGS }
}

function saveListings(listings: Listing[]) {
  localStorage.setItem(LS_LISTINGS, JSON.stringify(listings))
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_CART) || '[]') } catch { return [] }
}

function saveCart(cart: CartItem[]) {
  localStorage.setItem(LS_CART, JSON.stringify(cart))
}

const DEFAULT_LISTINGS: Listing[] = [
  { id: '1', title: 'Sunrise Over Santorini', description: 'Feel the warm Mediterranean breeze as you watch the sun paint the caldera gold. Includes the taste of fresh feta and olive oil breakfast.', category: 'Travel', price: 45, rating: 4.9, reviews: 128, seller: 'Elena M.', sellerAvatar: '🇬🇷', preview: 'Standing on whitewashed steps, the Aegean Sea stretching endlessly...', tags: ['greece', 'sunrise', 'peaceful'], createdAt: '2024-03-15' },
  { id: '2', title: 'Mastering Ramen Broth', description: 'A grandmother\'s 40-year secret to perfect tonkotsu. Feel the rhythm of stirring, the umami building over 18 hours.', category: 'Cooking', price: 30, rating: 4.7, reviews: 89, seller: 'Kenji T.', sellerAvatar: '🇯🇵', preview: 'The wooden ladle moves in slow circles, steam rising from the milky broth...', tags: ['japanese', 'ramen', 'tradition'], createdAt: '2024-02-20' },
  { id: '3', title: 'First Day as CEO', description: 'The nervousness, the pride, the weight of responsibility. Walk into that corner office for the first time.', category: 'Career', price: 60, rating: 4.8, reviews: 204, seller: 'Marcus J.', sellerAvatar: '👔', preview: 'The elevator dings. Floor 42. Your name is on the glass door...', tags: ['leadership', 'achievement', 'corporate'], createdAt: '2024-01-10' },
  { id: '4', title: 'Baby\'s First Steps', description: 'That moment when tiny legs find balance for the first time. Pure wonder, pure joy, pure terror.', category: 'Parenting', price: 55, rating: 5.0, reviews: 312, seller: 'Sarah L.', sellerAvatar: '👶', preview: 'Those chubby hands let go of the coffee table. Two wobbly steps forward...', tags: ['milestone', 'joy', 'family'], createdAt: '2024-04-01' },
  { id: '5', title: 'Summit of Kilimanjaro', description: 'Oxygen-thin air, frozen fingers, and then... the rooftop of Africa beneath your feet.', category: 'Adventure', price: 75, rating: 4.9, reviews: 167, seller: 'David K.', sellerAvatar: '🏔️', preview: 'Each breath is a battle. The glacier gleams. You\'re above the clouds...', tags: ['mountain', 'endurance', 'africa'], createdAt: '2024-03-28' },
  { id: '6', title: 'Street Food Tour: Bangkok', description: 'Sizzling woks, chili smoke, the perfect pad thai from a cart that\'s been there 30 years.', category: 'Travel', price: 35, rating: 4.6, reviews: 95, seller: 'Nina P.', sellerAvatar: '🇹🇭', preview: 'The night market glows neon. A woman tosses noodles with practiced grace...', tags: ['thailand', 'food', 'nightlife'], createdAt: '2024-02-14' },
  { id: '7', title: 'Baking Sourdough from Scratch', description: 'The patience of nurturing a starter, the crack of a perfect crust. Bread as meditation.', category: 'Cooking', price: 25, rating: 4.5, reviews: 73, seller: 'Anna B.', sellerAvatar: '🍞', preview: 'Flour dusts the counter. The dough stretches, alive with wild yeast...', tags: ['bread', 'patience', 'artisan'], createdAt: '2024-03-05' },
  { id: '8', title: 'TED Talk Stage Fright to Triumph', description: 'From shaking hands backstage to a standing ovation. The full emotional arc of public speaking.', category: 'Career', price: 50, rating: 4.8, reviews: 156, seller: 'Priya S.', sellerAvatar: '🎤', preview: 'The red dot of the camera. 2000 faces. Your mouth goes dry...', tags: ['speaking', 'courage', 'inspiration'], createdAt: '2024-01-22' },
  { id: '9', title: 'Scuba Diving the Great Barrier Reef', description: 'Descend into a world of impossible color. Swim alongside a sea turtle. Breathe underwater.', category: 'Adventure', price: 65, rating: 4.9, reviews: 201, seller: 'Tom H.', sellerAvatar: '🤿', preview: 'Bubbles rise as you descend. A clownfish peers from its anemone home...', tags: ['ocean', 'diving', 'nature'], createdAt: '2024-04-10' },
  { id: '10', title: 'Reading Bedtime Stories', description: 'The sleepy weight of a child against your shoulder. Voices for each character. Magic.', category: 'Parenting', price: 20, rating: 5.0, reviews: 289, seller: 'James W.', sellerAvatar: '📖', preview: 'Once upon a time... small eyes flutter, fighting sleep...', tags: ['bedtime', 'bonding', 'stories'], createdAt: '2024-03-20' },
]

function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="absolute rounded-full animate-float" style={{
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: `radial-gradient(circle, ${['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4]}88, transparent)`,
          animationDuration: `${4 + Math.random() * 6}s`,
          animationDelay: `${Math.random() * 3}s`,
        }} />
      ))}
    </div>
  )
}

export default function MemoryMarketplace() {
  const t = useT();
  const [listings, setListings] = useState<Listing[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular')
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    const loaded = loadListings()
    if (loaded.length === 0) {
      saveListings(DEFAULT_LISTINGS)
      setListings(DEFAULT_LISTINGS)
    } else {
      setListings(loaded)
    }
    setCart(loadCart())
    setTimeout(() => setAnimateIn(true), 50)
  }, [])

  const filtered = listings
    .filter(l => selectedCategory === 'All' || l.category === selectedCategory)
    .filter(l => !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'rating') return b.rating - a.rating
      return b.reviews - a.reviews
    })

  const addToCart = (listing: Listing) => {
    const updated = [...cart]
    const existing = updated.find(c => c.listing.id === listing.id)
    if (existing) existing.quantity++
    else updated.push({ listing, quantity: 1 })
    setCart(updated)
    saveCart(updated)
  }

  const removeFromCart = (id: string) => {
    const updated = cart.filter(c => c.listing.id !== id)
    setCart(updated)
    saveCart(updated)
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.listing.price * c.quantity, 0)
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <div className="min-h-screen relative" style={{ background: '#050510' }}>
      <Particles />
      <style jsx global>{`
        @keyframes float { 0%,100% { transform: translateY(0) scale(1); opacity: .6; } 50% { transform: translateY(-30px) scale(1.2); opacity: 1; } }
        @keyframes slideUp { from { opacity:0; transform: translateY(30px); } to { opacity:1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp .5s ease forwards; }
        .glass { background: rgba(255,255,255,.04); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,.08); }
        .glass-strong { background: rgba(255,255,255,.08); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,.12); }
        .shimmer-btn { background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.1) 50%, transparent 100%); background-size: 200% 100%; animation: shimmer 2s infinite; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🏪 {t('marketplace')}
          </h1>
          <button onClick={() => setShowCart(!showCart)} className="relative p-2">
            <span className="text-xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className={`relative z-10 px-4 pb-8 transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Search */}
        <div className="mt-4 mb-4">
          <div className="glass rounded-2xl p-1">
            <input
              type="text"
              placeholder={`🔍 ${t('browse')}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-white/30 px-4 py-3 outline-none text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                  : 'glass text-white/60 hover:text-white'
              }`}
            >
              {cat !== 'All' && CAT_EMOJIS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-2 mb-4">
          {(['popular', 'price', 'rating'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {s === 'popular' ? '🔥 Popular' : s === 'price' ? '💰 Price' : '⭐ Rating'}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((listing, i) => (
            <div
              key={listing.id}
              className="glass rounded-2xl overflow-hidden animate-slide-up cursor-pointer hover:border-white/20 transition-all"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedListing(listing)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{listing.sellerAvatar}</span>
                    <div>
                      <p className="text-white/60 text-xs">{listing.seller}</p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{
                        background: `${CAT_COLORS[listing.category]}20`,
                        color: CAT_COLORS[listing.category],
                      }}>
                        {CAT_EMOJIS[listing.category]} {listing.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{listing.price} <span className="text-xs text-white/40">credits</span></p>
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(listing.rating))}</span>
                      <span className="text-white/40 text-xs">({listing.reviews})</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-base mb-1">{listing.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-3 line-clamp-2">{listing.preview}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {listing.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">#{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); addToCart(listing) }}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
                  >
                    {t('buy')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedListing(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-strong rounded-t-3xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedListing.sellerAvatar}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedListing.title}</h2>
                <p className="text-white/50 text-sm">by {selectedListing.seller}</p>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">{selectedListing.description}</p>
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-white/40 text-xs mb-2">Preview</p>
              <p className="text-white/70 text-sm italic leading-relaxed">&ldquo;{selectedListing.preview}&rdquo;</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{selectedListing.price} <span className="text-sm text-white/40">credits</span></p>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">{'★'.repeat(Math.round(selectedListing.rating))}</span>
                  <span className="text-white/40 text-sm">{selectedListing.rating} ({selectedListing.reviews} reviews)</span>
                </div>
              </div>
              <button
                onClick={() => { addToCart(selectedListing); setSelectedListing(null) }}
                className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
              >
                {t('buy')} 🛒
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowCart(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg glass-strong rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">🛒 Your Cart</h2>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🛒</p>
                <p className="text-white/40">Your cart is empty</p>
                <p className="text-white/20 text-sm">Browse memories and add some!</p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.listing.id} className="glass rounded-xl p-3 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.listing.sellerAvatar}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{item.listing.title}</p>
                        <p className="text-white/40 text-xs">{item.listing.price} credits × {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-white font-semibold">{item.listing.price * item.quantity}</p>
                      <button onClick={() => removeFromCart(item.listing.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 mt-4 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/40 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{cartTotal} <span className="text-sm text-white/40">credits</span></p>
                  </div>
                  <button
                    onClick={() => { setCart([]); saveCart([]); setShowCart(false) }}
                    className="px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25 transition-all active:scale-95"
                  >
                    Checkout ✨
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
