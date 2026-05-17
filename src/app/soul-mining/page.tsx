'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: 'mine' | 'upgrade';
  amount: number;
  desc: string;
  date: string;
}

interface Pickaxe {
  level: number;
  name: string;
  power: number;
  cost: number;
  emoji: string;
}

const pickaxes: Pickaxe[] = [
  { level: 1, name: 'Wooden Pickaxe', power: 1, cost: 0, emoji: '🪵' },
  { level: 2, name: 'Stone Pickaxe', power: 3, cost: 50, emoji: '🪨' },
  { level: 3, name: 'Iron Pickaxe', power: 7, cost: 150, emoji: '⛏️' },
  { level: 4, name: 'Diamond Pickaxe', power: 15, cost: 400, emoji: '💎' },
  { level: 5, name: 'Netherite Pickaxe', power: 30, cost: 1000, emoji: '🔥' },
  { level: 6, name: 'Soul Pickaxe', power: 50, cost: 2500, emoji: '👻' },
];

const memoryPrompts = [
  'A childhood memory you treasure',
  'Your biggest achievement',
  'A lesson learned from failure',
  'Someone who changed your life',
  'A place that feels like home',
  'Your happiest moment this year',
  'A fear you overcame',
  'A dream you haven\'t given up on',
  'Something you\'re grateful for',
  'A memory that made you stronger',
];

export default function SoulMining() {
  const [coins, setCoins] = useState(0);
  const [pickaxeLevel, setPickaxeLevel] = useState(1);
  const [minedToday, setMinedToday] = useState(0);
  const [mining, setMining] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [memoryText, setMemoryText] = useState('');
  const [showMining, setShowMining] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);
  const [pickaxeAngle, setPickaxeAngle] = useState(0);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  const DAILY_LIMIT = 50;

  useEffect(() => {
    const stored = localStorage.getItem('soul-mining');
    if (stored) {
      const d = JSON.parse(stored);
      setCoins(d.coins || 0);
      setPickaxeLevel(d.pickaxeLevel || 1);
      setMinedToday(d.minedToday || 0);
      setTransactions(d.transactions || []);
    }
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    localStorage.setItem('soul-mining', JSON.stringify({ coins, pickaxeLevel, minedToday, transactions }));
  }, [coins, pickaxeLevel, minedToday, transactions]);

  const currentPickaxe = pickaxes[pickaxeLevel - 1];
  const miningRate = currentPickaxe.power;

  const mineMemory = () => {
    if (!memoryText.trim() || mining || minedToday >= DAILY_LIMIT) return;
    setMining(true);
    const depth = Math.min(memoryText.length / 5, 10);
    const earned = Math.round(miningRate * (1 + depth * 0.1));
    setPickaxeAngle(45);
    setSparkles(Array.from({ length: 5 }, (_, i) => ({ id: Date.now() + i, x: Math.random() * 60 + 20, y: Math.random() * 40 + 30 })));

    setTimeout(() => {
      setPickaxeAngle(-45);
      setTimeout(() => {
        setPickaxeAngle(0);
        setCoins(c => c + earned);
        setMinedToday(m => m + earned);
        setTransactions(prev => [{
          id: Date.now().toString(), type: 'mine' as const, amount: earned,
          desc: memoryText.slice(0, 40) + (memoryText.length > 40 ? '...' : ''),
          date: new Date().toLocaleString(),
        }, ...prev].slice(0, 50));
        setMemoryText('');
        setMining(false);
        setSparkles([]);
      }, 300);
    }, 200);
  };

  const upgradePickaxe = () => {
    const next = pickaxes[pickaxeLevel];
    if (!next || coins < next.cost) return;
    setCoins(c => c - next.cost);
    setPickaxeLevel(l => l + 1);
    setTransactions(prev => [{
      id: Date.now().toString(), type: 'upgrade' as const, amount: -next.cost,
      desc: `Upgraded to ${next.name}`,
      date: new Date().toLocaleString(),
    }, ...prev].slice(0, 50));
  };

  const randomPrompt = () => {
    setMemoryText(memoryPrompts[Math.floor(Math.random() * memoryPrompts.length)]);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#E0E0E0', position: 'relative', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(251,191,36,0.2)', animation: `float ${6 + p.delay}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`, pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes coinSpin { 0%{transform:rotateY(0)} 100%{transform:rotateY(360deg)} }
        @keyframes sparkle { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0) translateY(-30px)} }
        @keyframes mineShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-3px)} 75%{transform:translateX(3px)} }
        .glass { backdrop-filter:blur(16px);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px }
      `}</style>

      <header style={{ position:'sticky',top:0,zIndex:50,backdropFilter:'blur(20px)',background:'rgba(5,5,16,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,maxWidth:800,margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'#888',textDecoration:'none',fontSize:20 }}>←</Link>
          <h1 style={{ fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#FBBF24,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            ⛏️ Soul Mining
          </h1>
          <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:20,background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)' }}>
            <span style={{ fontSize:18 }}>🪙</span>
            <span style={{ fontWeight:700,color:'#FBBF24' }}>{coins}</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:800,margin:'0 auto',padding:'24px 16px',position:'relative',zIndex:1 }}>
        {/* Mining Area */}
        <div className="glass" style={{ padding:24,marginBottom:24,textAlign:'center',position:'relative',overflow:'hidden' }}>
          {sparkles.map(s => (
            <div key={s.id} style={{
              position:'absolute',left:`${s.x}%`,top:`${s.y}%`,fontSize:16,
              animation:'sparkle 0.6s ease-out forwards',pointerEvents:'none',
            }}>✨</div>
          ))}
          <div style={{ fontSize:64,transform:`rotate(${pickaxeAngle}deg)`,transition:'transform 0.2s',display:'inline-block' }}>
            {currentPickaxe.emoji}
          </div>
          <h2 style={{ fontSize:22,fontWeight:700,color:'#FBBF24',marginTop:12 }}>{currentPickaxe.name}</h2>
          <p style={{ color:'#888',fontSize:13 }}>Mining Power: {miningRate}x • Daily: {minedToday}/{DAILY_LIMIT} coins</p>
          <div style={{ marginTop:8,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3 }}>
            <div style={{ height:'100%',width:`${(minedToday/DAILY_LIMIT)*100}%`,background:'linear-gradient(90deg,#FBBF24,#F59E0B)',borderRadius:3,transition:'width 0.5s' }} />
          </div>
        </div>

        {/* Mining Input */}
        <div className="glass" style={{ padding:20,marginBottom:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12 }}>
            <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa' }}>Add a Memory to Mine</h3>
            <button onClick={randomPrompt} style={{ padding:'4px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#888',cursor:'pointer',fontSize:12 }}>
              💡 Random
            </button>
          </div>
          <textarea value={memoryText} onChange={e => setMemoryText(e.target.value)} placeholder="Share a deep memory to mine soul coins..."
            rows={3} style={{ width:'100%',padding:12,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.3)',color:'#E0E0E0',fontSize:14,resize:'none',boxSizing:'border-box',marginBottom:12 }} />
          <button onClick={mineMemory} disabled={mining || !memoryText.trim() || minedToday >= DAILY_LIMIT}
            style={{ width:'100%',padding:14,borderRadius:12,border:'none',background:mining?'#F59E0B':'linear-gradient(135deg,#FBBF24,#F59E0B)',color:'#050510',fontWeight:700,cursor:mining?'wait':'pointer',fontSize:16,opacity:!memoryText.trim()||minedToday>=DAILY_LIMIT?0.5:1 }}>
            {mining ? '⛏️ Mining...' : minedToday >= DAILY_LIMIT ? 'Daily Limit Reached' : '⛏️ Mine Soul Coins'}
          </button>
        </div>

        {/* Pickaxe Upgrades */}
        <div className="glass" style={{ padding:20,marginBottom:24 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>Pickaxe Upgrades</h3>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {pickaxes.map((p, i) => {
              const active = pickaxeLevel === p.level;
              const locked = pickaxeLevel < p.level;
              const canBuy = pickaxeLevel === p.level && coins >= p.cost;
              return (
                <div key={p.level} style={{ display:'flex',alignItems:'center',gap:12,padding:12,borderRadius:12,background:active?'rgba(251,191,36,0.1)':'rgba(255,255,255,0.02)',border:active?'1px solid rgba(251,191,36,0.3)':'1px solid rgba(255,255,255,0.05)',opacity:locked?0.4:1 }}>
                  <span style={{ fontSize:28 }}>{p.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600,fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12,color:'#888' }}>Power: {p.power}x</div>
                  </div>
                  {active && pickaxeLevel < pickaxes.length ? (
                    <button onClick={upgradePickaxe} disabled={!canBuy}
                      style={{ padding:'6px 14px',borderRadius:8,border:'none',background:canBuy?'linear-gradient(135deg,#FBBF24,#F59E0B)':'rgba(255,255,255,0.1)',color:canBuy?'#050510':'#666',fontWeight:600,cursor:canBuy?'pointer':'default',fontSize:13 }}>
                      {p.cost} 🪙
                    </button>
                  ) : locked ? (
                    <span style={{ fontSize:13,color:'#555' }}>🔒</span>
                  ) : (
                    <span style={{ fontSize:13,color:'#4ADE80' }}>✓ Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History */}
        <div className="glass" style={{ padding:20 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>Transaction History</h3>
          {transactions.length === 0 ? (
            <p style={{ color:'#555',textAlign:'center',padding:20 }}>No transactions yet. Start mining!</p>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              {transactions.slice(0, 20).map(tx => (
                <div key={tx.id} style={{ display:'flex',alignItems:'center',gap:12,padding:10,borderRadius:10,background:'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontSize:20 }}>{tx.type === 'mine' ? '⛏️' : '⬆️'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13 }}>{tx.desc}</div>
                    <div style={{ fontSize:11,color:'#666' }}>{tx.date}</div>
                  </div>
                  <span style={{ fontWeight:700,color:tx.amount > 0 ? '#4ADE80' : '#F87171',fontSize:14 }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
