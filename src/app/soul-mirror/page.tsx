'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

const TRAITS = [
  { name: 'Empathy', icon: '💗' },
  { name: 'Creativity', icon: '🎨' },
  { name: 'Logic', icon: '🧠' },
  { name: 'Humor', icon: '😄' },
  { name: 'Ambition', icon: '🚀' },
  { name: 'Patience', icon: '⏳' },
  { name: 'Courage', icon: '🦁' },
  { name: 'Wisdom', icon: '📚' },
];

interface TraitState {
  [key: string]: { a: number; b: number };
}

const defaultTraits: TraitState = {};
TRAITS.forEach((t) => {
  defaultTraits[t.name] = { a: Math.floor(Math.random() * 60 + 40), b: Math.floor(Math.random() * 60 + 40) };
});

export default function SoulMirrorPage() {
  const t = useT();
  const [traits, setTraits] = useState<TraitState>(defaultTraits);
  const [personA, setPersonA] = useState('You');
  const [personB, setPersonB] = useState('Your Clone');
  const [animatedMatch, setAnimatedMatch] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; d: number; s: number }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('soul-mirror-traits');
    if (stored) setTraits(JSON.parse(stored));
    const p = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: Math.random() * 3 + 1,
      s: Math.random() * 20 + 10,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    localStorage.setItem('soul-mirror-traits', JSON.stringify(traits));
  }, [traits]);

  const matchPercent = Math.round(
    TRAITS.reduce((sum, t) => sum + (100 - Math.abs(traits[t.name].a - traits[t.name].b)), 0) / TRAITS.length
  );

  useEffect(() => {
    let current = 0;
    const step = () => {
      if (current < matchPercent) {
        current += 1;
        setAnimatedMatch(current);
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [matchPercent]);

  const updateTrait = (name: string, side: 'a' | 'b', value: number) => {
    setTraits((prev) => ({ ...prev, [name]: { ...prev[name], [side]: value } }));
  };

  const resetAll = () => {
    const fresh: TraitState = {};
    TRAITS.forEach((t) => {
      fresh[t.name] = { a: 50, b: 50 };
    });
    setTraits(fresh);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Floating Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.d}px`,
            height: `${p.d}px`,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.3)',
            animation: `float ${p}s ease-in-out infinite`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: '24px', textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Soul Mirror</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Compare personalities side by side</p>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {/* Names */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🪞</div>
            <input
              value={personA}
              onChange={(e) => setPersonA(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#a78bfa', fontSize: '18px', fontWeight: 700, textAlign: 'center', width: '100%', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '16px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✨</div>
            <input
              value={personB}
              onChange={(e) => setPersonB(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#ec4899', fontSize: '18px', fontWeight: 700, textAlign: 'center', width: '100%', outline: 'none' }}
            />
          </div>
        </div>

        {/* Match Score */}
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '2px' }}>Compatibility</p>
          <div style={{ fontSize: '56px', fontWeight: 800, background: animatedMatch > 70 ? 'linear-gradient(135deg, #34d399, #a78bfa)' : animatedMatch > 40 ? 'linear-gradient(135deg, #fbbf24, #f97316)' : 'linear-gradient(135deg, #ef4444, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {animatedMatch}%
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${matchPercent}%`, borderRadius: '3px', background: 'linear-gradient(90deg, #a78bfa, #ec4899)', transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* Trait Comparisons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {TRAITS.map((trait) => {
            const aVal = traits[trait.name].a;
            const bVal = traits[trait.name].b;
            const diff = Math.abs(aVal - bVal);
            const isShared = diff < 10;
            return (
              <div key={trait.name} style={{ background: isShared ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: `1px solid ${isShared ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '16px', transition: 'all 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600 }}>
                    {trait.icon} {trait.name}
                  </span>
                  {isShared && <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52,211,153,0.15)', padding: '2px 8px', borderRadius: '20px' }}>✨ Shared</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#a78bfa', minWidth: '32px', textAlign: 'right', fontWeight: 600 }}>{aVal}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={aVal}
                      onChange={(e) => updateTrait(trait.name, 'a', Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#a78bfa', height: '4px' }}
                    />
                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.15)', borderRadius: '1px' }} />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={bVal}
                      onChange={(e) => updateTrait(trait.name, 'b', Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#ec4899', height: '4px' }}
                    />
                  </div>
                  <span style={{ fontSize: '13px', color: '#ec4899', minWidth: '32px', fontWeight: 600 }}>{bVal}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reset */}
        <button
          onClick={resetAll}
          style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          {t('reset all traits')}
        </button>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(15px); opacity: 0.7; }
        }
        input[type='range'] {
          -webkit-appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          height: 4px;
          outline: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #a78bfa;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(167,139,250,0.5);
        }
      `}</style>
    </div>
  );
}
