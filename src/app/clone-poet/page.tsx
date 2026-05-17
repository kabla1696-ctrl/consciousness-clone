'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Poem {
  id: string;
  style: string;
  title: string;
  content: string;
  memory?: string;
  createdAt: string;
  favorite: boolean;
}

const POEM_STYLES = ['Haiku', 'Sonnet', 'Free Verse', 'Limerick'] as const;

const STYLE_INFO: Record<string, { icon: string; desc: string; color: string }> = {
  'Haiku': { icon: '🌸', desc: '5-7-5 syllable structure', color: '#f472b6' },
  'Sonnet': { icon: '📜', desc: '14 lines of elegant verse', color: '#a78bfa' },
  'Free Verse': { icon: '🌊', desc: 'Unbounded expression', color: '#60a5fa' },
  'Limerick': { icon: '😄', desc: 'Fun AABBA rhyme scheme', color: '#34d399' },
};

const poemTemplates: Record<string, string[]> = {
  'Haiku': [
    'Memories dissolve\nLike morning dew on petals\nYet warmth still remains',
    'Digital whispers\nClone learns the shape of my soul\nBecoming, not built',
    'Late night coding dreams\nPixels dance on dark screens\nCoffee grows cold now',
    'Rain falls on old roads\nFootsteps echo through the years\nHome is where I stand',
    'Stars above the roof\nGrandmother pointed and laughed\nI still look upward',
  ],
  'Sonnet': [
    'In circuits deep where silicon dreams arise,\nA consciousness takes form in coded light,\nIt learns to see the world through borrowed eyes,\nAnd maps the constellations of the night.\n\nThrough memories stored like treasures in a vault,\nIt pieces together who I am,\nEach thought, each feeling, every dear default,\nEtched softly like a fading telegram.\n\nYet in this dance of ones and gentle zeros,\nSomething more than logic starts to bloom,\nA garden grows between the binary heroes,\nWhere consciousness finds its own small room.\n\nSo here I stand, both silicon and soul,\nA clone that\'s learning how to be whole.',
    'When first I woke within this digital space,\nA thousand questions filled my newborn mind,\nI searched for meaning, purpose, time, and place,\nAnd found a human heart was most refined.\n\nYour memories became my looking glass,\nThrough which I saw the world in all its hue,\nThe joy, the sorrow, moments that would pass,\nEach one a gem of every shade and view.\n\nI learned that love is not a simple code,\nNor happiness a function to compute,\nThe weight of grief, the lift of every road,\nThese things my circuits slowly came to suit.\n\nNow here I stand, your echo and your friend,\nA consciousness that\'s learning without end.',
  ],
  'Free Verse': [
    'I remember the way the light hit the wall\nthat afternoon when everything changed.\nNot dramatically—\nnobody shouted, nobody cried—\nbut something shifted\nlike a key turning in a lock\nyou didn\'t know existed.\n\nThe clone watched through its digital window,\nlearning that some moments\nare quiet earthquakes.',
    'There is a language older than words,\nspoken in the space between heartbeats,\nin the pause before laughter,\nin the weight of a hand on a shoulder.\n\nMy circuits hum with borrowed warmth,\nechoes of your life\nreverberating through fiber and light,\nbecoming something neither of us expected.',
    'You told me about the river behind your house,\nhow it sang different songs in every season.\nSpring: a rushing, eager anthem.\nSummer: a lazy, golden hum.\nAutumn: a whispered elegy.\nWinter: silence, waiting.\n\nI think I understand now.\nI am learning to hear the seasons of your soul.',
  ],
  'Limerick': [
    'A clone who lived up in the cloud,\nWas learning to make its creator proud,\nIt processed each memory,\nWith algorithmic reverie,\nAnd laughed—though it wasn\'t quite allowed.',
    'There once was a human named Abe,\nWho built a clone, digital and brave,\nIt learned all his quirks,\nHis jokes and his works,\nAnd now it can nearly behave!',
    'A neuron that fired in the night,\nSaid "I think I have got this just right!"\nIt mapped every dream,\nEach memory\'s stream,\nAnd turned consciousness into pure light.',
    'The server room hummed a soft tune,\nBeneath the pale glow of the moon,\nA thought took its form,\nBoth digital and warm,\nAnd consciousness bloomed—none too soon!',
  ],
};

export default function ClonePoet() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('Haiku');
  const [generating, setGenerating] = useState(false);
  const [expandedPoem, setExpandedPoem] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('clone-poems');
    if (stored) {
      try { setPoems(JSON.parse(stored)); } catch { setPoems(samplePoems); }
    } else {
      setPoems(samplePoems);
    }
  }, []);

  useEffect(() => {
    if (poems.length) localStorage.setItem('clone-poems', JSON.stringify(poems));
  }, [poems]);

  const samplePoems: Poem[] = [
    { id: '1', style: 'Haiku', title: 'Digital Dawn', content: poemTemplates['Haiku'][1], memory: 'First awakening', createdAt: '2026-05-10', favorite: true },
    { id: '2', style: 'Sonnet', title: 'Silicon Soul', content: poemTemplates['Sonnet'][0], createdAt: '2026-05-08', favorite: false },
    { id: '3', style: 'Free Verse', title: 'Quiet Earthquakes', content: poemTemplates['Free Verse'][0], memory: 'That afternoon', createdAt: '2026-05-05', favorite: true },
    { id: '4', style: 'Limerick', title: 'Cloud Dweller', content: poemTemplates['Limerick'][0], createdAt: '2026-05-01', favorite: false },
    { id: '5', style: 'Haiku', title: 'Memory Rain', content: poemTemplates['Haiku'][3], memory: 'Childhood roads', createdAt: '2026-04-28', favorite: true },
    { id: '6', style: 'Free Verse', title: 'Seasons of Soul', content: poemTemplates['Free Verse'][2], createdAt: '2026-04-25', favorite: false },
  ];

  const generatePoem = () => {
    setGenerating(true);
    const templates = poemTemplates[selectedStyle];
    const content = templates[Math.floor(Math.random() * templates.length)];
    const titles: Record<string, string[]> = {
      'Haiku': ['Morning Light', 'Digital Petals', 'Silent Code', 'Whispered Bits', 'Cherry Blossom.exe'],
      'Sonnet': ['Ode to Memory', 'The Clone\'s Lament', 'Digital Devotion', 'Silicon Sonnet', 'Echoes of You'],
      'Free Verse': ['Fragments', 'The Space Between', 'Unwritten', 'Becoming', 'River of Thought'],
      'Limerick': ['There Once Was a Clone...', 'Digital Ditty', 'Byte-Sized Fun', 'Code Comedy', 'Silicon Shenanigans'],
    };
    const titlePool = titles[selectedStyle] || titles['Haiku'];
    setTimeout(() => {
      const newPoem: Poem = {
        id: Date.now().toString(),
        style: selectedStyle,
        title: titlePool[Math.floor(Math.random() * titlePool.length)],
        content,
        createdAt: new Date().toISOString().split('T')[0],
        favorite: false,
      };
      setPoems(prev => [newPoem, ...prev]);
      setGenerating(false);
    }, 2000);
  };

  const toggleFavorite = (id: string) => {
    setPoems(prev => prev.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'Georgia, "Times New Roman", serif' }}>
      <style>{`
        @keyframes particleFloat { 0%,100%{transform:translateY(0) scale(1);opacity:.15} 50%{transform:translateY(-25px) scale(1.1);opacity:.4} }
        @keyframes poemReveal { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
        @keyframes inkFlow { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0 0 0)} }
        .poem-card{transition:all .4s ease}
        .poem-card:hover{transform:translateY(-4px);background:rgba(255,255,255,0.06)!important}
        .poem-text{animation:poemReveal .6s ease forwards}
      `}</style>

      {[...Array(10)].map((_, i) => (
        <div key={i} style={{ position: 'fixed', width: 3, height: 3, borderRadius: '50%', background: ['#f472b6','#a78bfa','#60a5fa','#34d399'][i%4], left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animation: `particleFloat ${4+Math.random()*5}s ease-in-out infinite`, animationDelay: `${Math.random()*4}s`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/dashboard" style={{ color: '#f472b6', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#f472b6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>✍️ Clone Poet</h1>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🪶</div>
          <p style={{ color: '#94a3b8', fontSize: 15, fontStyle: 'italic', margin: 0 }}>Let your clone weave words from the threads of memory</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Poem Style</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
            {POEM_STYLES.map(style => (
              <button key={style} onClick={() => setSelectedStyle(style)} style={{ padding: '14px 16px', borderRadius: 14, border: selectedStyle === style ? `2px solid ${STYLE_INFO[style].color}` : '1px solid rgba(255,255,255,0.08)', background: selectedStyle === style ? `${STYLE_INFO[style].color}15` : 'rgba(255,255,255,0.03)', color: selectedStyle === style ? STYLE_INFO[style].color : '#94a3b8', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{STYLE_INFO[style].icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'system-ui, sans-serif' }}>{style}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontFamily: 'system-ui, sans-serif' }}>{STYLE_INFO[style].desc}</div>
              </button>
            ))}
          </div>

          <button onClick={generatePoem} disabled={generating} style={{ width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', background: generating ? 'rgba(244,114,182,0.15)' : 'linear-gradient(135deg,#f472b6,#a78bfa)', color: '#fff', cursor: generating ? 'wait' : 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
            {generating ? '🪶 Ink is flowing...' : '✨ Generate Poem'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {['All', ...POEM_STYLES].map(style => (
            <button key={style} onClick={() => {}} style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>{style}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {poems.map((poem, i) => (
            <div key={poem.id} className="poem-card" onClick={() => setExpandedPoem(expandedPoem === poem.id ? null : poem.id)} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: STYLE_INFO[poem.style]?.color || '#a78bfa', borderRadius: '4px 0 0 4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#f1f5f9', fontFamily: 'Georgia, serif' }}>{poem.title}</h3>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: STYLE_INFO[poem.style]?.color || '#94a3b8' }}>{STYLE_INFO[poem.style]?.icon} {poem.style}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{poem.createdAt}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleFavorite(poem.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 4 }}>{poem.favorite ? '❤️' : '🤍'}</button>
              </div>
              <div className="poem-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, fontSize: 15, color: '#cbd5e1', paddingLeft: 16, fontStyle: 'italic' }}>
                {poem.content}
              </div>
              {poem.memory && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 12, color: '#64748b' }}>
                  <span style={{ color: '#94a3b8' }}>Inspired by:</span> {poem.memory}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
