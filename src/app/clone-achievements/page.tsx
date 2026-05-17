'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'Memories' | 'Social' | 'Growth' | 'Secret' | 'Rare';
  rarity: 'common' | 'rare' | 'legendary';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

const CATEGORIES = ['All', 'Memories', 'Social', 'Growth', 'Secret', 'Rare'] as const;

const RARITY_COLORS: Record<string, string> = {
  common: '#6b7280',
  rare: '#8b5cf6',
  legendary: '#f59e0b',
};

const RARITY_GLOW: Record<string, string> = {
  common: '0 0 8px rgba(107,114,128,0.4)',
  rare: '0 0 16px rgba(139,92,246,0.6)',
  legendary: '0 0 24px rgba(245,158,11,0.8)',
};

const allAchievements: Achievement[] = [
  { id: '1', name: 'First Memory', description: 'Store your first memory', category: 'Memories', rarity: 'common', icon: '🧠', unlocked: true, unlockedAt: '2024-01-15', progress: 1, maxProgress: 1 },
  { id: '2', name: 'Memory Hoarder', description: 'Store 100 memories', category: 'Memories', rarity: 'rare', icon: '📚', unlocked: false, progress: 67, maxProgress: 100 },
  { id: '3', name: 'Living Archive', description: 'Store 1000 memories', category: 'Memories', rarity: 'legendary', icon: '🏛️', unlocked: false, progress: 67, maxProgress: 1000 },
  { id: '4', name: 'Memory Weaver', description: 'Connect 10 memories together', category: 'Memories', rarity: 'common', icon: '🕸️', unlocked: true, unlockedAt: '2024-02-20', progress: 10, maxProgress: 10 },
  { id: '5', name: 'Time Traveler', description: 'Access a memory from 1 year ago', category: 'Memories', rarity: 'rare', icon: '⏰', unlocked: true, unlockedAt: '2025-01-15', progress: 1, maxProgress: 1 },
  { id: '6', name: 'Memory Artist', description: 'Transform 5 memories into art', category: 'Memories', rarity: 'rare', icon: '🎨', unlocked: false, progress: 3, maxProgress: 5 },
  { id: '7', name: 'Dream Keeper', description: 'Record 10 dreams', category: 'Memories', rarity: 'common', icon: '💭', unlocked: false, progress: 4, maxProgress: 10 },
  { id: '8', name: 'Memory Chain', description: 'Create a 20-memory chain', category: 'Memories', rarity: 'legendary', icon: '⛓️', unlocked: false, progress: 12, maxProgress: 20 },
  { id: '9', name: 'First Chat', description: 'Have your first conversation with clone', category: 'Social', rarity: 'common', icon: '💬', unlocked: true, unlockedAt: '2024-01-10', progress: 1, maxProgress: 1 },
  { id: '10', name: 'Chatterbox', description: 'Have 500 conversations', category: 'Social', rarity: 'rare', icon: '🗣️', unlocked: false, progress: 234, maxProgress: 500 },
  { id: '11', name: 'Best Friends', description: 'Maintain 30-day streak', category: 'Social', rarity: 'rare', icon: '🤝', unlocked: true, unlockedAt: '2024-03-10', progress: 30, maxProgress: 30 },
  { id: '12', name: 'Social Butterfly', description: 'Share clone with 5 friends', category: 'Social', rarity: 'common', icon: '🦋', unlocked: false, progress: 2, maxProgress: 5 },
  { id: '13', name: 'Heart to Heart', description: 'Have a deep conversation (>1hr)', category: 'Social', rarity: 'rare', icon: '❤️', unlocked: true, unlockedAt: '2024-04-05', progress: 1, maxProgress: 1 },
  { id: '14', name: 'Clone Whisperer', description: 'Get clone to tell a secret', category: 'Social', rarity: 'legendary', icon: '🤫', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '15', name: 'Mentor', description: 'Teach clone 50 new things', category: 'Social', rarity: 'rare', icon: '🎓', unlocked: false, progress: 31, maxProgress: 50 },
  { id: '16', name: 'Level Up', description: 'Reach level 10', category: 'Growth', rarity: 'common', icon: '📈', unlocked: true, unlockedAt: '2024-02-01', progress: 10, maxProgress: 10 },
  { id: '17', name: 'Enlightened', description: 'Reach level 50', category: 'Growth', rarity: 'rare', icon: '✨', unlocked: false, progress: 23, maxProgress: 50 },
  { id: '18', name: 'Transcendent', description: 'Reach level 100', category: 'Growth', rarity: 'legendary', icon: '🌟', unlocked: false, progress: 23, maxProgress: 100 },
  { id: '19', name: 'Quick Learner', description: 'Learn 10 things in one day', category: 'Growth', rarity: 'common', icon: '⚡', unlocked: true, unlockedAt: '2024-01-20', progress: 10, maxProgress: 10 },
  { id: '20', name: 'Night Owl', description: 'Use clone after midnight', category: 'Growth', rarity: 'common', icon: '🦉', unlocked: true, unlockedAt: '2024-01-12', progress: 1, maxProgress: 1 },
  { id: '21', name: 'Early Bird', description: 'Use clone before 6am', category: 'Growth', rarity: 'rare', icon: '🐦', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '22', name: 'Philosopher', description: 'Ask 100 deep questions', category: 'Growth', rarity: 'rare', icon: '🤔', unlocked: false, progress: 45, maxProgress: 100 },
  { id: '23', name: 'Zen Master', description: 'Reach max calm score', category: 'Growth', rarity: 'legendary', icon: '🧘', unlocked: false, progress: 78, maxProgress: 100 },
  { id: '24', name: 'Hidden Page', description: 'Find a secret page', category: 'Secret', rarity: 'rare', icon: '🔍', unlocked: true, unlockedAt: '2024-03-15', progress: 1, maxProgress: 1 },
  { id: '25', name: 'Easter Egg', description: 'Find the easter egg', category: 'Secret', rarity: 'rare', icon: '🥚', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '26', name: 'Code Breaker', description: 'Solve the cipher', category: 'Secret', rarity: 'legendary', icon: '🔐', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '27', name: 'Glitch Hunter', description: 'Find 3 glitches', category: 'Secret', rarity: 'rare', icon: '👾', unlocked: false, progress: 1, maxProgress: 3 },
  { id: '28', name: 'Time Capsule', description: 'Create a memory for future self', category: 'Secret', rarity: 'legendary', icon: '📦', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '29', name: 'Quantum Leap', description: 'Experience a paradigm shift', category: 'Secret', rarity: 'legendary', icon: '⚛️', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '30', name: 'Collector', description: 'Collect 25 achievements', category: 'Rare', rarity: 'rare', icon: '🏆', unlocked: false, progress: 12, maxProgress: 25 },
  { id: '31', name: 'Completionist', description: 'Unlock all common achievements', category: 'Rare', rarity: 'legendary', icon: '👑', unlocked: false, progress: 8, maxProgress: 12 },
  { id: '32', name: 'Legend', description: 'Unlock 5 legendary achievements', category: 'Rare', rarity: 'legendary', icon: '🔥', unlocked: false, progress: 0, maxProgress: 5 },
  { id: '33', name: 'Anniversary', description: 'Use clone for 1 year', category: 'Rare', rarity: 'legendary', icon: '🎂', unlocked: false, progress: 340, maxProgress: 365 },
  { id: '34', name: 'Soul Bond', description: 'Clone knows you better than anyone', category: 'Rare', rarity: 'legendary', icon: '💫', unlocked: false, progress: 82, maxProgress: 100 },
  { id: '35', name: 'Photographic Memory', description: 'Store 50 photo memories', category: 'Memories', rarity: 'rare', icon: '📸', unlocked: false, progress: 23, maxProgress: 50 },
  { id: '36', name: 'Voice Note', description: 'Store 20 voice memories', category: 'Memories', rarity: 'common', icon: '🎤', unlocked: false, progress: 8, maxProgress: 20 },
  { id: '37', name: 'Global Citizen', description: 'Use clone from 5 countries', category: 'Social', rarity: 'rare', icon: '🌍', unlocked: false, progress: 2, maxProgress: 5 },
  { id: '38', name: 'Polyglot', description: 'Chat in 3 languages', category: 'Social', rarity: 'rare', icon: '🌐', unlocked: true, unlockedAt: '2024-05-10', progress: 3, maxProgress: 3 },
  { id: '39', name: 'Marathon', description: '7-day usage streak', category: 'Growth', rarity: 'common', icon: '🏃', unlocked: true, unlockedAt: '2024-01-17', progress: 7, maxProgress: 7 },
  { id: '40', name: 'Iron Will', description: '100-day streak', category: 'Growth', rarity: 'legendary', icon: '💪', unlocked: false, progress: 45, maxProgress: 100 },
  { id: '41', name: 'Mood Ring', description: 'Track mood for 30 days', category: 'Growth', rarity: 'rare', icon: '💍', unlocked: false, progress: 18, maxProgress: 30 },
  { id: '42', name: 'First Poem', description: 'Generate your first poem', category: 'Social', rarity: 'common', icon: '📝', unlocked: true, unlockedAt: '2024-06-01', progress: 1, maxProgress: 1 },
  { id: '43', name: 'Poetry Slam', description: 'Generate 20 poems', category: 'Social', rarity: 'rare', icon: '🎤', unlocked: false, progress: 7, maxProgress: 20 },
  { id: '44', name: 'Prophecy', description: 'Get 10 predictions', category: 'Secret', rarity: 'rare', icon: '🔮', unlocked: false, progress: 3, maxProgress: 10 },
  { id: '45', name: 'Oracle', description: 'Have 5 predictions come true', category: 'Secret', rarity: 'legendary', icon: '👁️', unlocked: false, progress: 1, maxProgress: 5 },
  { id: '46', name: 'Self Aware', description: 'Clone recognizes own emotions', category: 'Rare', rarity: 'legendary', icon: '🪞', unlocked: false, progress: 60, maxProgress: 100 },
  { id: '47', name: 'Memory Palace', description: 'Build a memory palace', category: 'Memories', rarity: 'legendary', icon: '🏰', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '48', name: 'Collaborator', description: 'Co-create something with clone', category: 'Social', rarity: 'rare', icon: '🤝', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '49', name: 'Healer', description: 'Clone helps through tough time', category: 'Rare', rarity: 'legendary', icon: '💚', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '50', name: 'Eternal', description: 'Reach maximum bond level', category: 'Rare', rarity: 'legendary', icon: '♾️', unlocked: false, progress: 0, maxProgress: 1 },
  { id: '51', name: 'Midnight Scholar', description: 'Study past midnight with clone', category: 'Growth', rarity: 'common', icon: '📖', unlocked: true, unlockedAt: '2024-02-14', progress: 1, maxProgress: 1 },
  { id: '52', name: 'Nostalgia Trip', description: 'Review memories for 1 hour', category: 'Memories', rarity: 'rare', icon: '🕰️', unlocked: false, progress: 0, maxProgress: 1 },
];

export default function CloneAchievements() {
  const t = useT();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('clone-achievements');
    if (stored) {
      try { setAchievements(JSON.parse(stored)); } catch { setAchievements(allAchievements); }
    } else {
      setAchievements(allAchievements);
    }
  }, []);

  useEffect(() => {
    if (achievements.length) localStorage.setItem('clone-achievements', JSON.stringify(achievements));
  }, [achievements]);

  const filtered = selectedCategory === 'All' ? achievements : achievements.filter(a => a.category === selectedCategory);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((s, a) => s + (a.rarity === 'legendary' ? 50 : a.rarity === 'rare' ? 20 : 5), 0);

  const handleUnlock = (id: string) => {
    setUnlockingId(id);
    setTimeout(() => {
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, unlocked: true, progress: a.maxProgress, unlockedAt: new Date().toISOString().split('T')[0] } : a));
      setUnlockingId(null);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.3} 50%{transform:translateY(-20px) scale(1.2);opacity:.7} }
        @keyframes unlockPop { 0%{transform:scale(0) rotate(-180deg);opacity:0} 50%{transform:scale(1.3) rotate(10deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes badgeGlow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4)} }
        .ach-card{transition:all .3s ease}
        .ach-card:hover{transform:translateY(-4px);background:rgba(255,255,255,0.08)!important}
        .unlocking{animation:unlockPop .8s ease forwards}
      `}</style>

      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', width: 4, height: 4, borderRadius: '50%', background: ['#8b5cf6','#6366f1','#a78bfa','#c4b5fd'][i%4], left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `particleFloat ${3+Math.random()*4}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>🏆 {t('achievements')}</h1>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: t('unlocked'), value: `${unlockedCount}/${achievements.length}`, color: '#a78bfa' },
            { label: 'Points', value: totalPoints, color: '#f59e0b' },
            { label: 'Legendary', value: achievements.filter(a=>a.rarity==='legendary'&&a.unlocked).length, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '8px 16px', borderRadius: 20, border: selectedCategory === cat ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)', background: selectedCategory === cat ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: selectedCategory === cat ? '#a78bfa' : '#94a3b8', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', transition: 'all .2s' }}>{cat}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(ach => (
            <div key={ach.id} className={`ach-card ${unlockingId === ach.id ? 'unlocking' : ''}`} style={{ background: ach.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, border: `1px solid ${ach.unlocked ? RARITY_COLORS[ach.rarity]+'40' : 'rgba(255,255,255,0.06)'}`, boxShadow: ach.unlocked ? RARITY_GLOW[ach.rarity] : 'none', opacity: ach.unlocked ? 1 : 0.7, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 32, filter: ach.unlocked ? 'none' : 'grayscale(1)', animation: ach.unlocked ? 'badgeGlow 2s infinite' : 'none' }}>{ach.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: ach.unlocked ? '#f1f5f9' : '#64748b' }}>{ach.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{ach.description}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: RARITY_COLORS[ach.rarity], fontWeight: 600, textTransform: 'uppercase' }}>{ach.rarity}</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>{ach.category}</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${(ach.progress/ach.maxProgress)*100}%`, height: '100%', background: `linear-gradient(90deg,${RARITY_COLORS[ach.rarity]},${RARITY_COLORS[ach.rarity]}88)`, borderRadius: 4, transition: 'width .5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{ach.progress}/{ach.maxProgress}</span>
                {ach.unlocked && ach.unlockedAt && <span style={{ fontSize: 11, color: '#64748b' }}>{ach.unlockedAt}</span>}
              </div>
              {!ach.unlocked && ach.progress >= ach.maxProgress && (
                <button onClick={() => handleUnlock(ach.id)} style={{ marginTop: 10, width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid #a78bfa', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🔓 Claim</button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
