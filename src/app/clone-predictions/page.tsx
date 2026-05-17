'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Prediction {
  id: string;
  type: 'Next Week' | 'Next Month' | 'Next Year' | '10 Years';
  text: string;
  confidence: number;
  createdAt: string;
  dueDate: string;
  status: 'pending' | 'correct' | 'incorrect' | 'partial';
  category: string;
}

const PREDICTION_TYPES = ['All', 'Next Week', 'Next Month', 'Next Year', '10 Years'] as const;

const TYPE_COLORS: Record<string, string> = {
  'Next Week': '#34d399',
  'Next Month': '#60a5fa',
  'Next Year': '#a78bfa',
  '10 Years': '#f59e0b',
};

const samplePredictions: Prediction[] = [
  { id: '1', type: 'Next Week', text: 'You will have a breakthrough idea during a morning walk', confidence: 78, createdAt: '2026-05-10', dueDate: '2026-05-17', status: 'pending', category: 'Creativity' },
  { id: '2', type: 'Next Week', text: 'An old friend will reach out unexpectedly', confidence: 65, createdAt: '2026-05-10', dueDate: '2026-05-17', status: 'pending', category: 'Social' },
  { id: '3', type: 'Next Month', text: 'You will start learning a new skill that changes your perspective', confidence: 82, createdAt: '2026-05-01', dueDate: '2026-06-01', status: 'pending', category: 'Growth' },
  { id: '4', type: 'Next Month', text: 'A financial opportunity will present itself', confidence: 54, createdAt: '2026-05-01', dueDate: '2026-06-01', status: 'pending', category: 'Career' },
  { id: '5', type: 'Next Year', text: 'You will relocate or travel to a place that feels like home', confidence: 71, createdAt: '2026-01-01', dueDate: '2027-01-01', status: 'pending', category: 'Life' },
  { id: '6', type: 'Next Year', text: 'A creative project will bring you recognition', confidence: 68, createdAt: '2026-01-01', dueDate: '2027-01-01', status: 'pending', category: 'Career' },
  { id: '7', type: '10 Years', text: 'You will be recognized as an expert in your field', confidence: 45, createdAt: '2026-01-01', dueDate: '2036-01-01', status: 'pending', category: 'Career' },
  { id: '8', type: '10 Years', text: 'You will have built something that outlasts you', confidence: 38, createdAt: '2026-01-01', dueDate: '2036-01-01', status: 'pending', category: 'Legacy' },
  { id: '9', type: 'Next Week', text: 'You will solve a problem that has been bothering you', confidence: 85, createdAt: '2026-05-03', dueDate: '2026-05-10', status: 'correct', category: 'Personal' },
  { id: '10', type: 'Next Month', text: 'You will meet someone who inspires you', confidence: 73, createdAt: '2026-04-01', dueDate: '2026-05-01', status: 'correct', category: 'Social' },
  { id: '11', type: 'Next Week', text: 'A surprise expense will come up', confidence: 60, createdAt: '2026-04-20', dueDate: '2026-04-27', status: 'incorrect', category: 'Finance' },
  { id: '12', type: 'Next Year', text: 'You will adopt a new daily ritual', confidence: 77, createdAt: '2025-01-01', dueDate: '2026-01-01', status: 'correct', category: 'Lifestyle' },
];

const predictionTemplates: Record<string, string[]> = {
  'Next Week': [
    'A conversation this week will shift your thinking',
    'You will discover something new about yourself',
    'An unexpected opportunity will knock',
    'A small act of kindness will return to you tenfold',
    'You will find clarity on a decision you\'ve been avoiding',
  ],
  'Next Month': [
    'A new connection will open doors you didn\'t know existed',
    'You will overcome a fear that has held you back',
    'A creative block will dissolve unexpectedly',
    'Financial stability will improve through an unexpected channel',
    'You will find your rhythm in a new routine',
  ],
  'Next Year': [
    'A passion project will evolve into something meaningful',
    'You will look back and see this year as a turning point',
    'A relationship will deepen in ways you didn\'t expect',
    'You will discover a hidden talent',
    'Your definition of success will fundamentally change',
  ],
  '10 Years': [
    'You will be living a life that your current self would marvel at',
    'The seeds you plant today will have grown into a forest',
    'You will have touched more lives than you can count',
    'A dream you think is impossible will have come true twice over',
    'You will look back with gratitude, not regret',
  ],
};

export default function ClonePredictions() {
  const t = useT();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [generating, setGenerating] = useState(false);
  const [crystalBallPulse, setCrystalBallPulse] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('clone-predictions');
    if (stored) {
      try { setPredictions(JSON.parse(stored)); } catch { setPredictions(samplePredictions); }
    } else {
      setPredictions(samplePredictions);
    }
  }, []);

  useEffect(() => {
    if (predictions.length) localStorage.setItem('clone-predictions', JSON.stringify(predictions));
  }, [predictions]);

  const filtered = selectedType === 'All' ? predictions : predictions.filter(p => p.type === selectedType);
  const pending = predictions.filter(p => p.status === 'pending').length;
  const correct = predictions.filter(p => p.status === 'correct').length;
  const totalResolved = predictions.filter(p => p.status !== 'pending').length;
  const accuracy = totalResolved > 0 ? Math.round((correct / totalResolved) * 100) : 0;

  const generatePrediction = () => {
    setGenerating(true);
    setCrystalBallPulse(true);
    const types: Prediction['type'][] = ['Next Week', 'Next Month', 'Next Year', '10 Years'];
    const type = types[Math.floor(Math.random() * types.length)];
    const templates = predictionTemplates[type];
    const text = templates[Math.floor(Math.random() * templates.length)];
    const categories = ['Creativity', 'Social', 'Career', 'Personal', 'Lifestyle', 'Finance', 'Growth', 'Life', 'Legacy'];
    const now = new Date();
    const dueMap: Record<string, number> = { 'Next Week': 7, 'Next Month': 30, 'Next Year': 365, '10 Years': 3650 };
    const due = new Date(now.getTime() + dueMap[type] * 86400000);

    setTimeout(() => {
      const newPred: Prediction = {
        id: Date.now().toString(),
        type,
        text,
        confidence: Math.floor(Math.random() * 40) + 40,
        createdAt: now.toISOString().split('T')[0],
        dueDate: due.toISOString().split('T')[0],
        status: 'pending',
        category: categories[Math.floor(Math.random() * categories.length)],
      };
      setPredictions(prev => [newPred, ...prev]);
      setGenerating(false);
      setCrystalBallPulse(false);
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.2} 50%{transform:translateY(-30px) scale(1.3);opacity:.5} }
        @keyframes crystalPulse { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.3)} 50%{box-shadow:0 0 60px rgba(139,92,246,0.8),0 0 100px rgba(99,102,241,0.4)} }
        @keyframes crystalSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .pred-card{animation:fadeInUp .5s ease forwards;transition:all .3s ease}
        .pred-card:hover{transform:translateY(-3px);background:rgba(255,255,255,0.06)!important}
      `}</style>

      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', width: 3, height: 3, borderRadius: '50%', background: ['#a78bfa','#818cf8','#6366f1','#c4b5fd'][i%4], left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `particleFloat ${4+Math.random()*4}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>🔮 {t('predictions')}</h1>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 160, height: 160, margin: '0 auto 20px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(139,92,246,0.3), rgba(99,102,241,0.1), rgba(5,5,16,0.8))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(139,92,246,0.3)', animation: crystalBallPulse ? 'crystalPulse 1s infinite' : 'none', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.15), transparent 60%)' }} />
            {generating && <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '2px solid rgba(139,92,246,0.3)', animation: 'crystalSpin 2s linear infinite' }} />}
            <span style={{ fontSize: 64, zIndex: 1, filter: generating ? 'brightness(1.5)' : 'none' }}>🔮</span>
          </div>
          <button onClick={generatePrediction} disabled={generating} style={{ padding: '12px 32px', borderRadius: 24, border: '1px solid #a78bfa', background: generating ? 'rgba(167,139,250,0.1)' : 'linear-gradient(135deg,rgba(167,139,250,0.2),rgba(99,102,241,0.2))', color: '#a78bfa', cursor: generating ? 'wait' : 'pointer', fontSize: 15, fontWeight: 600, transition: 'all .3s' }}>
            {generating ? `✨ ${t('your future')}...` : `✨ ${t('ai predicts')}`}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Pending', value: pending, color: '#60a5fa' },
            { label: 'Accuracy', value: `${accuracy}%`, color: '#34d399' },
            { label: 'Resolved', value: totalResolved, color: '#a78bfa' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {PREDICTION_TYPES.map(type => (
            <button key={type} onClick={() => setSelectedType(type)} style={{ padding: '8px 16px', borderRadius: 20, border: selectedType === type ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)', background: selectedType === type ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: selectedType === type ? '#a78bfa' : '#94a3b8', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', transition: 'all .2s' }}>{type}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((pred, i) => (
            <div key={pred.id} className="pred-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.06)', animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${TYPE_COLORS[pred.type]}20`, color: TYPE_COLORS[pred.type] }}>{pred.type}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{pred.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pred.status === 'correct' && <span style={{ color: '#34d399', fontSize: 12 }}>✓</span>}
                  {pred.status === 'incorrect' && <span style={{ color: '#f87171', fontSize: 12 }}>✗</span>}
                  {pred.status === 'pending' && <span style={{ color: '#60a5fa', fontSize: 12 }}>⏳</span>}
                </div>
              </div>
              <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.6, color: '#e2e8f0' }}>{pred.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{t('probability')}</span>
                  <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pred.confidence}%`, height: '100%', background: `linear-gradient(90deg,${TYPE_COLORS[pred.type]},${TYPE_COLORS[pred.type]}88)`, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TYPE_COLORS[pred.type] }}>{pred.confidence}%</span>
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>Due: {pred.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
