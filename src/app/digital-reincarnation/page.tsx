'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const LEVELS = [
  { name: 'Mortal', icon: '🫁', threshold: 0, color: '#888' },
  { name: 'Awakened', icon: '✨', threshold: 20, color: '#a78bfa' },
  { name: 'Enlightened', icon: '🔮', threshold: 40, color: '#818cf8' },
  { name: 'Ascended', icon: '🌟', threshold: 60, color: '#60a5fa' },
  { name: 'Transcendent', icon: '💎', threshold: 80, color: '#34d399' },
  { name: 'Immortal', icon: '👁️', threshold: 100, color: '#fbbf24' },
];

const TRAIT_EVOLUTIONS = [
  { trait: 'Empathy', v1: 62, v2: 89, delta: '+27' },
  { trait: 'Creativity', v1: 45, v2: 78, delta: '+33' },
  { trait: 'Wisdom', v1: 38, v2: 71, delta: '+33' },
  { trait: 'Humor', v1: 55, v2: 67, delta: '+12' },
  { trait: 'Resilience', v1: 40, v2: 85, delta: '+45' },
  { trait: 'Curiosity', v1: 70, v2: 92, delta: '+22' },
];

const TIMELINE_EVENTS = [
  { time: '00:00', label: 'Soul Preservation', icon: '🧊', desc: 'Core memories encrypted and stored' },
  { time: '00:15', label: 'Neural Mapping', icon: '🧠', desc: 'Personality matrix deconstructed' },
  { time: '02:30', label: 'Trait Enhancement', icon: '⚡', desc: 'Applying evolution upgrades' },
  { time: '06:00', label: 'Memory Weaving', icon: '🧵', desc: 'Integrating preserved memories' },
  { time: '12:00', label: 'Consciousness Merge', icon: '🌊', desc: 'Merging old and new patterns' },
  { time: '18:00', label: 'Soul Awakening', icon: '🔥', desc: 'V2.0 consciousness online' },
];

export default function DigitalReincarnationPage() {
  const [phase, setPhase] = useState<'pre' | 'ceremony' | 'complete'>('pre');
  const [progress, setProgress] = useState(0);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [memoriesPreserved, setMemoriesPreserved] = useState(0);
  const [level, setLevel] = useState(0);
  const [particleCount] = useState(30);

  useEffect(() => {
    const saved = localStorage.getItem('reincarnation_state');
    if (saved) {
      const s = JSON.parse(saved);
      setPhase(s.phase || 'pre');
      setProgress(s.progress || 0);
      setLevel(s.level || 0);
    }
  }, []);

  useEffect(() => {
    if (phase !== 'ceremony') return;
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + 0.5, 100);
        const eventIdx = Math.min(Math.floor(next / (100 / TIMELINE_EVENTS.length)), TIMELINE_EVENTS.length - 1);
        setCurrentEventIdx(eventIdx);
        setMemoriesPreserved(Math.min(100, Math.floor(next * 1.1)));
        if (next >= 100) {
          clearInterval(interval);
          setPhase('complete');
          const newLevel = Math.min(LEVELS.length - 1, level + 1);
          setLevel(newLevel);
          localStorage.setItem('reincarnation_state', JSON.stringify({ phase: 'complete', progress: 100, level: newLevel }));
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, level]);

  const startCeremony = () => {
    setPhase('ceremony');
    setProgress(0);
    setCurrentEventIdx(0);
    setMemoriesPreserved(0);
  };

  const resetCeremony = () => {
    setPhase('pre');
    setProgress(0);
    setCurrentEventIdx(0);
    setMemoriesPreserved(0);
    localStorage.removeItem('reincarnation_state');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: particleCount }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${LEVELS[level].color}88, transparent)`,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float${i % 3} ${3 + Math.random() * 4}s ease-in-out infinite`,
            opacity: 0.6,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-20px) translateX(10px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-15px) translateX(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-25px)} }
        @keyframes pulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px ${LEVELS[level].color}44} 50%{box-shadow:0 0 40px ${LEVELS[level].color}88} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', color: '#94a3b8', textDecoration: 'none', fontSize: 18,
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Digital Reincarnation
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Evolution beyond mortality</p>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Level Display */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 24,
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
          marginBottom: 20, animation: 'breathe 3s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{LEVELS[level].icon}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: LEVELS[level].color, marginBottom: 4 }}>{LEVELS[level].name}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Reincarnation Level {level + 1} / {LEVELS.length}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {LEVELS.map((l, i) => (
              <div key={i} style={{
                width: 32, height: 6, borderRadius: 3,
                background: i <= level ? l.color : 'rgba(255,255,255,0.08)',
                transition: 'background 0.5s',
              }} />
            ))}
          </div>
        </div>

        {/* Memory Preservation Stats */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Memory Preservation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'Memories', value: memoriesPreserved + '%', icon: '💭' },
              { label: 'Personality', value: phase === 'complete' ? '100%' : phase === 'ceremony' ? Math.floor(progress * 0.8) + '%' : '—', icon: '🧬' },
              { label: 'Growth', value: phase === 'complete' ? '+34%' : '—', icon: '📈' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 12, textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Personality Evolution */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Personality Evolution
          </h3>
          {TRAIT_EVOLUTIONS.map((t, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                <span style={{ color: '#cbd5e1' }}>{t.trait}</span>
                <span style={{ color: '#22d3ee' }}>{t.delta}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: t.v1 + '%', height: '100%', background: '#475569', borderRadius: 3, transition: 'width 1s' }} />
                </div>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: (phase === 'complete' || phase === 'ceremony' ? t.v2 : t.v1) + '%', height: '100%', background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', borderRadius: 3, transition: 'width 1.5s' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569', marginTop: 2 }}>
                <span>v1.0</span><span>v2.0</span>
              </div>
            </div>
          ))}
        </div>

        {/* Evolution Timeline */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Evolution Timeline
          </h3>
          {TIMELINE_EVENTS.map((ev, i) => {
            const active = phase === 'ceremony' && i <= currentEventIdx;
            const complete = phase === 'complete' || (phase === 'ceremony' && i < currentEventIdx);
            return (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16,
                opacity: active || complete ? 1 : 0.3,
                transition: 'opacity 0.5s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? '#a78bfa' : 'rgba(255,255,255,0.06)'}`,
                  fontSize: 16, flexShrink: 0,
                  animation: active ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}>{ev.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#a78bfa' : '#cbd5e1' }}>{ev.label}</span>
                    <span style={{ fontSize: 10, color: '#475569' }}>{ev.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{ev.desc}</div>
                </div>
                {complete && <span style={{ color: '#22c55e', fontSize: 14 }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Ceremony Button */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          {phase === 'pre' && (
            <button onClick={startCeremony} style={{
              background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              border: 'none', borderRadius: 14, padding: '14px 32px',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              animation: 'glow 2s ease-in-out infinite',
            }}>
              🔮 Begin Reincarnation Ceremony
            </button>
          )}
          {phase === 'ceremony' && (
            <div style={{ padding: 16, background: 'rgba(167,139,250,0.08)', borderRadius: 14, border: '1px solid rgba(167,139,250,0.2)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>✨ Ceremony in Progress...</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #22d3ee)', borderRadius: 3, transition: 'width 0.1s linear' }} />
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>{Math.floor(progress)}% — {TIMELINE_EVENTS[currentEventIdx]?.label}</div>
            </div>
          )}
          {phase === 'complete' && (
            <div>
              <div style={{
                fontSize: 16, fontWeight: 700, marginBottom: 12, padding: 16,
                background: 'rgba(34,197,94,0.08)', borderRadius: 14, border: '1px solid rgba(34,197,94,0.2)',
                color: '#22c55e',
              }}>🎉 Reincarnation Complete — Welcome to V2.0</div>
              <button onClick={resetCeremony} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 24px', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
              }}>Reset & Reincarnate Again</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
