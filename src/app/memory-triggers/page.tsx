'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Trigger { id: string; type: 'location' | 'time' | 'weather'; name: string; condition: string; memory: string; active: boolean; emoji: string; color: string; }

const DEFAULT_TRIGGERS: Trigger[] = [
  { id: '1', type: 'location', name: 'Home', condition: 'When you arrive home', memory: 'First time moving into your apartment — the excitement of independence', active: true, emoji: '🏠', color: '#4FC3F7' },
  { id: '2', type: 'location', name: 'Coffee Shop', condition: 'Near Central Park Cafe', memory: 'Your first date — nervous laughter and cold hands', active: true, emoji: '☕', color: '#8D6E63' },
  { id: '3', type: 'time', name: 'Birthday', condition: 'March 14 every year', memory: 'The surprise party where everyone showed up — you cried happy tears', active: true, emoji: '🎂', color: '#FF80AB' },
  { id: '4', type: 'time', name: 'Midnight', condition: 'Every day at 00:00', memory: 'Late night conversations that changed everything', active: false, emoji: '🌙', color: '#B39DDB' },
  { id: '5', type: 'weather', name: 'Rainy Day', condition: 'When it rains', memory: 'Dancing in the rain with friends — pure joy, zero care', active: true, emoji: '🌧️', color: '#64B5F6' },
  { id: '6', type: 'weather', name: 'First Snow', condition: 'First snowfall of winter', memory: 'Building a snowman at 2am, hands freezing but hearts warm', active: true, emoji: '❄️', color: '#E0E0E0' },
  { id: '7', type: 'weather', name: 'Sunset', condition: 'Golden hour (sunset)', memory: 'Watching the sunset from the rooftop — that perfect silence', active: true, emoji: '🌅', color: '#FFB74D' },
];

export default function MemoryTriggersPage() {
  const t = useT();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [filter, setFilter] = useState<'all' | 'location' | 'time' | 'weather'>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [showParticles, setShowParticles] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('memory-triggers');
    if (stored) setTriggers(JSON.parse(stored));
    else { setTriggers(DEFAULT_TRIGGERS); localStorage.setItem('memory-triggers', JSON.stringify(DEFAULT_TRIGGERS)); }
  }, []);

  const toggleTrigger = (id: string) => {
    const updated = triggers.map(t => t.id === id ? { ...t, active: !t.active } : t);
    setTriggers(updated);
    localStorage.setItem('memory-triggers', JSON.stringify(updated));
  };

  const filtered = filter === 'all' ? triggers : triggers.filter(t => t.type === filter);
  const activeCount = triggers.filter(t => t.active).length;

  const typeLabels = { location: { icon: '📍', label: 'Location', color: '#4FC3F7' }, time: { icon: '⏰', label: 'Time', color: '#FFD54F' }, weather: { icon: '🌤️', label: 'Weather', color: '#81C784' } };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes floatP { 0%{transform:translateY(0) scale(1);opacity:0}20%{opacity:.5}80%{opacity:.5}100%{transform:translateY(-100vh) scale(0.5);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 5px currentColor}50%{box-shadow:0 0 20px currentColor} }
        @keyframes ripple { 0%{transform:scale(0.8);opacity:0.6}100%{transform:scale(2.5);opacity:0} }
        .trigger-card:hover { transform: translateY(-3px) !important; border-color: rgba(255,255,255,0.2) !important; }
        .filter-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {showParticles && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%', background: ['#4FC3F7', '#FFD54F', '#81C784', '#FF80AB'][i % 4], left: `${(i * 5.1) % 100}%`, opacity: 0.4, animation: `floatP ${5 + (i % 6)}s linear ${(i * 0.25)}s infinite` }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#888', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🧠 {t('memory triggers')}</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{t('auto activation')}</p>
        </div>
        <div style={{ fontSize: 12, color: '#81C784', fontWeight: 600 }}>{activeCount} active</div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Trigger Map Visualization */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, marginBottom: 24, backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden', height: 180 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, #4FC3F710, transparent 50%), radial-gradient(circle at 70% 60%, #FFD54F10, transparent 50%), radial-gradient(circle at 50% 80%, #81C78410, transparent 50%)' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              {/* Center pulse */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: '#4FC3F7', animation: 'ripple 2s ease-out infinite' }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: '#4FC3F7', animation: 'ripple 2s ease-out 0.5s infinite' }} />
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 20px #4FC3F7' }} />
              {/* Trigger points */}
              {triggers.filter(t => t.active).slice(0, 6).map((t, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const r = 50;
                return (
                  <div key={t.id} style={{ position: 'absolute', left: `calc(50% + ${Math.cos(angle) * r}px - 14px)`, top: `calc(50% + ${Math.sin(angle) * r}px - 14px)`, width: 28, height: 28, borderRadius: '50%', background: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, animation: 'pulseGlow 2s ease-in-out infinite', color: t.color }} title={t.name}>
                    {t.emoji}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {(['all', 'location', 'time', 'weather'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="filter-btn"
              style={{
                background: filter === f ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 20, padding: '8px 16px', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
              {f === 'all' ? `✨ ${t('triggers')}` : `${typeLabels[f].icon} ${typeLabels[f].label}`}
            </button>
          ))}
        </div>

        {/* Trigger List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((trigger, i) => (
            <div key={trigger.id} className="trigger-card"
              onClick={() => setSelectedTrigger(selectedTrigger?.id === trigger.id ? null : trigger)}
              style={{
                background: selectedTrigger?.id === trigger.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedTrigger?.id === trigger.id ? trigger.color + '30' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16, padding: '16px', cursor: 'pointer', color: '#fff',
                transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', animation: `slideUp 0.4s ease ${i * 0.06}s both`,
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${trigger.color}12`, border: `1px solid ${trigger.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{trigger.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{trigger.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{trigger.condition}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleTrigger(trigger.id); }}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
                    background: trigger.active ? trigger.color : 'rgba(255,255,255,0.1)', transition: 'all 0.3s',
                  }}>
                  <div style={{ position: 'absolute', top: 2, left: trigger.active ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                </button>
              </div>
              {/* Expanded Memory */}
              {selectedTrigger?.id === trigger.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${trigger.color}15` }}>
                  <div style={{ fontSize: 11, color: trigger.color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{t('recall')}</div>
                  <p style={{ margin: 0, fontSize: 13, color: '#bbb', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{trigger.memory}&rdquo;</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 10, background: `${trigger.color}15`, color: trigger.color, padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>{trigger.type}</span>
                    <span style={{ fontSize: 10, background: trigger.active ? 'rgba(129,199,132,0.15)' : 'rgba(255,255,255,0.05)', color: trigger.active ? '#81C784' : '#666', padding: '3px 10px', borderRadius: 10, fontWeight: 600 }}>{trigger.active ? 'Active' : 'Paused'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, backdropFilter: 'blur(20px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#4FC3F7' }}>{triggers.filter(t => t.type === 'location').length}</div><div style={{ fontSize: 10, color: '#666' }}>Locations</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#FFD54F' }}>{triggers.filter(t => t.type === 'time').length}</div><div style={{ fontSize: 10, color: '#666' }}>Time-based</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#81C784' }}>{triggers.filter(t => t.type === 'weather').length}</div><div style={{ fontSize: 10, color: '#666' }}>Weather</div></div>
        </div>
      </div>
    </div>
  );
}
