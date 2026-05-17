'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  soulScore: number;
  memories: number;
  level: number;
  category: string;
  trend: 'up' | 'down' | 'same';
}

const defaultLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Nova', avatar: '🌟', soulScore: 9850, memories: 342, level: 87, category: 'Explorer', trend: 'same' },
  { rank: 2, name: 'Echo', avatar: '🔮', soulScore: 9200, memories: 298, level: 82, category: 'Sage', trend: 'up' },
  { rank: 3, name: 'Pulse', avatar: '⚡', soulScore: 8700, memories: 275, level: 79, category: 'Creator', trend: 'up' },
  { rank: 4, name: 'Drift', avatar: '🌊', soulScore: 8100, memories: 256, level: 74, category: 'Explorer', trend: 'down' },
  { rank: 5, name: 'Ember', avatar: '🔥', soulScore: 7500, memories: 231, level: 70, category: 'Warrior', trend: 'up' },
  { rank: 6, name: 'Nyx', avatar: '🌙', soulScore: 6900, memories: 210, level: 65, category: 'Sage', trend: 'same' },
  { rank: 7, name: 'Bloom', avatar: '🌸', soulScore: 6200, memories: 189, level: 60, category: 'Healer', trend: 'up' },
  { rank: 8, name: 'Storm', avatar: '⛈️', soulScore: 5800, memories: 175, level: 57, category: 'Warrior', trend: 'down' },
  { rank: 9, name: 'Glitch', avatar: '💻', soulScore: 5100, memories: 152, level: 52, category: 'Creator', trend: 'up' },
  { rank: 10, name: 'Sol', avatar: '☀️', soulScore: 4600, memories: 138, level: 48, category: 'Healer', trend: 'same' },
];

const categories = ['All', 'Explorer', 'Sage', 'Creator', 'Warrior', 'Healer'];

export default function SoulLeaderboard() {
  const t = useT();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState('All');
  const [userRank] = useState({ rank: 42, name: 'You', soulScore: 1250, memories: 45, level: 18, avatar: '👤' });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [animateRanks, setAnimateRanks] = useState(false);

  useEffect(() => {
    setLeaderboard(defaultLeaderboard);
    const p = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(p);
    setTimeout(() => setAnimateRanks(true), 300);
  }, []);

  const filtered = filter === 'All' ? leaderboard : leaderboard.filter(e => e.category === filter);

  const podiumColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const podiumHeights = [140, 110, 90];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#E0E0E0', position: 'relative', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(255,215,0,0.15)', animation: `float ${6 + p.delay}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`, pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes slideUp { 0%{opacity:0;transform:translateY(20px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes crownBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes trendUp { 0%{color:#4ADE80} 50%{color:#22C55E} 100%{color:#4ADE80} }
        .glass { backdrop-filter:blur(16px);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px }
        .rank-row { animation:slideUp 0.4s ease-out both }
      `}</style>

      <header style={{ position:'sticky',top:0,zIndex:50,backdropFilter:'blur(20px)',background:'rgba(5,5,16,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,maxWidth:800,margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'#888',textDecoration:'none',fontSize:20 }}>←</Link>
          <h1 style={{ fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#FFD700,#FF6B9D)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            🏆 {t('soul leaderboard')}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth:800,margin:'0 auto',padding:'24px 16px',position:'relative',zIndex:1 }}>
        {/* Podium */}
        <div className="glass" style={{ padding:24,marginBottom:24 }}>
          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'center',gap:12,height:200 }}>
            {/* 2nd Place */}
            {filtered[1] && (
              <div style={{ textAlign:'center',flex:1,maxWidth:140 }}>
                <div style={{ fontSize:36,marginBottom:4 }}>{filtered[1].avatar}</div>
                <div style={{ fontSize:14,fontWeight:600 }}>{filtered[1].name}</div>
                <div style={{ fontSize:12,color:podiumColors[1],fontWeight:700 }}>{filtered[1].soulScore.toLocaleString()}</div>
                <div style={{ marginTop:8,height:podiumHeights[1],background:`linear-gradient(180deg,${podiumColors[1]}33,${podiumColors[1]}11)`,borderRadius:'8px 8px 0 0',border:`1px solid ${podiumColors[1]}44`,borderBottom:'none',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:24,fontWeight:800,color:podiumColors[1] }}>2</span>
                </div>
              </div>
            )}
            {/* 1st Place */}
            {filtered[0] && (
              <div style={{ textAlign:'center',flex:1,maxWidth:140 }}>
                <div style={{ fontSize:16,animation:'crownBounce 2s infinite' }}>👑</div>
                <div style={{ fontSize:42,marginBottom:4 }}>{filtered[0].avatar}</div>
                <div style={{ fontSize:16,fontWeight:700,color:podiumColors[0] }}>{filtered[0].name}</div>
                <div style={{ fontSize:13,color:podiumColors[0],fontWeight:700 }}>{filtered[0].soulScore.toLocaleString()}</div>
                <div style={{ marginTop:8,height:podiumHeights[0],background:`linear-gradient(180deg,${podiumColors[0]}33,${podiumColors[0]}11)`,borderRadius:'8px 8px 0 0',border:`1px solid ${podiumColors[0]}44`,borderBottom:'none',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:28,fontWeight:800,color:podiumColors[0] }}>1</span>
                </div>
              </div>
            )}
            {/* 3rd Place */}
            {filtered[2] && (
              <div style={{ textAlign:'center',flex:1,maxWidth:140 }}>
                <div style={{ fontSize:32,marginBottom:4 }}>{filtered[2].avatar}</div>
                <div style={{ fontSize:13,fontWeight:600 }}>{filtered[2].name}</div>
                <div style={{ fontSize:12,color:podiumColors[2],fontWeight:700 }}>{filtered[2].soulScore.toLocaleString()}</div>
                <div style={{ marginTop:8,height:podiumHeights[2],background:`linear-gradient(180deg,${podiumColors[2]}33,${podiumColors[2]}11)`,borderRadius:'8px 8px 0 0',border:`1px solid ${podiumColors[2]}44`,borderBottom:'none',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span style={{ fontSize:22,fontWeight:800,color:podiumColors[2] }}>3</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ display:'flex',gap:8,overflowX:'auto',paddingBottom:8,marginBottom:20 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ padding:'8px 16px',borderRadius:12,border:`1px solid ${filter===cat?'rgba(255,215,0,0.4)':'rgba(255,255,255,0.08)'}`,background:filter===cat?'rgba(255,215,0,0.1)':'rgba(255,255,255,0.02)',color:filter===cat?'#FFD700':'#888',cursor:'pointer',fontSize:13,fontWeight:filter===cat?600:400,whiteSpace:'nowrap',transition:'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Your Rank */}
        <div className="glass" style={{ padding:16,marginBottom:20,border:'1px solid rgba(255,215,0,0.15)',background:'rgba(255,215,0,0.04)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,215,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,color:'#FFD700' }}>
              #{userRank.rank}
            </div>
            <span style={{ fontSize:28 }}>{userRank.avatar}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600 }}>{userRank.name}</div>
              <div style={{ fontSize:12,color:'#888' }}>Lv.{userRank.level} • {userRank.memories} memories</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontWeight:700,color:'#FFD700',fontSize:16 }}>{userRank.soulScore.toLocaleString()}</div>
              <div style={{ fontSize:11,color:'#666' }}>{t('soul score')}</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass" style={{ overflow:'hidden' }}>
          <div style={{ display:'grid',gridTemplateColumns:'50px 1fr 80px 70px 60px',gap:0,padding:'12px 16px',fontSize:12,color:'#666',fontWeight:600,borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <span>{t('rank')}</span><span>{t('clone')}</span><span style={{textAlign:'right'}}>{t('score')}</span><span style={{textAlign:'right'}}>Mem</span><span style={{textAlign:'right'}}>Lv</span>
          </div>
          {filtered.map((entry, i) => (
            <div key={entry.rank} className="rank-row"
              style={{ display:'grid',gridTemplateColumns:'50px 1fr 80px 70px 60px',gap:0,padding:'14px 16px',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.03)',animationDelay:`${i*0.05}s`,transition:'background 0.2s',cursor:'default' }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
              <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                <span style={{ fontWeight:700,color:entry.rank<=3?podiumColors[entry.rank-1]:'#666',fontSize:15 }}>
                  #{entry.rank}
                </span>
                {entry.trend === 'up' && <span style={{fontSize:10,color:'#4ADE80',animation:'trendUp 2s infinite'}}>▲</span>}
                {entry.trend === 'down' && <span style={{fontSize:10,color:'#F87171'}}>▼</span>}
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <span style={{ fontSize:24 }}>{entry.avatar}</span>
                <div>
                  <div style={{ fontWeight:500,fontSize:14 }}>{entry.name}</div>
                  <div style={{ fontSize:11,color:'#666' }}>{entry.category}</div>
                </div>
              </div>
              <span style={{ textAlign:'right',fontWeight:700,color:entry.rank<=3?podiumColors[entry.rank-1]:'#E0E0E0',fontSize:14 }}>
                {entry.soulScore.toLocaleString()}
              </span>
              <span style={{ textAlign:'right',fontSize:13,color:'#888' }}>{entry.memories}</span>
              <span style={{ textAlign:'right',fontSize:13,color:'#888' }}>{entry.level}</span>
            </div>
          ))}
        </div>

        {/* Stats Footer */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:20 }}>
          {[
            { label: t('total clones'), value: '1,247', emoji: '👥' },
            { label: t('avg soul score'), value: '3,450', emoji: '📊' },
            { label: t('active today'), value: '89', emoji: '🟢' },
          ].map(stat => (
            <div key={stat.label} className="glass" style={{ padding:16,textAlign:'center' }}>
              <div style={{ fontSize:24 }}>{stat.emoji}</div>
              <div style={{ fontWeight:700,fontSize:18,marginTop:4 }}>{stat.value}</div>
              <div style={{ fontSize:11,color:'#666' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
