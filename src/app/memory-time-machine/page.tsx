'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Memory {
  id: string;
  date: string;
  title: string;
  description: string;
  emotion: string;
  intensity: number;
  category: string;
}

const mockMemories: Memory[] = [
  { id: '1', date: '2024-01-15', title: 'First Snow of the Year', description: 'Watched the snowfall from the rooftop with hot cocoa. The city turned white in minutes.', emotion: 'Peaceful', intensity: 8, category: 'Nature' },
  { id: '2', date: '2024-03-22', title: 'Concert Night', description: 'Live jazz downtown. The saxophone solo gave me chills.', emotion: 'Excited', intensity: 9, category: 'Music' },
  { id: '3', date: '2023-07-04', title: 'Beach Sunset', description: 'Golden hour at the coast. Waves crashing, sand between toes.', emotion: 'Serene', intensity: 7, category: 'Travel' },
  { id: '4', date: '2023-12-25', title: 'Family Gathering', description: 'Everyone together for the holidays. Laughter echoing through the house.', emotion: 'Joyful', intensity: 10, category: 'Family' },
  { id: '5', date: '2024-06-10', title: 'Mountain Hike', description: 'Reached the summit at dawn. The world below was breathtaking.', emotion: 'Triumphant', intensity: 9, category: 'Adventure' },
  { id: '6', date: '2023-09-14', title: 'New Job Offer', description: 'The call came in. Months of effort finally paid off.', emotion: 'Proud', intensity: 10, category: 'Career' },
  { id: '7', date: '2024-02-14', title: 'Valentine\'s Dinner', description: 'Candlelit dinner at that little Italian place. Perfect evening.', emotion: 'Loved', intensity: 8, category: 'Love' },
  { id: '8', date: '2023-11-30', title: 'Finished My Novel', description: 'Typed the last sentence at 3 AM. Tears of accomplishment.', emotion: 'Fulfilled', intensity: 9, category: 'Creative' },
  { id: '9', date: '2024-08-20', title: 'Stargazing Night', description: 'Laid on the grass counting shooting stars. Made a wish on each one.', emotion: 'Wonder', intensity: 7, category: 'Nature' },
  { id: '10', date: '2023-05-01', title: 'First Solo Trip', description: 'Boarded the plane alone. Terrified and thrilled at the same time.', emotion: 'Brave', intensity: 8, category: 'Travel' },
];

const emotionColors: Record<string, string> = {
  Peaceful: '#6ec6ff',
  Excited: '#ff9800',
  Serene: '#81c784',
  Joyful: '#ffd54f',
  Triumphant: '#e040fb',
  Proud: '#7c4dff',
  Loved: '#ff5252',
  Fulfilled: '#4db6ac',
  Wonder: '#b388ff',
  Brave: '#ff7043',
};

export default function MemoryTimeMachine() {
  const t = useT();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTraveling, setIsTraveling] = useState(false);
  const [foundMemories, setFoundMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; speed: number }>>([]);
  const [travelYear, setTravelYear] = useState(2024);
  const [travelMonth, setTravelMonth] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    const pts = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.1,
    }));
    setParticles(pts);
  }, []);

  const handleTimeTravel = () => {
    if (!selectedDate) return;
    setIsTraveling(true);
    setShowTimeline(false);
    setTimeout(() => {
      const filtered = mockMemories.filter((m) => {
        const matchDate = !selectedDate || m.date === selectedDate || m.date.startsWith(selectedDate.slice(0, 7));
        const matchSearch = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchDate && matchSearch;
      });
      setFoundMemories(filtered);
      setIsTraveling(false);
    }, 2000);
  };

  const jumpToYear = (year: number) => {
    setTravelYear(year);
    const filtered = mockMemories.filter((m) => m.date.startsWith(year.toString()));
    setFoundMemories(filtered);
    setShowTimeline(true);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(139,92,246,0.8), rgba(59,130,246,0.3))`,
            animation: `float ${10 + p.speed * 20}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* Sticky Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ⏳ {t('time machine')}
        </h1>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Time Travel Controls */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 16, padding: 24, marginBottom: 24,
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#c4b5fd' }}>{t('travel back')}</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#e2e8f0', fontSize: 15, outline: 'none', marginBottom: 12,
            }}
          />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#e2e8f0', fontSize: 15, outline: 'none', marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleTimeTravel}
            disabled={!selectedDate || isTraveling}
            style={{
              width: '100%', padding: '14px', borderRadius: 10,
              background: isTraveling ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: isTraveling ? 'wait' : 'pointer', transition: 'all 0.3s',
            }}
          >
            {isTraveling ? `🌀 ${t('relive')}` : `⚡ ${t('travel back')}`}
          </button>
        </div>

        {/* Time Travel Animation */}
        {isTraveling && (
          <div style={{
            textAlign: 'center', padding: 40, marginBottom: 24,
            background: 'rgba(139,92,246,0.08)', borderRadius: 16,
            border: '1px solid rgba(139,92,246,0.2)',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌀</div>
            <p style={{ color: '#c4b5fd', fontSize: 14 }}>Warping through the fabric of time...</p>
            <div style={{
              height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', marginTop: 16, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '60%', borderRadius: 2,
                background: 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                animation: 'loading 2s ease-in-out infinite',
              }} />
            </div>
          </div>
        )}

        {/* Year Timeline */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 16, padding: 20, marginBottom: 24,
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#93c5fd' }}>📅 {t('year')}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {years.map((y) => (
              <button key={y} onClick={() => jumpToYear(y)} style={{
                padding: '8px 16px', borderRadius: 8,
                background: travelYear === y && showTimeline ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
                border: travelYear === y && showTimeline ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>
                {y}
              </button>
            ))}
          </div>
          {showTimeline && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {months.map((m, i) => (
                <button key={m} onClick={() => {
                  const dateStr = `${travelYear}-${String(i + 1).padStart(2, '0')}`;
                  setSelectedDate(dateStr + '-01');
                  const filtered = mockMemories.filter((mem) => mem.date.startsWith(dateStr));
                  setFoundMemories(filtered);
                }} style={{
                  padding: '6px 10px', borderRadius: 6, fontSize: 11,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer',
                }}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Found Memories */}
        {foundMemories.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#a78bfa' }}>
              ✨ {foundMemories.length} memor{foundMemories.length === 1 ? 'y' : 'ies'} found
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {foundMemories.map((mem) => (
                <div key={mem.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.15)',
                  borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)',
                  transition: 'transform 0.2s, border-color 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{mem.date}</span>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 20,
                      background: `${emotionColors[mem.emotion] || '#7c3aed'}22`,
                      color: emotionColors[mem.emotion] || '#a78bfa',
                      border: `1px solid ${emotionColors[mem.emotion] || '#7c3aed'}44`,
                    }}>
                      {mem.emotion}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#e2e8f0' }}>{mem.title}</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{mem.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>Intensity</span>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{
                        height: '100%', borderRadius: 2, width: `${mem.intensity * 10}%`,
                        background: `linear-gradient(90deg, ${emotionColors[mem.emotion] || '#7c3aed'}, #60a5fa)`,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{mem.intensity}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {foundMemories.length === 0 && !isTraveling && selectedDate && (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌑</div>
            <p>No memories found for this date. Try another destination.</p>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-30px) translateX(15px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
      `}</style>
    </div>
  );
}
