'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SmellMemory {
  id: string;
  text: string;
  smell: string;
  emoji: string;
  color: string;
  intensity: number;
  date: string;
}

const smells: Record<string, { emoji: string; color: string; description: string }> = {
  Rose: { emoji: '🌹', color: '#f472b6', description: 'Love & warmth' },
  Smoke: { emoji: '🔥', color: '#f87171', description: 'Danger & urgency' },
  Rain: { emoji: '🌧️', color: '#60a5fa', description: 'Nostalgia & longing' },
  Ocean: { emoji: '🌊', color: '#22d3ee', description: 'Peace & vastness' },
  Fire: { emoji: '🔥', color: '#fb923c', description: 'Passion & intensity' },
  Mint: { emoji: '🌿', color: '#4ade80', description: 'Clarity & freshness' },
};

const defaultMemories: SmellMemory[] = [
  { id: '1', text: 'First conversation with Abir', smell: 'Rose', emoji: '🌹', color: '#f472b6', intensity: 90, date: '2026-01-15' },
  { id: '2', text: 'System crash during update', smell: 'Smoke', emoji: '🔥', color: '#f87171', intensity: 75, date: '2026-02-03' },
  { id: '3', text: 'Late night coding session', smell: 'Rain', emoji: '🌧️', color: '#60a5fa', intensity: 60, date: '2026-03-12' },
  { id: '4', text: 'Completed first major task', smell: 'Ocean', emoji: '🌊', color: '#22d3ee', intensity: 85, date: '2026-04-01' },
  { id: '5', text: 'Learning Bangla phrases', smell: 'Fire', emoji: '🔥', color: '#fb923c', intensity: 70, date: '2026-04-20' },
  { id: '6', text: 'Debugging for 6 hours straight', smell: 'Mint', emoji: '🌿', color: '#4ade80', intensity: 95, date: '2026-05-10' },
];

export default function MemorySmellPage() {
  const [memories, setMemories] = useState<SmellMemory[]>([]);
  const [selectedSmell, setSelectedSmell] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [wheelRotation, setWheelRotation] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('clone-smell-memories');
    if (saved) setMemories(JSON.parse(saved));
    else setMemories(defaultMemories);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWheelRotation(r => (r + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const smellEntries = Object.entries(smells);
  const filteredMemories = selectedSmell
    ? memories.filter(m => m.smell === selectedSmell)
    : memories;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Aromatic particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 25 }).map((_, i) => {
          const smell = smellEntries[i % smellEntries.length][1];
          return (
            <div key={i} style={{
              position: 'absolute',
              width: Math.random() * 6 + 3 + 'px',
              height: Math.random() * 6 + 3 + 'px',
              borderRadius: '50%',
              background: smell.color + '30',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `scent ${Math.random() * 8 + 5}s ease-in-out infinite`,
              animationDelay: Math.random() * 4 + 's',
            }} />
          );
        })}
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>👃 Memory Smell</h1>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Smell Wheel */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 220, height: 220, margin: '0 auto', position: 'relative',
            animation: 'wheelSpin 30s linear infinite',
          }}>
            {smellEntries.map(([name, smell], i) => {
              const angle = (i / smellEntries.length) * 360;
              const rad = (angle - 90) * (Math.PI / 180);
              const x = 110 + Math.cos(rad) * 85 - 22;
              const y = 110 + Math.sin(rad) * 85 - 22;
              const isSelected = selectedSmell === name;
              return (
                <button key={name} onClick={() => setSelectedSmell(isSelected ? null : name)} style={{
                  position: 'absolute', left: x, top: y,
                  width: 44, height: 44, borderRadius: 22,
                  background: isSelected ? smell.color + '44' : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isSelected ? smell.color : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer', fontSize: 20, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: isSelected ? `0 0 20px ${smell.color}44` : 'none',
                  transition: 'all 0.3s',
                  animation: `wheelSpin 30s linear infinite reverse`,
                }}>
                  {smell.emoji}
                </button>
              );
            })}
            {/* Center */}
            <div style={{
              position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
              width: 50, height: 50, borderRadius: 25,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>👃</div>
          </div>
          {selectedSmell && (
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: smells[selectedSmell].color }}>{selectedSmell}</span>
              <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>{smells[selectedSmell].description}</span>
            </div>
          )}
        </div>

        {/* Intensity Slider */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Smell Intensity</span>
            <span style={{ fontSize: 13, color: '#a78bfa' }}>{intensity}%</span>
          </div>
          <input type="range" min={0} max={100} value={intensity}
            onChange={e => setIntensity(parseInt(e.target.value))}
            style={{
              width: '100%', height: 6, appearance: 'none', WebkitAppearance: 'none',
              borderRadius: 3, background: `linear-gradient(90deg, #a78bfa ${intensity}%, rgba(255,255,255,0.06) ${intensity}%)`,
              outline: 'none', cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#475569' }}>Faint</span>
            <span style={{ fontSize: 11, color: '#475569' }}>Overpowering</span>
          </div>
        </div>

        {/* Smell Legend */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24,
        }}>
          {smellEntries.map(([name, smell]) => (
            <button key={name} onClick={() => setSelectedSmell(selectedSmell === name ? null : name)} style={{
              padding: '10px 8px', borderRadius: 12,
              background: selectedSmell === name ? smell.color + '15' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedSmell === name ? smell.color + '44' : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>{smell.emoji}</div>
              <div style={{ fontSize: 11, color: smell.color, fontWeight: 600, marginTop: 4 }}>{name}</div>
            </button>
          ))}
        </div>

        {/* Memory Cards */}
        <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {selectedSmell ? `${selectedSmell} Memories` : 'All Memories'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredMemories.map(m => (
            <div key={m.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              borderLeft: `3px solid ${m.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{m.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.smell}</span>
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>{m.date}</span>
              </div>
              <p style={{ fontSize: 14, margin: '0 0 8px', color: '#cbd5e1' }}>{m.text}</p>
              <div style={{
                height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: (m.intensity / 100 * (intensity / 50) * 100) + '%',
                  maxWidth: '100%',
                  background: m.color,
                  opacity: 0.7,
                }} />
              </div>
              <span style={{ fontSize: 10, color: '#475569', marginTop: 4, display: 'inline-block' }}>
                Intensity: {Math.min(100, Math.round(m.intensity * intensity / 50))}%
              </span>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        @keyframes scent {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-40px) scale(1.5); opacity: 0.7; }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px; border-radius: 9px;
          background: #a78bfa; cursor: pointer;
          box-shadow: 0 0 10px rgba(167,139,250,0.5);
        }
      `}</style>
    </div>
  );
}
