'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller: string;
  rating: number;
  reviews: number;
  image: string;
  featured: boolean;
}

interface Purchase {
  id: string;
  listingId: string;
  title: string;
  price: number;
  date: string;
  seller: string;
}

const categories = ['All', 'Travel', 'Love', 'Career', 'Adventure', 'Wisdom'];

const categoryIcons: Record<string, string> = {
  Travel: '✈️', Love: '❤️', Career: '💼', Adventure: '🏔️', Wisdom: '🦉',
};

const categoryColors: Record<string, string> = {
  Travel: '#60a5fa', Love: '#f472b6', Career: '#a78bfa', Adventure: '#34d399', Wisdom: '#fbbf24',
};

const listings: Listing[] = [
  { id: '1', title: 'Sunrise in Santorini', description: 'Experience the golden dawn over the Aegean Sea. White-washed buildings glowing in morning light.', price: 250, category: 'Travel', seller: 'Elena M.', rating: 4.9, reviews: 127, image: '🌅', featured: true },
  { id: '2', title: 'First Love Memory', description: 'The butterflies, the nervous laughter, the hand that reached out. Pure innocence.', price: 500, category: 'Love', seller: 'Marcus L.', rating: 5.0, reviews: 89, image: '💕', featured: true },
  { id: '3', title: 'Startup Success Rush', description: 'The moment your first million users sign up. Sleepless nights finally paying off.', price: 800, category: 'Career', seller: 'Priya K.', rating: 4.8, reviews: 203, image: '🚀', featured: false },
  { id: '4', title: 'Bungee Jump Freefall', description: '6 seconds of pure terror and ecstasy. The cord snaps, and you fly.', price: 180, category: 'Adventure', seller: 'Jake T.', rating: 4.7, reviews: 156, image: '🪂', featured: false },
  { id: '5', title: 'Elder\'s Last Words', description: 'Wisdom passed down through generations. A grandfather\'s final lesson about life.', price: 1000, category: 'Wisdom', seller: 'Amara N.', rating: 5.0, reviews: 45, image: '📖', featured: true },
  { id: '6', title: 'Northern Lights Dance', description: 'Green and purple curtains shimmering across the Arctic sky. Absolute wonder.', price: 350, category: 'Travel', seller: 'Bjorn S.', rating: 4.9, reviews: 178, image: '🌌', featured: false },
  { id: '7', title: 'Wedding Day Bliss', description: 'The moment you say "I do" and the world stands still. Pure love crystallized.', price: 650, category: 'Love', seller: 'Sofia R.', rating: 5.0, reviews: 92, image: '💒', featured: false },
  { id: '8', title: 'Mountain Summit Glory', description: 'Standing at 8,000m, above the clouds, touching the sky. Everything below is tiny.', price: 450, category: 'Adventure', seller: 'Tenzing P.', rating: 4.8, reviews: 134, image: '⛰️', featured: true },
  { id: '9', title: 'PhD Defense Triumph', description: 'Years of research defended in 2 hours. The committee says "Congratulations, Doctor."', price: 300, category: 'Career', seller: 'Dr. Chen W.', rating: 4.9, reviews: 67, image: '🎓', featured: false },
  { id: '10', title: 'Meditation Breakthrough', description: 'The moment ego dissolves and you feel connected to everything. Enlightenment glimpsed.', price: 900, category: 'Wisdom', seller: 'Swami R.', rating: 5.0, reviews: 31, image: '🧘', featured: false },
];

export default function SoulMarket() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [balance, setBalance] = useState(5000);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPurchases, setShowPurchases] = useState(false);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);

  useEffect(() => {
    const saved = localStorage.getItem('soul-market-purchases');
    const savedBalance = localStorage.getItem('soul-market-balance');
    if (saved) setPurchases(JSON.parse(saved));
    if (savedBalance) setBalance(Number(savedBalance));
    const pts = Array.from({ length: 35 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  const savePurchases = (p: Purchase[], b: number) => {
    localStorage.setItem('soul-market-purchases', JSON.stringify(p));
    localStorage.setItem('soul-market-balance', String(b));
  };

  const handlePurchase = (listing: Listing) => {
    if (balance < listing.price) return alert('Not enough Soul Coins!');
    setPurchasingId(listing.id);
    setTimeout(() => {
      const purchase: Purchase = {
        id: Date.now().toString(), listingId: listing.id,
        title: listing.title, price: listing.price,
        date: new Date().toISOString().split('T')[0], seller: listing.seller,
      };
      const newPurchases = [purchase, ...purchases];
      const newBalance = balance - listing.price;
      setPurchases(newPurchases);
      setBalance(newBalance);
      savePurchases(newPurchases, newBalance);
      setPurchasingId(null);
    }, 1500);
  };

  const filtered = activeCategory === 'All' ? listings : listings.filter((l) => l.category === activeCategory);
  const featured = listings.filter((l) => l.featured);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.6), rgba(244,114,182,0.2))',
            animation: `float ${8 + p.delay * 3}s ease-in-out infinite alternate`,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: 20 }}>←</Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #fbbf24, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🪙 Soul Market
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowPurchases(!showPurchases)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '6px 12px', color: '#e2e8f0', cursor: 'pointer', fontSize: 12,
          }}>
            📦 {purchases.length}
          </button>
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(244,114,182,0.2))',
            border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10,
            padding: '6px 14px', fontWeight: 700, fontSize: 14,
          }}>
            🪙 {balance.toLocaleString()}
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Purchases Panel */}
        {showPurchases && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 16, padding: 20, marginBottom: 24, backdropFilter: 'blur(12px)',
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#fbbf24' }}>Purchase History</h2>
            {purchases.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>No purchases yet. Start collecting experiences!</p>
            ) : purchases.map((p) => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{p.date} · {p.seller}</div>
                </div>
                <span style={{ color: '#f472b6', fontWeight: 700, fontSize: 13 }}>🪙 {p.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Featured */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: '#fbbf24' }}>⭐ Featured Experiences</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {featured.map((item) => (
              <div key={item.id} style={{
                minWidth: 200, background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(244,114,182,0.08))',
                border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: 16,
                backdropFilter: 'blur(12px)', flexShrink: 0,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.image}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>{item.description.slice(0, 60)}...</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>🪙 {item.price}</span>
                  <span style={{ fontSize: 10, color: '#64748b' }}>⭐ {item.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: activeCategory === cat ? `${categoryColors[cat] || '#a78bfa'}22` : 'rgba(255,255,255,0.06)',
              border: activeCategory === cat ? `1px solid ${categoryColors[cat] || '#a78bfa'}66` : '1px solid rgba(255,255,255,0.1)',
              color: activeCategory === cat ? categoryColors[cat] || '#a78bfa' : '#94a3b8',
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat !== 'All' && categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((item) => (
            <div key={item.id} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)',
            }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `linear-gradient(135deg, ${categoryColors[item.category]}22, ${categoryColors[item.category]}08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                }}>
                  {item.image}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</h3>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 10,
                      background: `${categoryColors[item.category]}22`, color: categoryColors[item.category],
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 8 }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>by {item.seller}</span>
                      <span style={{ fontSize: 11, color: '#fbbf24' }}>⭐ {item.rating} ({item.reviews})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>🪙 {item.price}</span>
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={purchasingId === item.id}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: purchasingId === item.id ? 'rgba(251,191,36,0.2)' : 'linear-gradient(135deg, #f59e0b, #ec4899)',
                          border: 'none', color: '#fff', cursor: purchasingId === item.id ? 'wait' : 'pointer',
                        }}
                      >
                        {purchasingId === item.id ? '⏳' : 'Buy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-25px); } }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
