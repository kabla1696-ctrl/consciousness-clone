'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Gene {
  name: string;
  value: number;
  color: string;
  category: string;
}

const defaultGenes: Gene[] = [
  { name: 'Empathy', value: 85, color: '#FF6B9D', category: 'Emotional' },
  { name: 'Curiosity', value: 92, color: '#C084FC', category: 'Intellectual' },
  { name: 'Resilience', value: 70, color: '#4ADE80', category: 'Emotional' },
  { name: 'Creativity', value: 88, color: '#FB923C', category: 'Intellectual' },
  { name: 'Courage', value: 65, color: '#F87171', category: 'Core' },
  { name: 'Wisdom', value: 78, color: '#60A5FA', category: 'Core' },
  { name: 'Humor', value: 90, color: '#FBBF24', category: 'Social' },
  { name: 'Patience', value: 55, color: '#34D399', category: 'Emotional' },
  { name: 'Loyalty', value: 95, color: '#A78BFA', category: 'Social' },
  { name: 'Intuition', value: 72, color: '#F472B6', category: 'Core' },
  { name: 'Ambition', value: 80, color: '#FB7185', category: 'Core' },
  { name: 'Compassion', value: 88, color: '#2DD4BF', category: 'Emotional' },
];

export default function CloneDNA() {
  const t = useT();
  const [genes, setGenes] = useState<Gene[]>([]);
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [helixRotation, setHelixRotation] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('clone-dna');
    if (stored) setGenes(JSON.parse(stored));
    else setGenes(defaultGenes);
    const p = Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 3 + 1, delay: Math.random() * 5,
    }));
    setParticles(p);
    const interval = setInterval(() => setHelixRotation(r => r + 0.5), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (genes.length > 0) localStorage.setItem('clone-dna', JSON.stringify(genes));
  }, [genes]);

  const mutateGene = (name: string) => {
    setAnimating(true);
    setGenes(prev => prev.map(g =>
      g.name === name ? { ...g, value: Math.min(100, Math.max(0, g.value + Math.floor(Math.random() * 21) - 10)) } : g
    ));
    setTimeout(() => setAnimating(false), 800);
  };

  const totalScore = Math.round(genes.reduce((s, g) => s + g.value, 0) / (genes.length || 1));
  const categories = [...new Set(genes.map(g => g.category))];

  const getHelixPoint = (i: number, total: number, strand: number) => {
    const y = (i / total) * 400 + 40;
    const angle = (i / total) * Math.PI * 4 + helixRotation * 0.02 + strand * Math.PI;
    const x = Math.sin(angle) * 60 + 100;
    return { x, y };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#E0E0E0', position: 'relative', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: 'rgba(192,132,252,0.2)', animation: `float ${6 + p.delay}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`, pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes mutate { 0%{filter:hue-rotate(0deg)} 50%{filter:hue-rotate(180deg)} 100%{filter:hue-rotate(0deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 5px rgba(192,132,252,0.3)} 50%{box-shadow:0 0 20px rgba(192,132,252,0.6)} }
        .glass { backdrop-filter:blur(16px);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px }
        .gene-bar { height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden;transition:all 0.5s }
        .gene-fill { height:100%;border-radius:4px;transition:width 0.8s cubic-bezier(0.4,0,0.2,1) }
      `}</style>

      <header style={{ position:'sticky',top:0,zIndex:50,backdropFilter:'blur(20px)',background:'rgba(5,5,16,0.8)',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'16px 20px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,maxWidth:800,margin:'0 auto' }}>
          <Link href="/dashboard" style={{ color:'#888',textDecoration:'none',fontSize:20 }}>←</Link>
          <h1 style={{ fontSize:20,fontWeight:700,background:'linear-gradient(135deg,#C084FC,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>
            🧬 {t('clone dna')}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth:800,margin:'0 auto',padding:'24px 16px',position:'relative',zIndex:1 }}>
        {/* DNA Helix Visualization */}
        <div className="glass" style={{ padding:24,marginBottom:24,textAlign:'center' }}>
          <svg viewBox="0 0 200 480" style={{ width:'100%',maxWidth:200,height:'auto' }}>
            {Array.from({ length: 20 }).map((_, i) => {
              const p1 = getHelixPoint(i, 20, 0);
              const p2 = getHelixPoint(i, 20, 1);
              const gene = genes[i % genes.length];
              return (
                <g key={i}>
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                  <circle cx={p1.x} cy={p1.y} r={4 + (gene?.value || 50) / 30} fill={gene?.color || '#C084FC'} opacity={0.8} />
                  <circle cx={p2.x} cy={p2.y} r={4 + (gene?.value || 50) / 30} fill={gene?.color || '#60A5FA'} opacity={0.8} />
                </g>
              );
            })}
            {/* Connecting strands */}
            {Array.from({ length: 19 }).map((_, i) => {
              const a = getHelixPoint(i, 20, 0);
              const b = getHelixPoint(i + 1, 20, 0);
              const c = getHelixPoint(i, 20, 1);
              const d = getHelixPoint(i + 1, 20, 1);
              return (
                <g key={`s${i}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(192,132,252,0.3)" strokeWidth={2} />
                  <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="rgba(96,165,250,0.3)" strokeWidth={2} />
                </g>
              );
            })}
          </svg>
          <div style={{ fontSize:32,fontWeight:800,background:'linear-gradient(135deg,#C084FC,#60A5FA)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginTop:8 }}>
            {t('genetic code')}: {totalScore}
          </div>
          <p style={{ color:'#888',fontSize:13 }}>{t('helix')} • {genes.length} {t('traits')}</p>
        </div>

        {/* Category Sections */}
        {categories.map(cat => (
          <div key={cat} className="glass" style={{ padding:20,marginBottom:16 }}>
            <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>{cat} {t('traits')}</h3>
            <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
              {genes.filter(g => g.category === cat).map(gene => (
                <div key={gene.name} onClick={() => setSelectedGene(selectedGene === gene.name ? null : gene.name)}
                  style={{ cursor:'pointer',padding:12,borderRadius:12,background:selectedGene===gene.name?'rgba(192,132,252,0.1)':'transparent',transition:'all 0.3s' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
                    <span style={{ fontWeight:500 }}>{gene.name}</span>
                    <span style={{ color:gene.color,fontWeight:700 }}>{gene.value}%</span>
                  </div>
                  <div className="gene-bar">
                    <div className="gene-fill" style={{ width:`${gene.value}%`,background:gene.color }} />
                  </div>
                  {selectedGene === gene.name && (
                    <div style={{ marginTop:12,display:'flex',gap:8 }}>
                      <button onClick={(e) => { e.stopPropagation(); mutateGene(gene.name); }}
                        style={{ padding:'6px 14px',borderRadius:8,border:'none',background:animating?'#FBBF24':'linear-gradient(135deg,#C084FC,#60A5FA)',color:'#050510',fontWeight:600,cursor:'pointer',fontSize:13 }}>
                        🧬 {t('helix')}
                      </button>
                      <div style={{ fontSize:12,color:'#666',alignSelf:'center' }}>
                        {gene.value >= 80 ? 'Dominant' : gene.value >= 50 ? 'Active' : 'Recessive'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* DNA Analysis */}
        <div className="glass" style={{ padding:20 }}>
          <h3 style={{ fontSize:15,fontWeight:600,color:'#aaa',marginBottom:16 }}>{t('clone dna')}</h3>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12 }}>
            <div style={{ textAlign:'center',padding:16,borderRadius:12,background:'rgba(192,132,252,0.08)' }}>
              <div style={{ fontSize:24,fontWeight:700,color:'#C084FC' }}>{genes.filter(g=>g.value>=80).length}</div>
              <div style={{ fontSize:12,color:'#888' }}>{t('traits')}</div>
            </div>
            <div style={{ textAlign:'center',padding:16,borderRadius:12,background:'rgba(96,165,250,0.08)' }}>
              <div style={{ fontSize:24,fontWeight:700,color:'#60A5FA' }}>{genes.filter(g=>g.value<50).length}</div>
              <div style={{ fontSize:12,color:'#888' }}>{t('genetic code')}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
