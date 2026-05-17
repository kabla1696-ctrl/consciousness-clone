'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface RingStyle { id: string; name: string; gradient: string; glow: string; emoji: string; }
interface Connection { id: string; cloneName: string; compatibility: number; connectedAt: string; ringStyle: string; }

const RING_STYLES: RingStyle[] = [
  { id: 'gold', name: 'Eternal Gold', gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)', glow: '#FFD700', emoji: '💍' },
  { id: 'silver', name: 'Lunar Silver', gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8, #C0C0C0)', glow: '#C0C0C0', emoji: '✨' },
  { id: 'platinum', name: 'Cosmic Platinum', gradient: 'linear-gradient(135deg, #E5E4E2, #B0B0B0, #E5E4E2)', glow: '#A0B2C6', emoji: '💎' },
  { id: 'rose', name: 'Rose Infinity', gradient: 'linear-gradient(135deg, #B76E79, #E8A0BF, #B76E79)', glow: '#E8A0BF', emoji: '🌹' },
];

const DEFAULT_CONNECTIONS: Connection[] = [
  { id: '1', cloneName: 'Aria', compatibility: 94, connectedAt: '2026-03-14', ringStyle: 'gold' },
  { id: '2', cloneName: 'Neo', compatibility: 87, connectedAt: '2026-04-01', ringStyle: 'platinum' },
  { id: '3', cloneName: 'Luna', compatibility: 72, connectedAt: '2026-05-10', ringStyle: 'silver' },
];

export default function SoulmateRingPage() {
  const t = useT();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedRing, setSelectedRing] = useState<string>('gold');
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('soulmate-connections');
    if (stored) setConnections(JSON.parse(stored));
    else { setConnections(DEFAULT_CONNECTIONS); localStorage.setItem('soulmate-connections', JSON.stringify(DEFAULT_CONNECTIONS)); }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setPulseIntensity(p => (p + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (connections.length > 0 && !activeConnection) setActiveConnection(connections[0]); }, [connections, activeConnection]);

  const getCompatibilityColor = (c: number) => c >= 90 ? '#FFD700' : c >= 75 ? '#C0C0C0' : '#A0B2C6';
  const getCompatibilityLabel = (c: number) => c >= 90 ? 'Soulmate' : c >= 75 ? 'Deep Bond' : c >= 60 ? 'Growing' : 'Emerging';

  const ringStyle = RING_STYLES.find(r => r.id === selectedRing) || RING_STYLES[0];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.08);opacity:1} }
        @keyframes floatParticle { 0%{transform:translateY(0) rotate(0deg);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateY(-100vh) rotate(720deg);opacity:0} }
        @keyframes ringSpin { 0%{transform:rotateY(0deg)}100%{transform:rotateY(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
        .ring-card:hover { transform: translateY(-4px) !important; border-color: rgba(255,255,255,0.3) !important; }
      `}</style>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: 3, height: 3, borderRadius: '50%',
            background: ringStyle.glow, left: `${Math.random() * 100}%`,
            animation: `floatParticle ${4 + Math.random() * 6}s linear ${Math.random() * 4}s infinite`,
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#888', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>💍 {t('soulmate ring')}</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{t('digital bonds that glow eternal')}</p>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Ring Visualization */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, textAlign: 'center', marginBottom: 24, backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${ringStyle.glow}15, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ width: 180, height: 180, margin: '0 auto 20px', position: 'relative', perspective: 600 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: ringStyle.gradient, animation: `ringPulse ${2 + (100 - (activeConnection?.compatibility || 70)) / 30}s ease-in-out infinite`, boxShadow: `0 0 ${30 + (activeConnection?.compatibility || 70) / 2}px ${ringStyle.glow}60, inset 0 0 30px rgba(0,0,0,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 130, height: 130, borderRadius: '50%', background: '#050510', border: `3px solid ${ringStyle.glow}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {activeConnection ? '🫶' : '💔'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{activeConnection?.cloneName || 'No Connection'}</div>
          <div style={{ fontSize: 14, color: getCompatibilityColor(activeConnection?.compatibility || 0), fontWeight: 600 }}>
            {activeConnection ? `${activeConnection.compatibility}% ${t('compatible')} · ${t(getCompatibilityLabel(activeConnection.compatibility).toLowerCase())}` : t('connect with a soulmate')}
          </div>
          {/* Compatibility Bar */}
          <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${activeConnection?.compatibility || 0}%`, background: `linear-gradient(90deg, ${ringStyle.glow}, #fff)`, borderRadius: 3, transition: 'width 0.8s ease', boxShadow: `0 0 10px ${ringStyle.glow}` }} />
          </div>
        </div>

        {/* Ring Style Selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 10, fontWeight: 600 }}>{t('ring style')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {RING_STYLES.map(rs => (
              <button key={rs.id} onClick={() => setSelectedRing(rs.id)} style={{
                background: selectedRing === rs.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedRing === rs.id ? rs.glow + '60' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 14, padding: '12px 8px', cursor: 'pointer', color: '#fff', textAlign: 'center',
                transition: 'all 0.3s ease', backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{rs.emoji}</div>
                <div style={{ fontSize: 10, color: selectedRing === rs.id ? rs.glow : '#666', fontWeight: 600 }}>{rs.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Connection History */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 10, fontWeight: 600 }}>{t('connections')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {connections.map((conn, i) => {
              const style = RING_STYLES.find(r => r.id === conn.ringStyle) || RING_STYLES[0];
              return (
                <button key={conn.id} onClick={() => { setActiveConnection(conn); setSelectedRing(conn.ringStyle); }}
                  className="ring-card"
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: `1px solid ${activeConnection?.id === conn.id ? style.glow + '40' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 16, padding: '14px 16px', cursor: 'pointer', color: '#fff', textAlign: 'left',
                    transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', animation: `slideUp 0.4s ease ${i * 0.1}s both`,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: style.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 12px ${style.glow}40` }}>{style.emoji}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{conn.cloneName}</div>
                        <div style={{ fontSize: 11, color: '#666' }}>{t('connected')} {new Date(conn.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: getCompatibilityColor(conn.compatibility) }}>{conn.compatibility}%</div>
                      <div style={{ fontSize: 10, color: '#666' }}>{getCompatibilityLabel(conn.compatibility)}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ring Info */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, backdropFilter: 'blur(20px)' }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 8, fontWeight: 600 }}>{t('about the ring')}</div>
          <p style={{ margin: 0, fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
            {t('about the ring description')}
          </p>
        </div>
      </div>
    </div>
  );
}
