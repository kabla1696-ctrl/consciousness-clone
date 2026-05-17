'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

const ALL_TRAITS = [
  { name: 'Loyal', symbol: '🛡️', meaning: 'Unwavering devotion to those you hold dear', color: '#3b82f6' },
  { name: 'Creative', symbol: '🎨', meaning: 'A mind that sees beauty where others see nothing', color: '#a855f7' },
  { name: 'Brave', symbol: '⚔️', meaning: 'Courage in the face of the unknown', color: '#ef4444' },
  { name: 'Kind', symbol: '🌿', meaning: 'Gentleness as a form of strength', color: '#22c55e' },
  { name: 'Curious', symbol: '🔭', meaning: 'An insatiable hunger to understand everything', color: '#06b6d4' },
  { name: 'Resilient', symbol: '🔥', meaning: 'Unbreakable spirit forged through hardship', color: '#f97316' },
  { name: 'Empathetic', symbol: '💜', meaning: 'Feeling the world through others\' hearts', color: '#8b5cf6' },
  { name: 'Ambitious', symbol: '🏔️', meaning: 'Eyes always fixed on the summit', color: '#eab308' },
  { name: 'Wise', symbol: '📜', meaning: 'Knowledge tempered by experience and humility', color: '#78716c' },
  { name: 'Playful', symbol: '🎭', meaning: 'Finding joy and laughter in every moment', color: '#ec4899' },
  { name: 'Mysterious', symbol: '🌙', meaning: 'A depth that can never be fully known', color: '#6366f1' },
  { name: 'Authentic', symbol: '💎', meaning: 'True to yourself, always and without apology', color: '#14b8a6' },
];

interface Tattoo {
  name: string;
  symbol: string;
  meaning: string;
  color: string;
  lockedDate: string;
}

export default function SoulTattooPage() {
  const t = useT();
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('soul-tattoos');
    if (stored) setTattoos(JSON.parse(stored));
  }, []);

  const isTraitLocked = (name: string) => tattoos.some(t => t.name === name);

  const toggleSelect = (name: string) => {
    if (isTraitLocked(name)) return;
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 5 ? [...prev, name] : prev);
  };

  const lockTattoos = () => {
    if (selected.length < 3) return;
    const newTattoos: Tattoo[] = selected.map(name => {
      const trait = ALL_TRAITS.find(t => t.name === name)!;
      return { ...trait, lockedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) };
    });
    const all = [...tattoos, ...newTattoos];
    setTattoos(all);
    localStorage.setItem('soul-tattoos', JSON.stringify(all));
    setSelected([]);
    setSelecting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e0e0e0', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,.2)} 50%{box-shadow:0 0 40px rgba(139,92,246,.4)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        @keyframes inkDrop { 0%{clip-path:circle(0% at 50% 50%)} 100%{clip-path:circle(100% at 50% 50%)} }
        .tattoo-card{backdrop-filter:blur(20px);border-radius:20px;padding:24px;text-align:center;transition:all .4s;position:relative;overflow:hidden}
        .tattoo-card::before{content:'';position:absolute;inset:0;border-radius:20px;padding:1px;background:linear-gradient(135deg,rgba(139,92,246,.3),transparent,rgba(99,102,241,.3));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
        .tattoo-card:hover{transform:translateY(-6px)}
        .trait-option{padding:16px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);cursor:pointer;transition:all .25s;text-align:center}
        .trait-option:hover{border-color:rgba(139,92,246,.3)}
        .trait-option.selected{border-color:#8b5cf6;background:rgba(139,92,246,.1);box-shadow:0 0 20px rgba(139,92,246,.15)}
        .trait-option.locked{opacity:.4;cursor:default;pointer-events:none}
        .confirm-btn{padding:14px 32px;border-radius:14px;border:none;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s}
        .confirm-btn:hover{transform:scale(1.03);box-shadow:0 4px 20px rgba(139,92,246,.4)}
        .confirm-btn:disabled{opacity:.3;cursor:default;transform:none;box-shadow:none}
      `}</style>

      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed', width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%', background: `rgba(139,92,246,${0.12 + Math.random() * 0.2})`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 5}s ease-in-out infinite ${Math.random() * 3}s`
        }} />
      ))}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,.8)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg,#c084fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('soul tattoo')}</h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{t('permanent traits')}</p>
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
        {/* Existing Tattoos */}
        {tattoos.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#a78bfa', marginBottom: 14 }}>✦ {t('your soul tattoos')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
              {tattoos.map(tattoo => (
                <div key={tattoo.name} className="tattoo-card" onClick={() => setRevealed(revealed === tattoo.name ? null : tattoo.name)} style={{ animation: 'fadeIn .5s ease-out, glow 3s ease-in-out infinite', cursor: 'pointer' }}>
                  <div style={{ fontSize: 42, marginBottom: 8, filter: `drop-shadow(0 0 12px ${tattoo.color}50)` }}>{tattoo.symbol}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: tattoo.color }}>{tattoo.name}</div>
                  {revealed === tattoo.name && (
                    <div style={{ marginTop: 8, animation: 'fadeIn .3s ease-out' }}>
                      <p style={{ fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>&ldquo;{tattoo.meaning}&rdquo;</p>
                      <p style={{ fontSize: 10, color: '#555', margin: '8px 0 0' }}>🔒 {t('locked')} {tattoo.lockedDate}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selection Mode */}
        {selecting ? (
          <section style={{ animation: 'fadeIn .3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#a78bfa', margin: 0 }}>{t('choose core traits')}</h2>
              <span style={{ fontSize: 13, color: selected.length >= 3 ? '#34d399' : '#888' }}>{selected.length}/5</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
              {ALL_TRAITS.map(tr => {
                const locked = isTraitLocked(tr.name);
                const sel = selected.includes(tr.name);
                return (
                  <div key={tr.name} className={`trait-option${sel ? ' selected' : ''}${locked ? ' locked' : ''}`} onClick={() => toggleSelect(tr.name)}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{tr.symbol}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: sel ? tr.color : '#ccc' }}>{tr.name}</div>
                    {locked && <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>🔒 {t('locked')}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setSelecting(false); setSelected([]); }} style={{ flex: 1, padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#999', cursor: 'pointer', fontSize: 14 }}>{t('cancel')}</button>
              <button className="confirm-btn" disabled={selected.length < 3} onClick={lockTattoos} style={{ flex: 1 }}>🔒 {t('lock forever')}</button>
            </div>
          </section>
        ) : (
          <div style={{ textAlign: 'center', marginTop: tattoos.length === 0 ? 60 : 10 }}>
            {tattoos.length === 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 56, marginBottom: 12, animation: 'float 4s ease-in-out infinite' }}>✦</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', background: 'linear-gradient(135deg,#c084fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('no tattoos yet')}</h2>
                <p style={{ fontSize: 14, color: '#888', maxWidth: 300, margin: '0 auto 24px', lineHeight: 1.6 }}>{t('choose traits description')}</p>
              </div>
            )}
            <button className="confirm-btn" onClick={() => setSelecting(true)} style={{ background: tattoos.length > 0 ? 'rgba(139,92,246,.15)' : undefined, border: tattoos.length > 0 ? '1px solid rgba(139,92,246,.3)' : 'none', color: tattoos.length > 0 ? '#c084fc' : '#fff' }}>
              {tattoos.length > 0 ? '+ ' + t('add more tattoos') : '✦ ' + t('begin tattoo ritual')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
