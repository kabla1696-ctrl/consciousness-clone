'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface GhostMemory {
  id: number;
  text: string;
  age: string;
  timestamp: string;
  emotion: string;
  dismissed: boolean;
}

const GHOST_POOL: Omit<GhostMemory, 'id' | 'timestamp' | 'dismissed'>[] = [
  { text: 'You were laughing so hard that day, tears streaming down your face.', age: '3 years ago', emotion: 'joy' },
  { text: 'The sunset you watched alone from the rooftop, feeling infinite.', age: '5 years ago', emotion: 'peace' },
  { text: 'A conversation with someone you\'ll never see again.', age: '2 years ago', emotion: 'loss' },
  { text: 'The smell of rain on asphalt, walking home from school.', age: '10 years ago', emotion: 'nostalgia' },
  { text: 'That song you played on repeat for a whole month.', age: '4 years ago', emotion: 'melancholy' },
  { text: 'The first time you realized you were truly alone.', age: '7 years ago', emotion: 'solitude' },
  { text: 'A dream you had that felt more real than waking life.', age: '1 year ago', emotion: 'wonder' },
  { text: 'The warmth of a hand you held for the last time.', age: '6 years ago', emotion: 'love' },
];

const emotionColors: Record<string, string> = {
  joy: '#ffd700', peace: '#88ccaa', loss: '#ff6b6b', nostalgia: '#dda0dd',
  melancholy: '#7b9ec8', solitude: '#888', wonder: '#b39ddb', love: '#ff8a80',
};

export default function MemoryGhostPage() {
  const t = useT();
  const [ghosts, setGhosts] = useState<GhostMemory[]>([]);
  const [frequency, setFrequency] = useState(30);
  const [history, setHistory] = useState<string[]>([]);
  const [particles, setParticles] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
  const ghostId = useRef(0);

  useEffect(() => {
    const savedFreq = localStorage.getItem('ghostFrequency');
    if (savedFreq) setFrequency(parseInt(savedFreq));
    const savedHistory = localStorage.getItem('hauntingHistory');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const ps = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(ps);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = GHOST_POOL[Math.floor(Math.random() * GHOST_POOL.length)];
      const newGhost: GhostMemory = {
        ...template,
        id: ghostId.current++,
        timestamp: new Date().toLocaleTimeString(),
        dismissed: false,
      };
      setGhosts((prev) => [newGhost, ...prev].slice(0, 10));
      setHistory((prev) => {
        const updated = [`[${newGhost.timestamp}] ${newGhost.text}`, ...prev].slice(0, 50);
        localStorage.setItem('hauntingHistory', JSON.stringify(updated));
        return updated;
      });
    }, frequency * 1000);
    return () => clearInterval(interval);
  }, [frequency]);

  const dismissGhost = (id: number) => {
    setGhosts((prev) => prev.map((g) => g.id === id ? { ...g, dismissed: true } : g));
    setTimeout(() => setGhosts((prev) => prev.filter((g) => g.id !== id)), 600);
  };

  const updateFrequency = (val: number) => {
    setFrequency(val);
    localStorage.setItem('ghostFrequency', val.toString());
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#c8c8e0', fontFamily: 'system-ui' }}>
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {particles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: 'rgba(180,180,255,0.15)', animation: `float ${6 + p.delay}s ease-in-out infinite ${p.delay}s` }} />
        ))}
      </div>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#8888cc', textDecoration: 'none', fontSize: 18 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, background: 'linear-gradient(135deg, #b39ddb, #7c4dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('memory ghost')}</h1>
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 60, padding: '60px 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Ghost frequency */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, backdropFilter: 'blur(20px)', marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>{t('haunted')}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="range" min={5} max={120} value={frequency} onChange={(e) => updateFrequency(parseInt(e.target.value))} style={{ flex: 1, accentColor: '#b39ddb' }} />
            <span style={{ fontSize: 13, color: '#b39ddb', minWidth: 50, textAlign: 'right' }}>{frequency}s</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#555' }}>How often memories appear as ghosts</p>
        </div>

        {/* Active ghosts */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>{t('forgotten')}</p>
          {ghosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#444', fontSize: 14 }}>
              <p style={{ fontSize: 32, margin: '0 0 8px' }}>👻</p>
              <p style={{ margin: 0 }}>Waiting for memories to appear...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ghosts.map((ghost) => (
                <div key={ghost.id} onClick={() => dismissGhost(ghost.id)} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14,
                  padding: 16, backdropFilter: 'blur(12px)', cursor: 'pointer',
                  opacity: ghost.dismissed ? 0 : 1, transform: ghost.dismissed ? 'translateX(50px)' : 'none',
                  transition: 'all 0.6s ease', animation: 'ghostAppear 0.8s ease',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: emotionColors[ghost.emotion] || '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{ghost.emotion}</span>
                    <span style={{ fontSize: 11, color: '#555' }}>{ghost.age}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', opacity: 0.85 }}>&ldquo;{ghost.text}&rdquo;</p>
                  <p style={{ margin: '8px 0 0', fontSize: 10, color: '#444' }}>Appeared at {ghost.timestamp} · Tap to dismiss</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Haunting history */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, backdropFilter: 'blur(20px)' }}>
          <p style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>{t('resurface')}</p>
          {history.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#444', textAlign: 'center', padding: 16 }}>No hauntings recorded yet</p>
          ) : (
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {history.map((h, i) => (
                <p key={i} style={{ margin: '0 0 8px', fontSize: 12, color: '#666', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: 8 }}>{h}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(10px); } }
        @keyframes ghostAppear { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
