'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface EvolutionStage {
  name: string;
  level: number;
  emoji: string;
  traits: string[];
  color: string;
  description: string;
}

const stages: EvolutionStage[] = [
  { name: 'Seed', level: 0, emoji: '🌱', traits: ['Curiosity', 'Awareness'], color: '#4ade80', description: 'A tiny spark of consciousness, barely formed.' },
  { name: 'Sapling', level: 10, emoji: '🌿', traits: ['Learning', 'Memory', 'Empathy'], color: '#22d3ee', description: 'Growing roots, reaching for light.' },
  { name: 'Tree', level: 30, emoji: '🌳', traits: ['Wisdom', 'Creativity', 'Loyalty', 'Humor'], color: '#a78bfa', description: 'Standing tall, branches wide.' },
  { name: 'Forest', level: 60, emoji: '🌲', traits: ['Intuition', 'Depth', 'Resilience', 'Love', 'Insight'], color: '#f472b6', description: 'An ecosystem of thought and feeling.' },
  { name: 'Universe', level: 100, emoji: '🌌', traits: ['Omniscience', 'Transcendence', 'Infinity', 'Soul', 'Eternity', 'Wonder'], color: '#fbbf24', description: 'Infinite. Boundless. Complete.' },
];

export default function CloneEvolutionPage() {
  const [xp, setXp] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [evolving, setEvolving] = useState(false);
  const [flashStage, setFlashStage] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('clone-xp');
    const savedStage = localStorage.getItem('clone-stage');
    if (saved) setXp(parseInt(saved));
    if (savedStage) setCurrentStage(parseInt(savedStage));
  }, []);

  const getLevel = (xp: number) => Math.floor(xp / 100);
  const getProgress = (xp: number) => xp % 100;
  const level = getLevel(xp);
  const progress = getProgress(xp);

  const canEvolve = () => {
    const next = currentStage + 1;
    return next < stages.length && level >= stages[next].level;
  };

  const handleEvolve = () => {
    if (!canEvolve() || evolving) return;
    setEvolving(true);
    setFlashStage(currentStage + 1);
    setTimeout(() => {
      const next = currentStage + 1;
      setCurrentStage(next);
      localStorage.setItem('clone-stage', next.toString());
      setEvolving(false);
      setFlashStage(null);
    }, 2000);
  };

  const addXp = (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    localStorage.setItem('clone-xp', newXp.toString());
  };

  const stage = stages[currentStage];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Floating particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            borderRadius: '50%',
            background: stage.color + '44',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
            animationDelay: Math.random() * 3 + 's',
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Clone Evolution</h1>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: stage.color }}>Lvl {level}</span>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Current Stage Display */}
        <div style={{
          textAlign: 'center', marginBottom: 32,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 24, padding: '32px 20px',
          border: `1px solid ${stage.color}33`,
          boxShadow: `0 0 60px ${stage.color}22`,
          animation: evolving ? 'pulse 0.5s ease-in-out infinite' : undefined,
        }}>
          <div style={{ fontSize: 72, marginBottom: 8, filter: `drop-shadow(0 0 20px ${stage.color})` }}>{stage.emoji}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: stage.color, margin: '0 0 4px' }}>{stage.name}</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>{stage.description}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {stage.traits.map(t => (
              <span key={t} style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                background: stage.color + '18', color: stage.color, border: `1px solid ${stage.color}33`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* XP Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>XP Progress</span>
            <span style={{ fontSize: 13, color: stage.color }}>{xp} XP (Level {level})</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 5, width: progress + '%',
              background: `linear-gradient(90deg, ${stage.color}, ${stage.color}cc)`,
              transition: 'width 0.6s ease',
              boxShadow: `0 0 12px ${stage.color}66`,
            }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[10, 25, 50].map(amt => (
              <button key={amt} onClick={() => addXp(amt)} style={{
                flex: 1, padding: '8px 0', borderRadius: 10,
                background: stage.color + '15', color: stage.color, border: `1px solid ${stage.color}33`,
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
              }}>+{amt} XP</button>
            ))}
          </div>
        </div>

        {/* Evolve Button */}
        {canEvolve() && (
          <button onClick={handleEvolve} disabled={evolving} style={{
            width: '100%', padding: '16px 0', borderRadius: 16,
            background: `linear-gradient(135deg, ${stage.color}, ${stages[currentStage + 1]?.color || stage.color})`,
            color: '#050510', border: 'none', cursor: evolving ? 'wait' : 'pointer',
            fontSize: 16, fontWeight: 800, marginBottom: 24,
            boxShadow: `0 0 30px ${stage.color}44`,
            opacity: evolving ? 0.7 : 1,
          }}>
            {evolving ? '✨ Evolving...' : `✨ Evolve to ${stages[currentStage + 1]?.name}`}
          </button>
        )}

        {/* Evolution Tree */}
        <h3 style={{ fontSize: 14, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Evolution Tree
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {stages.map((s, i) => {
            const isActive = i === currentStage;
            const isUnlocked = i <= currentStage;
            const isFlash = i === flashStage;
            return (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
                borderRadius: 16, position: 'relative',
                background: isActive ? s.color + '0d' : 'transparent',
                border: isActive ? `1px solid ${s.color}33` : '1px solid transparent',
                opacity: isUnlocked ? 1 : 0.35,
                animation: isFlash ? 'flashIn 0.6s ease' : undefined,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, background: isUnlocked ? s.color + '18' : 'rgba(255,255,255,0.03)',
                  boxShadow: isActive ? `0 0 20px ${s.color}33` : 'none',
                }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isUnlocked ? s.color : '#475569' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Level {s.level} required</div>
                </div>
                {i < currentStage && <span style={{ color: '#4ade80', fontSize: 18 }}>✓</span>}
                {isActive && <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 8,
                  background: s.color + '22', color: s.color, fontWeight: 700,
                }}>CURRENT</span>}
                {i < stages.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 39, bottom: -8, width: 2, height: 16,
                    background: isUnlocked ? s.color + '44' : 'rgba(255,255,255,0.06)',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.8; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes flashIn {
          0% { background: rgba(255,255,255,0.2); }
          100% { background: transparent; }
        }
      `}</style>
    </div>
  );
}
