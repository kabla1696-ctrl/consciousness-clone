'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Pet {
  type: 'dog' | 'cat' | 'rabbit';
  name: string;
  mood: number;
  hunger: number;
  happiness: number;
  energy: number;
  lastFed: number;
  lastPlayed: number;
  lastPetted: number;
}

const PET_EMOJIS: Record<string, Record<string, string>> = {
  dog: { happy: '🐕', sad: '🐶', sleeping: '🐕‍🦺', eating: '🦴', playing: '🎾' },
  cat: { happy: '😺', sad: '😿', sleeping: '😴', eating: '🐟', playing: '🧶' },
  rabbit: { happy: '🐰', sad: '🐇', sleeping: '💤', eating: '🥕', playing: '🌸' },
};

const PET_COLORS: Record<string, string> = {
  dog: '#fbbf24',
  cat: '#a78bfa',
  rabbit: '#f472b6',
};

function getDefaultPet(type: 'dog' | 'cat' | 'rabbit'): Pet {
  return {
    type,
    name: type === 'dog' ? 'Buddy' : type === 'cat' ? 'Whiskers' : 'Cotton',
    mood: 70, hunger: 60, happiness: 75, energy: 80,
    lastFed: Date.now(), lastPlayed: Date.now(), lastPetted: Date.now(),
  };
}

export default function CloneTherapyDog() {
  const t = useT();
  const [pet, setPet] = useState<Pet | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [heartParticles, setHeartParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bounce, setBounce] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('therapy-pet');
      if (stored) {
        const parsed = JSON.parse(stored) as Pet;
        const elapsed = Date.now() - Math.max(parsed.lastFed, parsed.lastPlayed, parsed.lastPetted);
        const decay = Math.min(elapsed / 60000, 30);
        parsed.hunger = Math.max(0, parsed.hunger - decay * 0.5);
        parsed.happiness = Math.max(0, parsed.happiness - decay * 0.3);
        parsed.energy = Math.min(100, parsed.energy + decay * 0.2);
        setPet(parsed);
      }
    } catch { /* corrupted data, use defaults */ }
  }, []);

  useEffect(() => {
    if (pet) localStorage.setItem('therapy-pet', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPet((p) => {
        if (!p) return p;
        return {
          ...p,
          hunger: Math.max(0, p.hunger - 0.1),
          happiness: Math.max(0, p.happiness - 0.05),
          energy: Math.min(100, p.energy + 0.02),
          mood: Math.round((p.hunger + p.happiness + p.energy) / 3),
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const doAction = (act: string) => {
    if (!pet) return;
    setAction(act);
    setBounce(true);

    if (act === 'pet') {
      setPet((p) => p ? { ...p, happiness: Math.min(100, p.happiness + 15), mood: Math.min(100, p.mood + 10), lastPetted: Date.now() } : p);
      spawnHearts();
    } else if (act === 'feed') {
      setPet((p) => p ? { ...p, hunger: Math.min(100, p.hunger + 30), happiness: Math.min(100, p.happiness + 5), lastFed: Date.now() } : p);
    } else if (act === 'play') {
      setPet((p) => p ? { ...p, happiness: Math.min(100, p.happiness + 20), energy: Math.max(0, p.energy - 15), lastPlayed: Date.now(), mood: Math.min(100, p.mood + 12) } : p);
    } else if (act === 'sleep') {
      setPet((p) => p ? { ...p, energy: Math.min(100, p.energy + 40), hunger: Math.max(0, p.hunger - 10) } : p);
    }

    if (animRef.current) clearTimeout(animRef.current);
    animRef.current = setTimeout(() => { setAction(null); setBounce(false); }, 1500);
  };

  const spawnHearts = () => {
    const hearts = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 30 + Math.random() * 10,
    }));
    setHeartParticles(hearts);
    setTimeout(() => setHeartParticles([]), 2000);
  };

  const selectPetType = (type: 'dog' | 'cat' | 'rabbit') => {
    setPet(getDefaultPet(type));
    setShowPicker(false);
  };

  const getFace = () => {
    if (!pet) return '❓';
    if (action === 'eating') return PET_EMOJIS[pet.type].eating;
    if (action === 'sleeping' || pet.energy < 20) return PET_EMOJIS[pet.type].sleeping;
    if (action === 'playing') return PET_EMOJIS[pet.type].playing;
    if (pet.mood > 60) return PET_EMOJIS[pet.type].happy;
    return PET_EMOJIS[pet.type].sad;
  };

  const getMoodText = () => {
    if (!pet) return '';
    if (pet.mood > 80) return `${t('comfort')}! 💕`;
    if (pet.mood > 60) return `${t('comfort')} 😊`;
    if (pet.mood > 40) return `${t('comfort')} 💭`;
    if (pet.mood > 20) return `${t('comfort')}... 🥺`;
    return `${t('comfort')} 😢`;
  };

  if (!pet || showPicker) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050510', color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(5, 5, 16, 0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(244, 114, 182, 0.15)', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <Link href="/dashboard" style={{ color: '#f472b6', fontSize: 22, textDecoration: 'none' }}>←</Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #f472b6, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🐾 {t('therapy dog')}
          </h1>
        </div>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t('virtual pet')}</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>{t('comfort')}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {(['dog', 'cat', 'rabbit'] as const).map((type) => (
              <button
                key={type}
                onClick={() => selectPetType(type)}
                style={{
                  width: 120, padding: '28px 16px', borderRadius: 20,
                  border: `1px solid ${PET_COLORS[type]}44`,
                  background: `rgba(${type === 'dog' ? '251,191,36' : type === 'cat' ? '167,139,250' : '244,114,182'},0.08)`,
                  cursor: 'pointer', backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{ fontSize: 48, marginBottom: 10 }}>
                  {type === 'dog' ? '🐕' : type === 'cat' ? '😺' : '🐰'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: PET_COLORS[type], textTransform: 'capitalize' }}>{type}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {type === 'dog' ? 'Loyal & playful' : type === 'cat' ? 'Calm & curious' : 'Gentle & sweet'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#050510', color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${PET_COLORS[pet.type]}15, transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5, 5, 16, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${PET_COLORS[pet.type]}22`, padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/dashboard" style={{ color: PET_COLORS[pet.type], fontSize: 22, textDecoration: 'none' }}>←</Link>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🐾 {pet.name}</h1>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{getMoodText()}</p>
          </div>
        </div>
        <button onClick={() => setShowPicker(true)} style={{
          padding: '6px 12px', borderRadius: 12, border: `1px solid ${PET_COLORS[pet.type]}33`,
          background: 'transparent', color: PET_COLORS[pet.type], fontSize: 11, cursor: 'pointer',
        }}>Switch</button>
      </div>

      {/* Pet Display */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 20px 20px', position: 'relative',
      }}>
        {/* Heart particles */}
        {heartParticles.map((h) => (
          <div key={h.id} style={{
            position: 'absolute', left: `${h.x}%`, top: `${h.y}%`,
            fontSize: 20, animation: 'floatUp 2s ease-out forwards',
            pointerEvents: 'none',
          }}>❤️</div>
        ))}

        {/* Pet */}
        <div style={{
          fontSize: 80, marginBottom: 16,
          animation: bounce ? 'petBounce 0.5s ease' : action === 'sleeping' ? 'petSleep 3s ease-in-out infinite' : 'petIdle 4s ease-in-out infinite',
          filter: pet.mood < 30 ? 'grayscale(0.3)' : 'none',
          transition: 'transform 0.3s',
        }}>
          {getFace()}
        </div>

        {/* Pet Name & Mood */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '12px 20px',
          border: `1px solid ${PET_COLORS[pet.type]}22`, backdropFilter: 'blur(10px)',
          marginBottom: 24, textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            {action === 'pet' && '💕 Loves being petted!'}
            {action === 'eating' && '🍖 Yummy!'}
            {action === 'playing' && '🎉 So much fun!'}
            {action === 'sleeping' && '💤 Zzz...'}
            {!action && (pet.mood > 60 ? `Happy to see you! ${pet.type === 'dog' ? '🐕 wags tail' : pet.type === 'cat' ? '😺 purrs' : '🐰 hops around'}` : 'Waiting for your attention...')}
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
          width: '100%', maxWidth: 340, marginBottom: 28,
        }}>
          {[
            { label: 'Hunger', value: pet.hunger, color: '#fbbf24', icon: '🍖' },
            { label: 'Happiness', value: pet.happiness, color: '#f472b6', icon: '💕' },
            { label: 'Energy', value: pet.energy, color: '#34d399', icon: '⚡' },
            { label: 'Mood', value: pet.mood, color: '#a78bfa', icon: '🌟' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{stat.icon} {stat.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{Math.round(stat.value)}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 2, width: `${stat.value}%`,
                  background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          width: '100%', maxWidth: 340,
        }}>
          {[
            { act: 'pet', icon: '🤚', label: 'Pet', color: '#f472b6' },
            { act: 'feed', icon: '🍖', label: 'Feed', color: '#fbbf24' },
            { act: 'play', icon: '🎾', label: 'Play', color: '#34d399' },
            { act: 'sleep', icon: '💤', label: 'Sleep', color: '#a78bfa' },
          ].map((btn) => (
            <button
              key={btn.act}
              onClick={() => doAction(btn.act)}
              disabled={action !== null}
              style={{
                padding: '16px 8px', borderRadius: 16,
                border: `1px solid ${btn.color}33`,
                background: `rgba(${btn.act === 'pet' ? '244,114,182' : btn.act === 'feed' ? '251,191,36' : btn.act === 'play' ? '52,211,153' : '167,139,250'},0.08)`,
                color: btn.color, cursor: action ? 'default' : 'pointer',
                opacity: action ? 0.5 : 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'transform 0.2s, opacity 0.2s',
              }}
              onMouseEnter={(e) => !action && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span style={{ fontSize: 24 }}>{btn.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes petBounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-20px); }
          60% { transform: translateY(-8px); }
        }
        @keyframes petIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes petSleep {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-4px) rotate(3deg); }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-80px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
