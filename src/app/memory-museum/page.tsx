'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Exhibit {
  id: string;
  title: string;
  description: string;
  year: string;
  emotion: string;
  rarity: 'common' | 'rare' | 'legendary';
}

interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  exhibits: Exhibit[];
}

const rooms: Room[] = [
  {
    id: 'childhood', name: 'Childhood', icon: '🧸', color: '#fbbf24',
    exhibits: [
      { id: 'c1', title: 'First Bicycle Ride', description: 'Wobbly wheels, scraped knees, and the joy of balancing. Dad letting go.', year: '2008', emotion: 'Joy', rarity: 'rare' },
      { id: 'c2', title: 'Blanket Fort Kingdom', description: 'Two chairs, a blanket, infinite imagination. No grown-ups allowed.', year: '2007', emotion: 'Wonder', rarity: 'common' },
      { id: 'c3', title: 'Monster Under the Bed', description: 'Fear at midnight, courage by morning. The night light that saved dreams.', year: '2006', emotion: 'Fear → Courage', rarity: 'common' },
      { id: 'c4', title: 'Summer Rain Dance', description: 'Barefoot through puddles, arms wide open. Pure happiness.', year: '2009', emotion: 'Bliss', rarity: 'rare' },
    ],
  },
  {
    id: 'love', name: 'Love', icon: '💕', color: '#f472b6',
    exhibits: [
      { id: 'l1', title: 'The First Glance', description: 'Time stopped. Hearts raced. A thousand words in a single look.', year: '2018', emotion: 'Electric', rarity: 'legendary' },
      { id: 'l2', title: 'Midnight Conversations', description: '3 AM talks about nothing and everything. Two souls intertwined.', year: '2019', emotion: 'Intimate', rarity: 'rare' },
      { id: 'l3', title: 'The Apology', description: 'Swallowed pride, opened heart. The hardest words that saved everything.', year: '2020', emotion: 'Vulnerable', rarity: 'rare' },
      { id: 'l4', title: 'Dancing in the Kitchen', description: 'No music needed. Just two people, swaying to heartbeats.', year: '2021', emotion: 'Tender', rarity: 'common' },
    ],
  },
  {
    id: 'career', name: 'Career', icon: '🚀', color: '#a78bfa',
    exhibits: [
      { id: 'w1', title: 'The Big Idea', description: '3 AM, whiteboard full of scribbles. The eureka moment that changed everything.', year: '2022', emotion: 'Inspired', rarity: 'legendary' },
      { id: 'w2', title: 'First Paycheck', description: 'Trembling hands opening that envelope. Proving it was possible.', year: '2016', emotion: 'Proud', rarity: 'common' },
      { id: 'w3', title: 'The Failure', description: 'Everything collapsed. From the ashes, resilience was born.', year: '2019', emotion: 'Resilient', rarity: 'rare' },
      { id: 'w4', title: 'Mentoring Moment', description: 'Watching someone you guided succeed. Pure pride.', year: '2023', emotion: 'Fulfilled', rarity: 'rare' },
    ],
  },
  {
    id: 'adventure', name: 'Adventure', icon: '🏔️', color: '#34d399',
    exhibits: [
      { id: 'a1', title: 'Lost in Tokyo', description: 'No map, no plan. A tiny ramen shop became the highlight.', year: '2020', emotion: 'Free', rarity: 'rare' },
      { id: 'a2', title: 'Summit Sunrise', description: 'Four hours climbing in darkness. Sun breaks the horizon, world glows gold.', year: '2021', emotion: 'Triumphant', rarity: 'legendary' },
      { id: 'a3', title: 'Road Trip Chaos', description: 'Flat tire in nowhere, laughing hysterically. Best detour ever.', year: '2019', emotion: 'Hilarious', rarity: 'common' },
      { id: 'a4', title: 'Ocean Dive', description: 'Blue silence. A sea turtle passes, unbothered. You are the alien.', year: '2022', emotion: 'Awe', rarity: 'rare' },
    ],
  },
  {
    id: 'wisdom', name: 'Wisdom', icon: '🦉', color: '#fbbf24',
    exhibits: [
      { id: 'w5', title: 'The Letting Go', description: 'Holding on hurt more than releasing. Choosing peace over being right.', year: '2023', emotion: 'Peaceful', rarity: 'legendary' },
      { id: 'w6', title: 'Silence Speaks', description: 'Sitting with a grieving friend. No words. Just presence.', year: '2022', emotion: 'Compassionate', rarity: 'rare' },
      { id: 'w7', title: 'The Mirror', description: 'Seeing yourself clearly. Not who you pretend, but who you are.', year: '2024', emotion: 'Awakened', rarity: 'legendary' },
      { id: 'w8', title: 'Gratitude Flood', description: 'A random Tuesday. Coffee in hand. This moment is everything.', year: '2024', emotion: 'Grateful', rarity: 'common' },
    ],
  },
];

const rarityColors: Record<string, string> = { common: '#94a3b8', rare: '#60a5fa', legendary: '#fbbf24' };
const rarityBg: Record<string, string> = { common: 'rgba(148,163,184,0.1)', rare: 'rgba(96,165,250,0.1)', legendary: 'rgba(251,191,36,0.15)' };

export default function MemoryMuseum() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [isTouring, setIsTouring] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [viewedExhibits, setViewedExhibits] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('museum-visitors');
    const count = saved ? Number(saved) + 1 : 1;
    setVisitorCount(count);
    localStorage.setItem('museum-visitors', String(count));

    const savedViewed = localStorage.getItem('museum-viewed');
    if (savedViewed) setViewedExhibits(new Set(JSON.parse(savedViewed)));

    const pts = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1,
    }));
    setParticles(pts);
  }, []);

  const markViewed = (id: string) => {
    const next = new Set(viewedExhibits);
    next.add(id);
    setViewedExhibits(next);
    localStorage.setItem('museum-viewed', JSON.stringify([...next]));
  };

  const tourMessages = [
    '🏛️ Welcome to the Memory Museum! I\'m your guide. Let me show you around.',
    '📚 Each room holds a different chapter of life. Childhood, Love, Career, Adventure, and Wisdom.',
    '🖼️ Every exhibit is a moment frozen in time — a memory worth preserving forever.',
    '✨ Notice the rarity? Common memories are everyday magic. Legendary ones change who you are.',
    '🎭 Tap any room to explore. Take your time. Memories aren\'t meant to be rushed.',
    '🌟 Enjoy your visit! Remember: every memory you view becomes part of your own story.',
  ];

  const startTour = () => { setIsTouring(true); setTourStep(0); };
  const nextTour = () => { if (tourStep < tourMessages.length - 1) setTourStep(tourStep + 1); else setIsTouring(false); };

  const selectedRoom = rooms.find((r) => r.id === activeRoom);
  const totalExhibits = rooms.reduce((acc, r) => acc + r.exhibits.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.5), rgba(167,139,250,0.2))',
            animation: `float ${12 + p.id * 0.4}s ease-in-out infinite alternate`,
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
          <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #fbbf24, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏛️ Memory Museum
          </h1>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>👥 {visitorCount.toLocaleString()} visitors</div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Tour Guide */}
        {isTouring && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(167,139,250,0.08))',
            border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: 20,
            marginBottom: 20, backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>🎙️</div>
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{tourMessages[tourStep]}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={nextTour} style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'linear-gradient(135deg, #fbbf24, #a78bfa)', border: 'none', color: '#fff', cursor: 'pointer',
                  }}>
                    {tourStep < tourMessages.length - 1 ? 'Next →' : 'Finish Tour ✨'}
                  </button>
                  <button onClick={() => setIsTouring(false)} style={{
                    padding: '6px 16px', borderRadius: 8, fontSize: 12,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', cursor: 'pointer',
                  }}>
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Museum Stats */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.15)',
          borderRadius: 16, padding: 20, marginBottom: 20, backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'space-around', textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{rooms.length}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Rooms</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa' }}>{totalExhibits}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Exhibits</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>{viewedExhibits.size}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Viewed</div>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>{Math.round((viewedExhibits.size / totalExhibits) * 100)}%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Complete</div>
          </div>
        </div>

        {!isTouring && (
          <button onClick={startTour} style={{
            width: '100%', padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
            color: '#fbbf24', cursor: 'pointer',
          }}>
            🎙️ Start Museum Tour
          </button>
        )}

        {/* Room Gallery */}
        {!activeRoom ? (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: '#fbbf24' }}>🖼️ Gallery Rooms</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {rooms.map((room) => (
                <button key={room.id} onClick={() => setActiveRoom(room.id)} style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${room.color}33`,
                  borderRadius: 16, padding: 20, cursor: 'pointer', textAlign: 'center',
                  backdropFilter: 'blur(12px)', transition: 'transform 0.2s, border-color 0.2s',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{room.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#e2e8f0' }}>{room.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{room.exhibits.length} exhibits</div>
                  <div style={{
                    height: 3, borderRadius: 2, marginTop: 10, background: 'rgba(255,255,255,0.08)',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${(room.exhibits.filter((e) => viewedExhibits.has(e.id)).length / room.exhibits.length) * 100}%`,
                      background: room.color, transition: 'width 0.3s',
                    }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={() => setActiveRoom(null)} style={{
              padding: '8px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer',
            }}>
              ← Back to Gallery
            </button>
            <div style={{
              background: `linear-gradient(135deg, ${selectedRoom!.color}11, ${selectedRoom!.color}05)`,
              border: `1px solid ${selectedRoom!.color}33`, borderRadius: 16, padding: 20,
              marginBottom: 20, textAlign: 'center', backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>{selectedRoom!.icon}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: selectedRoom!.color }}>{selectedRoom!.name} Room</h2>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{selectedRoom!.exhibits.length} exhibits on display</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedRoom!.exhibits.map((exhibit) => (
                <div key={exhibit.id} onClick={() => markViewed(exhibit.id)} style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${viewedExhibits.has(exhibit.id) ? selectedRoom!.color + '44' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{exhibit.title}</h3>
                    <span style={{
                      fontSize: 10, padding: '3px 10px', borderRadius: 10,
                      background: rarityBg[exhibit.rarity], color: rarityColors[exhibit.rarity],
                      border: `1px solid ${rarityColors[exhibit.rarity]}44`, textTransform: 'uppercase', fontWeight: 700,
                    }}>
                      {exhibit.rarity === 'legendary' ? '⭐ ' : ''}{exhibit.rarity}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{exhibit.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>📅 {exhibit.year}</span>
                    <span style={{ fontSize: 11, color: selectedRoom!.color }}>💫 {exhibit.emotion}</span>
                  </div>
                  {viewedExhibits.has(exhibit.id) && (
                    <div style={{ marginTop: 8, fontSize: 10, color: '#34d399' }}>✓ Viewed</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-20px) translateX(10px); } }
      `}</style>
    </div>
  );
}
