'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ArtPiece {
  id: string;
  memory: string;
  style: string;
  title: string;
  createdAt: string;
  colors: string[];
}

const ART_STYLES = ['Watercolor', 'Oil Painting', 'Pixel Art', 'Sketch', 'Abstract'] as const;

const STYLE_ICONS: Record<string, string> = {
  'Watercolor': '💧',
  'Oil Painting': '🎨',
  'Pixel Art': '👾',
  'Sketch': '✏️',
  'Abstract': '🌀',
};

const STYLE_GRADIENTS: Record<string, string> = {
  'Watercolor': 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
  'Oil Painting': 'linear-gradient(135deg, #c2956b, #8b6914, #d4a574)',
  'Pixel Art': 'linear-gradient(135deg, #00ff87, #60efff, #ff00e5)',
  'Sketch': 'linear-gradient(135deg, #2d3436, #636e72, #b2bec3)',
  'Abstract': 'linear-gradient(135deg, #f5af19, #f12711, #7b4397)',
};

const generateArtColors = (style: string): string[] => {
  const palettes: Record<string, string[][]> = {
    'Watercolor': [['#667eea','#764ba2','#f093fb'],['#a8edea','#fed6e3','#d4fc79'],['#89f7fe','#66a6ff','#c471f5']],
    'Oil Painting': [['#c2956b','#8b6914','#d4a574'],['#2c3e50','#3498db','#e74c3c'],['#8e44ad','#f39c12','#1abc9c']],
    'Pixel Art': [['#00ff87','#60efff','#ff00e5'],['#ff6b6b','#feca57','#48dbfb'],['#ff9ff3','#54a0ff','#5f27cd']],
    'Sketch': [['#2d3436','#636e72','#b2bec3'],['#1a1a2e','#16213e','#0f3460'],['#333333','#666666','#999999']],
    'Abstract': [['#f5af19','#f12711','#7b4397'],['#00c9ff','#92fe9d','#f9f586'],['#fc5c7d','#6a82fb','#fc5c7d']],
  };
  const p = palettes[style] || palettes['Abstract'];
  return p[Math.floor(Math.random() * p.length)];
};

const sampleArt: ArtPiece[] = [
  { id: '1', memory: 'The sunset at Cox\'s Bazar, waves crashing as the sky turned purple', style: 'Watercolor', title: 'Golden Shores', createdAt: '2026-05-10', colors: ['#667eea','#764ba2','#f093fb'] },
  { id: '2', memory: 'Late night coding session, coffee growing cold, breakthrough at 3am', style: 'Pixel Art', title: 'Midnight Compile', createdAt: '2026-05-08', colors: ['#00ff87','#60efff','#ff00e5'] },
  { id: '3', memory: 'Grandmother\'s kitchen, smell of biryani, laughter echoing', style: 'Oil Painting', title: 'Kitchen Memories', createdAt: '2026-05-05', colors: ['#c2956b','#8b6914','#d4a574'] },
  { id: '4', memory: 'Walking alone in rain, feeling completely at peace', style: 'Sketch', title: 'Rain Walker', createdAt: '2026-05-01', colors: ['#2d3436','#636e72','#b2bec3'] },
  { id: '5', memory: 'The moment I realized I was happy, truly happy', style: 'Abstract', title: 'Pure Joy', createdAt: '2026-04-28', colors: ['#f5af19','#f12711','#7b4397'] },
  { id: '6', memory: 'First day at university, nervous but excited', style: 'Watercolor', title: 'New Beginnings', createdAt: '2026-04-25', colors: ['#89f7fe','#66a6ff','#c471f5'] },
];

export default function MemoryArtist() {
  const [artworks, setArtworks] = useState<ArtPiece[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('Watercolor');
  const [memoryInput, setMemoryInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const stored = localStorage.getItem('memory-artworks');
    if (stored) {
      try { setArtworks(JSON.parse(stored)); } catch { setArtworks(sampleArt); }
    } else {
      setArtworks(sampleArt);
    }
  }, []);

  useEffect(() => {
    if (artworks.length) localStorage.setItem('memory-artworks', JSON.stringify(artworks));
  }, [artworks]);

  const generateArt = () => {
    if (!memoryInput.trim()) return;
    setGenerating(true);
    const words = memoryInput.split(' ').slice(0, 5);
    const title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    setTimeout(() => {
      const newArt: ArtPiece = {
        id: Date.now().toString(),
        memory: memoryInput,
        style: selectedStyle,
        title: title || 'Untitled',
        createdAt: new Date().toISOString().split('T')[0],
        colors: generateArtColors(selectedStyle),
      };
      setArtworks(prev => [newArt, ...prev]);
      setMemoryInput('');
      setGenerating(false);
    }, 2500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.2} 50%{transform:translateY(-20px) scale(1.2);opacity:.5} }
        @keyframes artGenerate { 0%{opacity:0;transform:scale(0.8) rotate(-5deg)} 50%{opacity:1;transform:scale(1.05) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .art-card{transition:all .3s ease}
        .art-card:hover{transform:translateY(-6px) scale(1.02)}
        .style-btn{transition:all .2s}
        .style-btn:hover{transform:scale(1.05)}
      `}</style>

      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', width: 4, height: 4, borderRadius: '50%', background: ['#f093fb','#667eea','#764ba2','#fed6e3'][i%4], left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `particleFloat ${3+Math.random()*4}s ease-in-out infinite`, animationDelay: `${Math.random()*3}s`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{ color: '#f093fb', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#f093fb,#667eea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>🎨 Memory AI Artist</h1>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <textarea value={memoryInput} onChange={e => setMemoryInput(e.target.value)} placeholder="Describe a memory to transform into art..." style={{ width: '100%', minHeight: 80, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, color: '#e2e8f0', fontSize: 15, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none' }} />

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>Art Style</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ART_STYLES.map(style => (
                <button key={style} onClick={() => setSelectedStyle(style)} className="style-btn" style={{ padding: '10px 16px', borderRadius: 12, border: selectedStyle === style ? '2px solid #f093fb' : '1px solid rgba(255,255,255,0.1)', background: selectedStyle === style ? 'rgba(240,147,251,0.12)' : 'rgba(255,255,255,0.04)', color: selectedStyle === style ? '#f093fb' : '#94a3b8', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{STYLE_ICONS[style]}</span> {style}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateArt} disabled={generating || !memoryInput.trim()} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: generating ? 'rgba(240,147,251,0.2)' : 'linear-gradient(135deg,#f093fb,#667eea)', color: '#fff', cursor: generating || !memoryInput.trim() ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600, opacity: generating || !memoryInput.trim() ? 0.6 : 1 }}>
            {generating ? '🎨 Creating your masterpiece...' : '✨ Transform Memory into Art'}
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Gallery ({artworks.length})</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 12px', borderRadius: 8, border: viewMode === 'grid' ? '1px solid #f093fb' : '1px solid rgba(255,255,255,0.1)', background: viewMode === 'grid' ? 'rgba(240,147,251,0.1)' : 'transparent', color: viewMode === 'grid' ? '#f093fb' : '#64748b', cursor: 'pointer', fontSize: 12 }}>Grid</button>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: 8, border: viewMode === 'list' ? '1px solid #f093fb' : '1px solid rgba(255,255,255,0.1)', background: viewMode === 'list' ? 'rgba(240,147,251,0.1)' : 'transparent', color: viewMode === 'list' ? '#f093fb' : '#64748b', cursor: 'pointer', fontSize: 12 }}>List</button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {artworks.map((art, i) => (
              <div key={art.id} className="art-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', animation: 'artGenerate .6s ease forwards', animationDelay: `${i * 0.08}s` }}>
                <div style={{ height: 160, background: STYLE_GRADIENTS[art.style], position: 'relative', overflow: 'hidden' }}>
                  {art.colors.map((c, ci) => (
                    <div key={ci} style={{ position: 'absolute', width: 60+ci*30, height: 60+ci*30, borderRadius: '50%', background: c, opacity: 0.4, left: `${20+ci*25}%`, top: `${10+ci*20}%`, filter: 'blur(20px)' }} />
                  ))}
                  <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', fontSize: 11, color: '#fff' }}>{STYLE_ICONS[art.style]} {art.style}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#f1f5f9' }}>{art.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{art.memory}</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{art.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {artworks.map(art => (
              <div key={art.id} className="art-card" style={{ display: 'flex', gap: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: STYLE_GRADIENTS[art.style], flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {art.colors.slice(0,2).map((c, ci) => (
                    <div key={ci} style={{ position: 'absolute', width: 40, height: 40, borderRadius: '50%', background: c, opacity: 0.5, left: `${ci*30}%`, top: `${ci*20}%`, filter: 'blur(10px)' }} />
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{art.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{art.memory}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#f093fb' }}>{STYLE_ICONS[art.style]} {art.style}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{art.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
