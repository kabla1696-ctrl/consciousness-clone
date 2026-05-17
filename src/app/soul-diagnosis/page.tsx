'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Metric {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
  trend: 'up' | 'down' | 'stable';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  icon: string;
}

interface MoodEntry {
  date: string;
  mood: number;
  energy: number;
  stress: number;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#34d399',
};

export default function SoulDiagnosis() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month'>('week');
  const [scanning, setScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('soul-diagnosis');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setMetrics(data.metrics || defaultMetrics);
        setRecommendations(data.recommendations || defaultRecommendations);
        setMoodHistory(data.moodHistory || defaultMoodHistory);
        setScanning(false);
      } catch { initDefaults(); }
    } else {
      initDefaults();
    }
  }, []);

  const initDefaults = () => {
    setMetrics(defaultMetrics);
    setRecommendations(defaultRecommendations);
    setMoodHistory(defaultMoodHistory);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setScanning(false); return 100; }
        return prev + 2;
      });
    }, 40);
  };

  useEffect(() => {
    if (!scanning && metrics.length) {
      localStorage.setItem('soul-diagnosis', JSON.stringify({ metrics, recommendations, moodHistory }));
    }
  }, [metrics, recommendations, moodHistory, scanning]);

  const defaultMetrics: Metric[] = [
    { label: 'Stress Level', value: 42, max: 100, color: '#f87171', icon: '😰', trend: 'down' },
    { label: 'Happiness Index', value: 78, max: 100, color: '#34d399', icon: '😊', trend: 'up' },
    { label: 'Anxiety Level', value: 35, max: 100, color: '#fbbf24', icon: '😟', trend: 'down' },
    { label: 'Energy Score', value: 65, max: 100, color: '#60a5fa', icon: '⚡', trend: 'stable' },
    { label: 'Focus', value: 72, max: 100, color: '#a78bfa', icon: '🎯', trend: 'up' },
    { label: 'Sleep Quality', value: 68, max: 100, color: '#818cf8', icon: '😴', trend: 'stable' },
  ];

  const defaultRecommendations: Recommendation[] = [
    { id: '1', title: 'Practice Deep Breathing', description: 'Your stress levels are elevated. Try 5 minutes of box breathing daily.', priority: 'high', category: 'Stress', icon: '🫁' },
    { id: '2', title: 'Maintain Sleep Schedule', description: 'Your sleep quality is moderate. Try consistent sleep/wake times.', priority: 'medium', category: 'Sleep', icon: '🌙' },
    { id: '3', title: 'Physical Activity', description: 'Energy could be higher. Even a 15-minute walk helps.', priority: 'medium', category: 'Energy', icon: '🏃' },
    { id: '4', title: 'Digital Detox', description: 'Screen time may be affecting focus. Take 30-min breaks.', priority: 'low', category: 'Focus', icon: '📵' },
    { id: '5', title: 'Gratitude Journaling', description: 'Writing 3 things you\'re grateful for boosts happiness.', priority: 'low', category: 'Happiness', icon: '📝' },
  ];

  const defaultMoodHistory: MoodEntry[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    mood: Math.floor(Math.random() * 30) + 55,
    energy: Math.floor(Math.random() * 25) + 50,
    stress: Math.floor(Math.random() * 30) + 25,
  }));

  const overallScore = metrics.length ? Math.round(metrics.reduce((s, m) => {
    const inverted = m.label.includes('Stress') || m.label.includes('Anxiety');
    return s + (inverted ? (m.max - m.value) : m.value);
  }, 0) / metrics.length) : 0;

  const GaugeRing = ({ value, max, color, size = 100 }: { value: number; max: number; color: string; size?: number }) => {
    const pct = value / max;
    const circumference = Math.PI * (size - 16);
    const offset = circumference * (1 - pct);
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={(size-16)/2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={(size-16)/2} fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
    );
  };

  const MiniGraph = ({ data, color, height = 60 }: { data: number[]; color: string; height?: number }) => {
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${height - (v / max) * (height - 10)}`).join(' ');
    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${points} 100,${height}`} fill={`url(#grad-${color.replace('#','')})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  };

  if (scanning) {
    return (
      <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }`}</style>
        <div style={{ fontSize: 64, marginBottom: 24, animation: 'pulse 1.5s infinite' }}>🧠</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scanning Your Soul...</h2>
        <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>Analyzing consciousness patterns</p>
        <div style={{ width: 240, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg,#a78bfa,#6366f1)', borderRadius: 3, transition: 'width .1s linear' }} />
        </div>
        <span style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>{scanProgress}%</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.15} 50%{transform:translateY(-20px) scale(1.1);opacity:.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .metric-card{transition:all .3s ease}
        .metric-card:hover{transform:translateY(-3px);background:rgba(255,255,255,0.06)!important}
        .rec-card{transition:all .3s ease}
        .rec-card:hover{transform:translateX(4px)}
      `}</style>

      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', width: 3, height: 3, borderRadius: '50%', background: ['#a78bfa','#818cf8','#6366f1','#c4b5fd'][i%4], left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `particleFloat ${4+Math.random()*4}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>🧠 Soul Diagnosis</h1>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.1), transparent 70%)' }} />
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
            <GaugeRing value={overallScore} max={100} color={overallScore > 70 ? '#34d399' : overallScore > 40 ? '#fbbf24' : '#f87171'} size={140} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: overallScore > 70 ? '#34d399' : overallScore > 40 ? '#fbbf24' : '#f87171' }}>{overallScore}</span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>Overall</span>
            </div>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 600 }}>Soul Health Score</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>{overallScore > 70 ? 'Your soul is thriving ✨' : overallScore > 40 ? 'Your soul needs some care 🌱' : 'Time for deep healing 💚'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
          {metrics.map((m, i) => (
            <div key={i} className="metric-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', animation: `fadeIn .5s ease forwards`, animationDelay: `${i * 0.1}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{m.label}</span>
                </div>
                <span style={{ fontSize: 12, color: m.trend === 'up' ? '#34d399' : m.trend === 'down' ? '#f87171' : '#94a3b8' }}>
                  {m.trend === 'up' ? '↑' : m.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <GaugeRing value={m.value} max={m.max} color={m.color} size={70} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: m.color }}>{m.value}<span style={{ fontSize: 14, color: '#64748b' }}>/{m.max}</span></div>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ width: `${(m.value/m.max)*100}%`, height: '100%', background: m.color, borderRadius: 4, transition: 'width 1s ease' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Mood Trends</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setViewPeriod(p)} style={{ padding: '4px 12px', borderRadius: 8, border: viewPeriod === p ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)', background: viewPeriod === p ? 'rgba(167,139,250,0.12)' : 'transparent', color: viewPeriod === p ? '#a78bfa' : '#64748b', cursor: 'pointer', fontSize: 12 }}>{p === 'week' ? '7D' : '30D'}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 12 }}>
            {[
              { label: 'Mood', color: '#34d399', data: moodHistory.slice(viewPeriod === 'week' ? -7 : -30).map(d => d.mood) },
              { label: 'Energy', color: '#60a5fa', data: moodHistory.slice(viewPeriod === 'week' ? -7 : -30).map(d => d.energy) },
              { label: 'Stress', color: '#f87171', data: moodHistory.slice(viewPeriod === 'week' ? -7 : -30).map(d => d.stress) },
            ].map((g, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{g.label}</div>
                <MiniGraph data={g.data} color={g.color} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>💡 Recommendations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recommendations.map(rec => (
              <div key={rec.id} className="rec-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 18, border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${PRIORITY_COLORS[rec.priority]}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{rec.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{rec.title}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: `${PRIORITY_COLORS[rec.priority]}20`, color: PRIORITY_COLORS[rec.priority], textTransform: 'uppercase', fontWeight: 600 }}>{rec.priority}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{rec.description}</p>
                  <span style={{ fontSize: 11, color: '#475569', marginTop: 4, display: 'inline-block' }}>{rec.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
