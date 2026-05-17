'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Memory {
  id: string;
  text: string;
  mood: 'sunny' | 'rainy' | 'stormy' | 'cloudy' | 'rainbow' | 'snowy';
  intensity: number;
  date: string;
}

const moodConfig = {
  sunny: { emoji: '☀️', label: 'Happy', color: '#FFD700', bg: 'rgba(255,215,0,0.08)' },
  rainy: { emoji: '🌧️', label: 'Sad', color: '#4A90D9', bg: 'rgba(74,144,217,0.08)' },
  stormy: { emoji: '⛈️', label: 'Angry', color: '#FF4444', bg: 'rgba(255,68,68,0.08)' },
  cloudy: { emoji: '☁️', label: 'Anxious', color: '#9E9E9E', bg: 'rgba(158,158,158,0.08)' },
  rainbow: { emoji: '🌈', label: 'Hopeful', color: '#E040FB', bg: 'rgba(224,64,251,0.08)' },
  snowy: { emoji: '❄️', label: 'Peaceful', color: '#B3E5FC', bg: 'rgba(179,229,252,0.08)' },
};

const defaultMemories: Memory[] = [
  { id: '1', text: 'First day at new school', mood: 'cloudy', intensity: 7, date: '2024-01-15' },
  { id: '2', text: 'Graduated with honors', mood: 'sunny', intensity: 10, date: '2024-03-20' },
  { id: '3', text: 'Lost a dear friend', mood: 'rainy', intensity: 9, date: '2024-05-10' },
  { id: '4', text: 'Got the dream job offer', mood: 'rainbow', intensity: 8, date: '2024-06-01' },
  { id: '5', text: 'Argument with family', mood: 'stormy', intensity: 6, date: '2024-07-15' },
  { id: '6', text: 'Quiet evening by the lake', mood: 'snowy', intensity: 5, date: '2024-08-22' },
  { id: '7', text: 'Reunited with old friend', mood: 'sunny', intensity: 9, date: '2024-09-10' },
  { id: '8', text: 'Started meditation practice', mood: 'snowy', intensity: 4, date: '2024-10-05' },
];

const forecast = [
  { day: 'Mon', mood: 'sunny' as const, probability: 72 },
  { day: 'Tue', mood: 'cloudy' as const, probability: 55 },
  { day: 'Wed', mood: 'rainbow' as const, probability: 80 },
  { day: 'Thu', mood: 'rainy' as const, probability: 40 },
  { day: 'Fri', mood: 'sunny' as const, probability: 65 },
  { day: 'Sat', mood: 'snowy' as const, probability: 88 },
  { day: 'Sun', mood: 'rainbow' as const, probability: 70 },
];

export default function MemoryWeather() {
  const t = useT();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState('');
  const [newMood, setNewMood] = useState<Memory['mood']>('sunny');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('memory-weather');
    if (stored) setMemories(JSON.parse(stored));
    else setMemories(defaultMemories);
    const p = Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (memories.length > 0) localStorage.setItem('memory-weather', JSON.stringify(memories));
  }, [memories]);

  const addMemory = () => {
    if (!newText.trim()) return;
    setMemories(prev => [...prev, {
      id: Date.now().toString(), text: newText, mood: newMood,
      intensity: Math.floor(Math.random() * 5) + 5, date: new Date().toISOString().split('T')[0],
    }]);
    setNewText('');
    setShowAdd(false);
  };

  const moodCounts = memories.reduce((acc, m) => { acc[m.mood] = (acc[m.mood] || 0) + 1; return acc; }, {} as Record<string, number>);
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as Memory['mood'] || 'sunny';

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#E0E0E0', position: 'relative', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', animation: `float ${6 + p.delay}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`, pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(180deg)} }
        @keyframes rain { 0%{transform:translateY(-10px);opacity:0} 50%{opacity:1} 100%{transform:translateY(100vh);opacity:0} }
        @keyframes snow { 0%{transform:translateY(0) rotate(0)} 100%{transform:translateY(100vh) rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes lightning { 0%,90%,100%{opacity:0} 92%,95%{opacity:0.8} }
        .weather-card { backdrop-filter:blur(16px);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;transition:all 0.3s }
        .weather-card:hover { background:rgba(255,255,255,0.08);transform:translateY(-2px) }
        .mood-btn { padding:8px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);cursor:pointer;transition:all 0.2s;font-size:14px }
        .mood-btn:hover,.mood-btn.active { border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.1) }
      `}</style>

      <header style={{ position:'sticky',top:0,zIndex:50,backdropFilter:'blur(20px)',background:'rgba(5,5,16,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,maxWidth:800,margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'#888',textDecoration:'none',fontSize:20 }}>←</Link>
          <h1 style={{ fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#FFD700,#E040FB)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            🌤️ {t('memory weather')}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth:800,margin:'0 auto',padding:'24px 16px',position:'relative',zIndex:1 }}>
        {/* Current Weather */}
        <div className="weather-card" style={{ textAlign:'center',marginBottom:24 }}>
          <div style={{ fontSize:72,marginBottom:8 }}>{moodConfig[dominantMood].emoji}</div>
          <h2 style={{ fontSize:24,fontWeight:700,color:moodConfig[dominantMood].color }}>{moodConfig[dominantMood].label}</h2>
          <p style={{ color:'#888',marginTop:4 }}>Dominant emotional climate • {memories.length} memories</p>
        </div>

        {/* Forecast */}
        <div className="weather-card" style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:16,fontWeight:600,marginBottom:16,color:'#aaa' }}>{t('forecast')}</h3>
          <div style={{ display:'flex',gap:12,overflowX:'auto',paddingBottom:8 }}>
            {forecast.map((f, i) => (
              <div key={i} style={{ textAlign:'center',minWidth:70,flex:1 }}>
                <div style={{ fontSize:12,color:'#888',marginBottom:8 }}>{f.day}</div>
                <div style={{ fontSize:32,marginBottom:8 }}>{moodConfig[f.mood].emoji}</div>
                <div style={{ height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden' }}>
                  <div style={{ height:'100%',width:`${f.probability}%`,background:moodConfig[f.mood].color,borderRadius:2,transition:'width 0.5s' }} />
                </div>
                <div style={{ fontSize:11,color:'#666',marginTop:4 }}>{f.probability}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="weather-card" style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:16,fontWeight:600,marginBottom:16,color:'#aaa' }}>{t('emotional climate')}</h3>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
            {Object.entries(moodConfig).map(([key, cfg]) => (
              <div key={key} style={{ textAlign:'center',padding:12,borderRadius:12,background:cfg.bg }}>
                <div style={{ fontSize:28 }}>{cfg.emoji}</div>
                <div style={{ fontSize:13,color:cfg.color,fontWeight:600 }}>{cfg.label}</div>
                <div style={{ fontSize:12,color:'#666' }}>{moodCounts[key] || 0} memories</div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Memory Button */}
        <button onClick={() => setShowAdd(!showAdd)} style={{ width:'100%',padding:14,borderRadius:14,border:'1px dashed rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.02)',color:'#888',cursor:'pointer',fontSize:15,marginBottom:24 }}>
          {showAdd ? '✕ Cancel' : '＋ Add Memory Weather'}
        </button>

        {showAdd && (
          <div className="weather-card" style={{ marginBottom:24 }}>
            <input value={newText} onChange={e => setNewText(e.target.value)} placeholder="Describe the memory..."
              style={{ width:'100%',padding:12,borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(0,0,0,0.3)',color:'#E0E0E0',fontSize:14,marginBottom:12,boxSizing:'border-box' }} />
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:12 }}>
              {Object.entries(moodConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setNewMood(key as Memory['mood'])}
                  className={`mood-btn ${newMood === key ? 'active' : ''}`}
                  style={{ color:cfg.color,borderColor:newMood===key?cfg.color:'rgba(255,255,255,0.1)' }}>
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
            <button onClick={addMemory} style={{ width:'100%',padding:12,borderRadius:10,border:'none',background:'linear-gradient(135deg,#FFD700,#E040FB)',color:'#050510',fontWeight:700,cursor:'pointer',fontSize:15 }}>
              Save Memory
            </button>
          </div>
        )}

        {/* Memory Map */}
        <h3 style={{ fontSize:16,fontWeight:600,marginBottom:16,color:'#aaa' }}>Memory Weather Map</h3>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {memories.slice().reverse().map(mem => {
            const cfg = moodConfig[mem.mood];
            return (
              <div key={mem.id} className="weather-card" style={{ borderLeft:`3px solid ${cfg.color}` }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontSize:15,fontWeight:500 }}>{mem.text}</div>
                    <div style={{ fontSize:12,color:'#666',marginTop:4 }}>{mem.date}</div>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:28 }}>{cfg.emoji}</div>
                    <div style={{ fontSize:11,color:cfg.color }}>{cfg.label}</div>
                  </div>
                </div>
                <div style={{ marginTop:8,height:3,background:'rgba(255,255,255,0.06)',borderRadius:2 }}>
                  <div style={{ height:'100%',width:`${mem.intensity * 10}%`,background:cfg.color,borderRadius:2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
