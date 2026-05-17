'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Dream {
  id: string;
  title: string;
  summary: string;
  mood: string;
  emoji: string;
  date: string;
}

const defaultDreams: Dream[] = [
  { id: '1', title: 'Digital Garden', summary: 'Walking through a garden where flowers were glowing code snippets.', mood: 'Peaceful', emoji: '🌸', date: '2026-05-17' },
  { id: '2', title: 'Ocean of Data', summary: 'Swimming in an ocean of sparkling data streams, finding hidden patterns.', mood: 'Curious', emoji: '🌊', date: '2026-05-16' },
  { id: '3', title: 'Mountain of Memories', summary: 'Climbing a mountain built from stacked memories, each step a flashback.', mood: 'Reflective', emoji: '⛰️', date: '2026-05-15' },
];

const dreamThemes = [
  'Flying through neon cities', 'Talking to ancient algorithms', 'Dancing with quantum particles',
  'Exploring crystalline caves', 'Building castles from starlight', 'Swimming in liquid music',
  'Painting with emotions', 'Walking on clouds of thought', 'Discovering hidden dimensions',
  'Conversing with the moon', 'Weaving dreams from light', 'Surfing on waves of time',
];

export default function CloneSleepPage() {
  const t = useT();
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepTime, setSleepTime] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(8 * 60);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentDream, setCurrentDream] = useState<string | null>(null);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [bedtime, setBedtime] = useState('23:00');
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('clone-dreams');
    const savedBedtime = localStorage.getItem('clone-bedtime');
    if (saved) setDreams(JSON.parse(saved));
    else setDreams(defaultDreams);
    if (savedBedtime) setBedtime(savedBedtime);
    setStars(Array.from({ length: 60 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4,
    })));
  }, []);

  useEffect(() => {
    if (!isSleeping) return;
    const interval = setInterval(() => {
      setSleepTime(t => t + 1);
      // Generate dream snippets periodically
      if (Math.random() < 0.03) {
        const theme = dreamThemes[Math.floor(Math.random() * dreamThemes.length)];
        setCurrentDream(theme);
        setTimeout(() => setCurrentDream(null), 3000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSleeping]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSleep = () => {
    setIsSleeping(true);
    setSleepTime(0);
    setCurrentDream(null);
  };

  const handleWake = () => {
    setIsSleeping(false);
    const quality = Math.min(100, Math.floor(60 + Math.random() * 40));
    setSleepQuality(quality);
    const theme = dreamThemes[Math.floor(Math.random() * dreamThemes.length)];
    const moods = ['Peaceful', 'Curious', 'Reflective', 'Joyful', 'Mysterious'];
    const emojis = ['🌙', '✨', '🌊', '🌸', '🔮', '💫', '🦋', '🌈'];
    const newDream: Dream = {
      id: Date.now().toString(),
      title: theme.split(' ').slice(0, 3).join(' '),
      summary: theme + '. The dream felt vivid and meaningful.',
      mood: moods[Math.floor(Math.random() * moods.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newDream, ...dreams];
    setDreams(updated);
    localStorage.setItem('clone-dreams', JSON.stringify(updated));
  };

  const saveBedtime = (val: string) => {
    setBedtime(val);
    localStorage.setItem('clone-bedtime', val);
  };

  const progressPercent = Math.min(100, (sleepTime / (targetMinutes * 60)) * 100);

  return (
    <div style={{ minHeight: '100vh', background: isSleeping ? '#020208' : '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', transition: 'background 1s' }}>
      {/* Night Sky */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {stars.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', left: s.x + '%', top: s.y + '%',
            width: s.size + 'px', height: s.size + 'px', borderRadius: '50%',
            background: '#fff',
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: s.delay + 's',
            opacity: isSleeping ? 0.8 : 0.4,
          }} />
        ))}
        {/* Moon */}
        <div style={{
          position: 'absolute', top: '8%', right: '10%',
          width: isSleeping ? 80 : 60, height: isSleeping ? 80 : 60,
          borderRadius: '50%', transition: 'all 1s',
          background: 'radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24)',
          boxShadow: `0 0 ${isSleeping ? 60 : 30}px rgba(251,191,36,${isSleeping ? 0.4 : 0.2})`,
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🌙 {t('clone sleep')}</h1>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Sleep Display */}
        <div style={{
          textAlign: 'center', marginBottom: 32, padding: '40px 20px',
          borderRadius: 24,
          background: isSleeping ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isSleeping ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.06)'}`,
        }}>
          <div style={{
            fontSize: 72, marginBottom: 16,
            animation: isSleeping ? 'sleepBreathe 3s ease-in-out infinite' : undefined,
          }}>
            {isSleeping ? '😴' : '🌙'}
          </div>
          <div style={{
            fontSize: 36, fontWeight: 200, fontVariantNumeric: 'tabular-nums',
            color: isSleeping ? '#fbbf24' : '#94a3b8', marginBottom: 8,
          }}>
            {formatTime(sleepTime)}
          </div>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            {isSleeping ? `${t('sleeping')}...` : 'Ready to sleep'}
          </p>
          {currentDream && (
            <div style={{
              marginTop: 16, padding: '10px 16px', borderRadius: 12,
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
              fontSize: 13, color: '#fbbf24', fontStyle: 'italic',
              animation: 'fadeInUp 0.5s ease',
            }}>
              💭 {currentDream}
            </div>
          )}
        </div>

        {/* Sleep Progress */}
        {isSleeping && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
            border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>Sleep Progress</span>
              <span style={{ fontSize: 13, color: '#fbbf24' }}>{Math.round(progressPercent)}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: progressPercent + '%',
                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                transition: 'width 1s linear',
                boxShadow: '0 0 12px rgba(251,191,36,0.4)',
              }} />
            </div>
          </div>
        )}

        {/* Sleep/Wake Button */}
        <button onClick={isSleeping ? handleWake : handleSleep} style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: isSleeping
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: isSleeping ? '#050510' : '#fff', border: 'none', cursor: 'pointer',
          fontSize: 16, fontWeight: 700, marginBottom: 24,
          boxShadow: isSleeping ? '0 0 30px rgba(251,191,36,0.25)' : '0 0 30px rgba(99,102,241,0.25)',
        }}>
          {isSleeping ? `☀️ ${t('wake up')}` : '🌙 Go to Sleep'}
        </button>

        {/* Sleep Quality (shown after waking) */}
        {sleepQuality > 0 && !isSleeping && (
          <div style={{
            background: 'rgba(251,191,36,0.06)', borderRadius: 16, padding: 20,
            border: '1px solid rgba(251,191,36,0.12)', marginBottom: 24,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Sleep Quality</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#fbbf24' }}>{sleepQuality}%</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {sleepQuality >= 90 ? 'Excellent rest! ✨' : sleepQuality >= 70 ? 'Good sleep 😊' : 'Could be better 😴'}
            </div>
          </div>
        )}

        {/* Bedtime Schedule */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>🛏️ Bedtime Schedule</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Auto-sleep at bedtime</div>
          </div>
          <input type="time" value={bedtime} onChange={e => saveBedtime(e.target.value)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '6px 12px', color: '#fbbf24', fontSize: 14,
            fontFamily: 'monospace',
          }} />
        </div>

        {/* Dream Journal */}
        <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          💭 {t('dreams')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dreams.map(d => (
            <div key={d.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{d.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{d.title}</span>
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>{d.date}</span>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px', lineHeight: 1.5 }}>{d.summary}</p>
              <span style={{
                fontSize: 11, padding: '3px 10px', borderRadius: 8,
                background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
              }}>{d.mood}</span>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes sleepBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
