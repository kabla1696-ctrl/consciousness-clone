'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

const TRAITS = [
  { name: 'Empathy', color: '#a78bfa', freq: 0.8, amp: 0.7 },
  { name: 'Logic', color: '#22d3ee', freq: 1.2, amp: 0.5 },
  { name: 'Creativity', color: '#f97316', freq: 0.6, amp: 0.9 },
  { name: 'Courage', color: '#ef4444', freq: 1.5, amp: 0.6 },
  { name: 'Wisdom', color: '#22c55e', freq: 0.4, amp: 0.8 },
  { name: 'Humor', color: '#fbbf24', freq: 1.8, amp: 0.4 },
];

const DEFAULT_VALUES = [70, 55, 85, 45, 60, 75];

export default function SoulFrequencyPage() {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [activeTrait, setActiveTrait] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; s: number; d: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('soul_frequency');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.values) setValues(s.values);
    }
  }, []);

  useEffect(() => {
    setParticles(Array.from({ length: 25 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      s: Math.random() * 3 + 1, d: Math.random() * 3 + 2,
    })));
  }, []);

  const drawWave = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Draw each trait's waveform
    TRAITS.forEach((trait, i) => {
      const val = values[i] / 100;
      const isActive = activeTrait === null || activeTrait === i;
      ctx.beginPath();
      ctx.strokeStyle = trait.color + (isActive ? 'cc' : '33');
      ctx.lineWidth = isActive ? 2.5 : 1;

      for (let x = 0; x < w; x++) {
        const t = (x / w) * Math.PI * 4;
        const y = h / 2 +
          Math.sin(t * trait.freq + time * 0.002 * trait.freq) * trait.amp * val * (h * 0.35) +
          Math.sin(t * trait.freq * 2.3 + time * 0.001) * trait.amp * val * (h * 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow effect for active
      if (isActive && (activeTrait === i || activeTrait === null)) {
        ctx.shadowColor = trait.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Combined waveform (white)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x++) {
      let y = 0;
      TRAITS.forEach((trait, i) => {
        const val = values[i] / 100;
        const t = (x / w) * Math.PI * 4;
        y += Math.sin(t * trait.freq + time * 0.002 * trait.freq) * trait.amp * val * (h * 0.08);
      });
      const py = h / 2 + y;
      if (x === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }, [values, activeTrait]);

  const drawSpectrum = useCallback((time: number) => {
    const canvas = spectrumRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barCount = 32;
    const barWidth = (w / barCount) - 2;

    for (let i = 0; i < barCount; i++) {
      let amp = 0;
      TRAITS.forEach((trait, ti) => {
        const val = values[ti] / 100;
        const dist = Math.abs(i / barCount - trait.freq / 2.5);
        const influence = Math.max(0, 1 - dist * 3) * trait.amp * val;
        amp += influence * (0.6 + 0.4 * Math.sin(time * 0.003 + i * 0.3 + ti));
      });

      const barH = Math.max(4, amp * h * 0.8);
      const x = i * (barWidth + 2);
      const gradient = ctx.createLinearGradient(x, h, x, h - barH);

      // Color based on dominant trait
      const dominantIdx = Math.floor((i / barCount) * TRAITS.length) % TRAITS.length;
      gradient.addColorStop(0, TRAITS[dominantIdx].color + '88');
      gradient.addColorStop(1, TRAITS[dominantIdx].color + '22');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, h - barH, barWidth, barH, 3);
      ctx.fill();
    }
  }, [values]);

  useEffect(() => {
    let running = true;
    const animate = (time: number) => {
      if (!running) return;
      drawWave(time);
      drawSpectrum(time);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [drawWave, drawSpectrum]);

  const updateValue = (idx: number, val: number) => {
    const newValues = [...values];
    newValues[idx] = val;
    setValues(newValues);
    localStorage.setItem('soul_frequency', JSON.stringify({ values: newValues }));
  };

  const totalFreq = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', width: p.s + 'px', height: p.s + 'px', borderRadius: '50%',
            background: `radial-gradient(circle, ${TRAITS[i % TRAITS.length].color}55, transparent)`,
            left: p.x + '%', top: p.y + '%',
            animation: `float${i % 3} ${p.d}s ease-in-out infinite`, opacity: 0.5,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-18px) translateX(8px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-12px) translateX(-6px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', color: '#94a3b8', textDecoration: 'none', fontSize: 18,
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #22d3ee, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('soul frequency')}
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{t('your waveform')}</p>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Frequency Score */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 24,
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginBottom: 20,
          animation: 'breathe 4s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #22d3ee, #a78bfa, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {totalFreq}Hz
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{t('soul resonance frequency')}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 12 }}>
            {TRAITS.map((t, i) => (
              <div key={i} style={{
                width: 6, height: Math.max(8, values[i] * 0.4), borderRadius: 3,
                background: t.color, opacity: activeTrait === null || activeTrait === i ? 1 : 0.3,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Waveform Canvas */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('waveform')}
            </h3>
            <button onClick={() => setActiveTrait(activeTrait === null ? 0 : null)} style={{
              fontSize: 10, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
              padding: '4px 10px', color: '#94a3b8', cursor: 'pointer',
            }}>{activeTrait === null ? t('isolate') : t('show all')}</button>
          </div>
          <canvas ref={canvasRef} width={560} height={180} style={{ width: '100%', height: 180, borderRadius: 10 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, justifyContent: 'center' }}>
            {TRAITS.map((tr, i) => (
              <button key={i} onClick={() => setActiveTrait(activeTrait === i ? null : i)} style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 10,
                background: activeTrait === i ? `${tr.color}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTrait === i ? tr.color + '55' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 6, padding: '3px 8px', color: activeTrait === i ? tr.color : '#64748b',
                cursor: 'pointer', transition: 'all 0.3s',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: tr.color }} />
                {tr.name}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Spectrum */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('frequency spectrum')}
          </h3>
          <canvas ref={spectrumRef} width={560} height={120} style={{ width: '100%', height: 120, borderRadius: 10 }} />
        </div>

        {/* Trait Sliders */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('personality sound mapping')}
          </h3>
          {TRAITS.map((trait, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: trait.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: trait.color, display: 'inline-block' }} />
                  {trait.name}
                </span>
                <span style={{ fontSize: 12, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{values[i]}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, color: '#475569', width: 20 }}>{(trait.freq).toFixed(1)}x</span>
                <input type="range" min={0} max={100} value={values[i]}
                  onChange={(e) => updateValue(i, parseInt(e.target.value))}
                  style={{
                    flex: 1, height: 4, appearance: 'none', WebkitAppearance: 'none',
                    background: `linear-gradient(to right, ${trait.color} 0%, ${trait.color} ${values[i]}%, rgba(255,255,255,0.06) ${values[i]}%, rgba(255,255,255,0.06) 100%)`,
                    borderRadius: 2, outline: 'none', cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: 9, color: '#475569', width: 20 }}>A{(trait.amp * 10).toFixed(0)}</span>
              </div>
              <div style={{ fontSize: 9, color: '#334155', marginTop: 3 }}>
                Freq: {(trait.freq * values[i] / 50).toFixed(1)}Hz · Amp: {(trait.amp * values[i] / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Signature */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginBottom: 40,
        }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{t('your unique soul signature')}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {values.map((v, i) => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: 3,
                background: TRAITS[i].color,
                opacity: 0.2 + (v / 100) * 0.8,
                transform: `scale(${0.5 + (v / 100) * 0.5})`,
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#334155', marginTop: 8, fontFamily: 'monospace' }}>
            {values.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()}
          </div>
        </div>
      </main>
    </div>
  );
}
