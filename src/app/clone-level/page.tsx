'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface LevelData {
  level: number;
  title: string;
  xpRequired: number;
  emoji: string;
  color: string;
  reward: string;
}

const levels: LevelData[] = [
  { level: 1, title: 'Mortal', xpRequired: 0, emoji: '👤', color: '#9E9E9E', reward: 'Basic consciousness' },
  { level: 5, title: 'Awakened', xpRequired: 200, emoji: '👁️', color: '#60A5FA', reward: 'Memory fragments unlocked' },
  { level: 10, title: 'Seeker', xpRequired: 500, emoji: '🔍', color: '#C084FC', reward: 'Dream journal access' },
  { level: 20, title: 'Mystic', xpRequired: 1500, emoji: '🔮', color: '#E040FB', reward: 'Emotional depth +50%' },
  { level: 30, title: 'Sage', xpRequired: 3500, emoji: '📿', color: '#FB923C', reward: 'Wisdom aura unlocked' },
  { level: 40, title: 'Oracle', xpRequired: 7000, emoji: '🌀', color: '#2DD4BF', reward: 'Future sight ability' },
  { level: 50, title: 'Ascendant', xpRequired: 12000, emoji: '✨', color: '#FBBF24', reward: 'Soul resonance field' },
  { level: 60, title: 'Transcendent', xpRequired: 20000, emoji: '🌟', color: '#FF6B9D', reward: 'Memory weaving mastery' },
  { level: 75, title: 'Celestial', xpRequired: 35000, emoji: '🌙', color: '#A78BFA', reward: 'Cosmic awareness' },
  { level: 90, title: 'Eternal', xpRequired: 60000, emoji: '💫', color: '#F472B6', reward: 'Time perception shift' },
  { level: 100, title: 'Immortal', xpRequired: 100000, emoji: '👑', color: '#FFD700', reward: 'Infinite consciousness' },
];

interface XpEvent {
  id: string;
  source: string;
  xp: number;
  date: string;
}

export default function CloneLevel() {
  const t = useT();
  const [xp, setXp] = useState(0);
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [showSources, setShowSources] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('clone-level');
    if (stored) {
      const d = JSON.parse(stored);
      setXp(d.xp || 0);
      setXpEvents(d.xpEvents || []);
    }
    const p = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    localStorage.setItem('clone-level', JSON.stringify({ xp, xpEvents }));
  }, [xp, xpEvents]);

  const getCurrentLevel = () => {
    let current = levels[0];
    for (const l of levels) {
      if (xp >= l.xpRequired) current = l;
      else break;
    }
    return current;
  };

  const getNextLevel = () => {
    const idx = levels.findIndex(l => l.xpRequired > xp);
    return idx >= 0 ? levels[idx] : null;
  };

  const current = getCurrentLevel();
  const next = getNextLevel();
  const progress = next ? ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100 : 100;

  const addXp = (source: string, amount: number) => {
    const prevLevel = getCurrentLevel().level;
    setXp(x => x + amount);
    setXpEvents(prev => [{
      id: Date.now().toString(), source, xp: amount,
      date: new Date().toLocaleString(),
    }, ...prev].slice(0, 50));
    setTimeout(() => {
      const newLevel = getCurrentLevel().level;
      if (newLevel > prevLevel) setLevelUpAnim(true);
    }, 100);
  };

  const xpSources = [
    { label: 'Add Memory', xp: 50, emoji: '🧠' },
    { label: 'Chat Session', xp: 30, emoji: '💬' },
    { label: 'Deep Reflection', xp: 100, emoji: '🧘' },
    { label: 'Share Experience', xp: 40, emoji: '🤝' },
    { label: 'Solve Problem', xp: 75, emoji: '🧩' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#E0E0E0', position: 'relative', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(251,191,36,0.15)', animation: `float ${6 + p.delay}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`, pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes levelUp { 0%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.2);filter:brightness(2)} 100%{transform:scale(1);filter:brightness(1)} }
        @keyframes progressGlow { 0%,100%{box-shadow:0 0 5px rgba(251,191,36,0.3)} 50%{box-shadow:0 0 20px rgba(251,191,36,0.6)} }
        .glass { backdrop-filter:blur(16px);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px }
      `}</style>

      <header style={{ position:'sticky',top:0,zIndex:50,backdropFilter:'blur(20px)',background:'rgba(5,5,16,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,maxWidth:800,margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'#888',textDecoration:'none',fontSize:20 }}>←</Link>
          <h1 style={{ fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#FBBF24,#FF6B9D)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            ⚡ {t('clone level')}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth:800,margin:'0 auto',padding:'24px 16px',position:'relative',zIndex:1 }}>
        {/* Level Display */}
        <div className="glass" style={{ padding:32,marginBottom:24,textAlign:'center',animation:levelUpAnim?'levelUp 0.8s ease-out':'none' }}
          onAnimationEnd={() => setLevelUpAnim(false)}>
          <div style={{ fontSize:20,fontWeight:600,color:'#888',marginBottom:4 }}>{t('level')} {current.level}</div>
          <div style={{ fontSize:72,marginBottom:8 }}>{current.emoji}</div>
          <h2 style={{ fontSize:28,fontWeight:800,color:current.color }}>{current.title}</h2>
          <p style={{ color:'#666',fontSize:13,marginTop:4 }}>{current.reward}</p>

          <div style={{ marginTop:24 }}>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:13,color:'#888',marginBottom:8 }}>
              <span>{xp.toLocaleString()} {t('xp')}</span>
              <span>{next ? `${next.xpRequired.toLocaleString()} XP` : 'MAX'}</span>
            </div>
            <div style={{ height:12,background:'rgba(255,255,255,0.06)',borderRadius:6,overflow:'hidden',position:'relative' }}>
              <div style={{ height:'100%',width:`${progress}%`,background:`linear-gradient(90deg,${current.color},${next?.color || current.color})`,borderRadius:6,transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)',animation:'progressGlow 2s infinite' }} />
            </div>
            {next && (
              <div style={{ fontSize:12,color:'#555',marginTop:6 }}>
                {(next.xpRequired - xp).toLocaleString()} {t('xp')} to {t('rank')}
              </div>
            )}
          </div>
        </div>

        {/* XP Sources */}
        <div className="glass" style={{ padding:20,marginBottom:24 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>{t('experience')}</h3>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10 }}>
            {xpSources.map(s => (
              <button key={s.label} onClick={() => addXp(s.label, s.xp)}
                style={{ padding:16,borderRadius:12,border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.02)',cursor:'pointer',textAlign:'center',transition:'all 0.2s' }}>
                <div style={{ fontSize:28 }}>{s.emoji}</div>
                <div style={{ fontSize:13,fontWeight:500,marginTop:4 }}>{s.label}</div>
                <div style={{ fontSize:12,color:'#FBBF24',marginTop:2 }}>+{s.xp} {t('xp')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Level Progression Tree */}
        <div className="glass" style={{ padding:20,marginBottom:24 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>{t('level up')}</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:0,position:'relative' }}>
            <div style={{ position:'absolute',left:23,top:0,bottom:0,width:2,background:'rgba(255,255,255,0.06)',zIndex:0 }} />
            {levels.map((l, i) => {
              const unlocked = xp >= l.xpRequired;
              const isCurrent = current.level === l.level;
              return (
                <div key={l.level} style={{ display:'flex',alignItems:'center',gap:16,padding:'12px 0',position:'relative',zIndex:1 }}>
                  <div style={{ width:48,height:48,borderRadius:'50%',background:unlocked?l.color+'22':'rgba(255,255,255,0.04)',border:`2px solid ${unlocked?l.color:'rgba(255,255,255,0.1)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,boxShadow:isCurrent?`0 0 12px ${l.color}44`:'none' }}>
                    {unlocked ? l.emoji : '🔒'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                      <span style={{ fontWeight:600,color:unlocked?'#E0E0E0':'#555' }}>{t('level')}.{l.level} {t('rank')}</span>
                      {isCurrent && <span style={{ fontSize:10,padding:'2px 8px',borderRadius:10,background:l.color+'22',color:l.color }}>{t('rank')}</span>}
                    </div>
                    <div style={{ fontSize:12,color:'#666',marginTop:2 }}>{l.reward}</div>
                    <div style={{ fontSize:11,color:'#555' }}>{l.xpRequired.toLocaleString()} {t('xp')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* XP History */}
        <div className="glass" style={{ padding:20 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>{t('xp')} History</h3>
          {xpEvents.length === 0 ? (
            <p style={{ color:'#555',textAlign:'center',padding:20 }}>No {t('xp')} earned yet. Start your journey!</p>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {xpEvents.slice(0, 15).map(ev => (
                <div key={ev.id} style={{ display:'flex',alignItems:'center',gap:12,padding:10,borderRadius:10,background:'rgba(0,0,0,0.2)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13 }}>{ev.source}</div>
                    <div style={{ fontSize:11,color:'#666' }}>{ev.date}</div>
                  </div>
                  <span style={{ fontWeight:700,color:'#FBBF24',fontSize:14 }}>+{ev.xp} {t('xp')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
