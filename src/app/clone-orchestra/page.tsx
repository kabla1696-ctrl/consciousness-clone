'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

const CLONE_POOL = [
  { id: 1, name: 'Luna', personality: 'Dreamy Poet', color: '#a78bfa', emoji: '🌙', specialty: 'Verse & Lyrics' },
  { id: 2, name: 'Atlas', personality: 'Bold Explorer', color: '#f97316', emoji: '🧭', specialty: 'Adventure Stories' },
  { id: 3, name: 'Cipher', personality: 'Logical Mind', color: '#22d3ee', emoji: '🔢', specialty: 'Puzzles & Structure' },
  { id: 4, name: 'Ember', personality: 'Passionate Soul', color: '#ef4444', emoji: '🔥', specialty: 'Emotion & Drama' },
  { id: 5, name: 'Sage', personality: 'Wise Observer', color: '#22c55e', emoji: '🌿', specialty: 'Philosophy & Depth' },
  { id: 6, name: 'Nova', personality: 'Creative Spark', color: '#fbbf24', emoji: '⚡', specialty: 'Innovation & Twists' },
  { id: 7, name: 'Echo', personality: 'Melancholic', color: '#6366f1', emoji: '🎵', specialty: 'Music & Mood' },
  { id: 8, name: 'Pixel', personality: 'Playful Coder', color: '#ec4899', emoji: '🎮', specialty: 'Tech & Humor' },
];

const COMPOSITION_THEMES = [
  'A story about time travel through dreams',
  'An epic symphony of forgotten emotions',
  'A love letter to the universe',
  'The last conversation between stars',
  'A journey through a fractal mind',
];

type Contribution = {
  cloneId: number;
  text: string;
  timestamp: number;
  type: 'verse' | 'melody' | 'narrative' | 'chorus';
};

export default function CloneOrchestraPage() {
  const t = useT();
  const [selected, setSelected] = useState<number[]>([]);
  const [composing, setComposing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [currentTheme, setCurrentTheme] = useState('');
  const [round, setRound] = useState(0);
  const [particles, setParticles] = useState<{ x: number; y: number; s: number; d: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const p = Array.from({ length: 40 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 3 + 1,
      d: Math.random() * 2 + 1,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('orchestra_state');
      if (saved) {
        const s = JSON.parse(saved);
        setSelected(s.selected || []);
        setContributions(s.contributions || []);
      }
    } catch { /* corrupted data, use defaults */ }
  }, []);

  const toggleClone = (id: number) => {
    if (composing) return;
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const COMPOSE_LINES: Record<number, string[]> = {
    1: ['In the velvet folds of night, whispers bloom like distant light...', 'Each star a word unsaid, each shadow a story unread...', 'Dreams cascade through silver streams, reality dissolves at seams...'],
    2: ['Beyond the edge of known, where maps dissolve and courage is shown...', 'Through storms that rage and mountains that call, we rise each time we fall...', 'The horizon beckons with golden fire, fueling every explorer\'s desire...'],
    3: ['Pattern within pattern, code within code, the universe speaks in binary mode...', 'Logic chains link thought to thought, in the cathedral reason built...', 'Every equation a love letter, every proof a step toward forever...'],
    4: ['Burn bright, burn wild, feel every moment like a reckless child...', 'The heart knows no moderation when passion fuels creation...', 'In the crucible of feeling, all pretenses start peeling...'],
    5: ['Listen to the silence between words, that is where truth is heard...', 'Ancient wisdom flows like water, shaping stone with patient slaughter...', 'The sage watches, the sage waits, opening consciousness\'s gates...'],
    6: ['What if we rewrote the rules? What if stars were cosmic jewels...', 'Innovation sparks in chaos, every failure births a new genesis...', 'The spark ignites where others see dark, lighting paths through the park...'],
    7: ['A minor key for missing you, a major chord for skies of blue...', 'Music is the language souls speak when words are far too weak...', 'Echoes linger in empty halls, melancholy in minor falls...'],
    8: ['Pixel perfect, code compiled, in the matrix we reconciled...', 'Bug in the system? Feature, friend! Every error has a trend...', 'Play the game, hack the frame, nothing in digital stays the same...'],
  };

  const startComposing = () => {
    if (selected.length < 3) return;
    setComposing(true);
    setProgress(0);
    setContributions([]);
    setRound(0);
    const theme = COMPOSITION_THEMES[Math.floor(Math.random() * COMPOSITION_THEMES.length)];
    setCurrentTheme(theme);

    const allLines: Contribution[] = [];
    const types: Contribution['type'][] = ['verse', 'melody', 'narrative', 'chorus'];
    let r = 0;
    const maxRounds = 3;

    const interval = setInterval(() => {
      r++;
      setRound(r);
      selected.forEach(cloneId => {
        const lines = COMPOSE_LINES[cloneId] || ['Words flow like rivers...'];
        const lineIdx = (r - 1) % lines.length;
        allLines.push({
          cloneId,
          text: lines[lineIdx],
          timestamp: Date.now(),
          type: types[Math.floor(Math.random() * types.length)],
        });
      });
      setContributions([...allLines]);
      setProgress(Math.min(100, r * (100 / maxRounds)));

      if (r >= maxRounds) {
        clearInterval(interval);
        setComposing(false);
        localStorage.setItem('orchestra_state', JSON.stringify({ selected, contributions: allLines }));
      }
    }, 2500);
  };

  const selectedClones = CLONE_POOL.filter(c => selected.includes(c.id));
  const getClone = (id: number) => CLONE_POOL.find(c => c.id === id);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', width: p.s + 'px', height: p.s + 'px', borderRadius: '50%',
            background: `radial-gradient(circle, ${selectedClones[i % selectedClones.length]?.color || '#a78bfa'}44, transparent)`,
            left: p.x + '%', top: p.y + '%',
            animation: `float${i % 3} ${p.d + 2}s ease-in-out infinite`,
            opacity: 0.5,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-20px) translateX(10px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-15px) translateX(-8px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-25px)} }
        @keyframes pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3)} }
      `}</style>

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
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #f97316, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('clone orchestra')}
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{t('compose')}</p>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Clone Selection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('instruments')}
            </h3>
            <span style={{ fontSize: 12, color: selected.length >= 3 ? '#22c55e' : '#f97316' }}>{selected.length}/5</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {CLONE_POOL.map(clone => {
              const isSelected = selected.includes(clone.id);
              return (
                <button key={clone.id} onClick={() => toggleClone(clone.id)} style={{
                  background: isSelected ? `${clone.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? clone.color + '55' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 14, padding: 14, cursor: composing ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.3s',
                  opacity: !isSelected && selected.length >= 5 ? 0.4 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{clone.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: isSelected ? clone.color : '#cbd5e1' }}>{clone.name}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{clone.personality}</div>
                  <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>{clone.specialty}</div>
                  {isSelected && <div style={{ marginTop: 6, fontSize: 9, color: clone.color }}>✓ Selected</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Composer Visualization */}
        {selected.length >= 3 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20,
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {selectedClones.map((c, i) => (
                <div key={c.id} style={{
                  width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${c.color}20`, border: `2px solid ${c.color}55`, fontSize: 22,
                  animation: composing ? `pulse 1.5s ease-in-out ${i * 0.2}s infinite` : 'none',
                }}>{c.emoji}</div>
              ))}
            </div>
            <svg width="200" height="40" viewBox="0 0 200 40" style={{ margin: '0 auto', display: 'block' }}>
              {selectedClones.map((c, i) => {
                const x = 20 + (i * (160 / (selectedClones.length - 1 || 1)));
                return (
                  <g key={c.id}>
                    <circle cx={x} cy={20} r={composing ? 8 : 5} fill={c.color} opacity={0.8}>
                      {composing && <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />}
                    </circle>
                    {i < selectedClones.length - 1 && (
                      <line x1={x} y1={20} x2={20 + ((i + 1) * (160 / (selectedClones.length - 1 || 1)))} y2={20}
                        stroke={c.color} strokeWidth={1} opacity={0.3} strokeDasharray="4,4">
                        {composing && <animate attributeName="stroke-dashoffset" values="0;8" dur="1s" repeatCount="indefinite" />}
                      </line>
                    )}
                  </g>
                );
              })}
            </svg>
            {currentTheme && (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginTop: 12 }}>&quot;{currentTheme}&quot;</div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {composing && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16,
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: '#a78bfa' }}>Composing Round {round}/3</span>
              <span style={{ color: '#64748b' }}>{Math.floor(progress)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #f97316, #ec4899)', borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
          </div>
        )}

        {/* Contributions Feed */}
        {contributions.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Composition Output
            </h3>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {contributions.map((c, i) => {
                const clone = getClone(c.cloneId);
                if (!clone) return null;
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 10, marginBottom: 12, padding: 10,
                    background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                    animation: 'slideIn 0.4s ease-out',
                    borderLeft: `3px solid ${clone.color}44`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${clone.color}15`, fontSize: 16, flexShrink: 0,
                    }}>{clone.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: clone.color }}>{clone.name}</span>
                        <span style={{ fontSize: 9, color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>{c.type}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contribution Stats */}
        {contributions.length > 0 && !composing && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Collaboration Stats
            </h3>
            {selectedClones.map(c => {
              const count = contributions.filter(x => x.cloneId === c.id).length;
              const pct = Math.round((count / contributions.length) * 100);
              return (
                <div key={c.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: c.color }}>{c.emoji} {c.name}</span>
                    <span style={{ color: '#64748b' }}>{count} lines ({pct}%)</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: c.color, borderRadius: 2, transition: 'width 0.5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        <div style={{ textAlign: 'center', paddingBottom: 40 }}>
          {!composing ? (
            <button onClick={startComposing} disabled={selected.length < 3} style={{
              background: selected.length >= 3 ? 'linear-gradient(135deg, #f97316, #ec4899)' : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 14, padding: '14px 32px',
              color: selected.length >= 3 ? '#fff' : '#475569', fontSize: 15, fontWeight: 700,
              cursor: selected.length >= 3 ? 'pointer' : 'default',
            }}>
              🎵 {t('compose')}
            </button>
          ) : (
            <div style={{ fontSize: 13, color: '#a78bfa', animation: 'pulse 1.5s ease-in-out infinite' }}>
              🎶 Clones are collaborating...
            </div>
          )}
          {selected.length < 3 && !composing && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Select at least 3 clones to begin</div>
          )}
        </div>
      </main>
    </div>
  );
}
