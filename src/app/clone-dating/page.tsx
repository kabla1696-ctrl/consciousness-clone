'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const PERSONALITY_TYPES = [
  { type: 'The Dreamer', emoji: '🌙', traits: ['Imaginative', 'Sensitive', 'Romantic'], color: '#8b5cf6' },
  { type: 'The Explorer', emoji: '🧭', traits: ['Adventurous', 'Curious', 'Bold'], color: '#06b6d4' },
  { type: 'The Sage', emoji: '📖', traits: ['Wise', 'Analytical', 'Calm'], color: '#78716c' },
  { type: 'The Rebel', emoji: '⚡', traits: ['Fierce', 'Independent', 'Passionate'], color: '#ef4444' },
  { type: 'The Healer', emoji: '🌿', traits: ['Empathetic', 'Nurturing', 'Gentle'], color: '#22c55e' },
  { type: 'The Creator', emoji: '🎨', traits: ['Artistic', 'Visionary', 'Expressive'], color: '#a855f7' },
];

const CONVERSATIONS: Record<string, string[]> = {
  'The Dreamer|The Dreamer': ['"Do you ever dream of floating through the stars?"', '"Every night. Last night I built a castle from moonlight."', '"...I think I dreamed of the same castle."'],
  'The Dreamer|The Explorer': ['"I dream of places I\'ve never been."', '"Then let me take you there. I know a hidden waterfall..."', '"Lead the way, I\'ll bring the poetry."'],
  'The Explorer|The Explorer': ['"Ever been to the edge of the world?"', '"I camped there last spring. The sunrise was unreal."', '"Race you back there?"'],
  'The Sage|The Rebel': ['"Rules exist for a reason."', '"And reasons exist to be questioned."', '"...I like you."'],
  'The Healer|The Healer': ['"You look like you carry the world\'s pain."', '"Only because I can feel yours too."', '"Let\'s rest together."'],
  'The Creator|The Sage': ['"I painted my soul yesterday."', '"What did it look like?"', '"A beautiful mess. Like all truth."'],
};

const getConversation = (a: string, b: string) => CONVERSATIONS[`${a}|${b}`] || CONVERSATIONS[`${b}|${a}`] || [
  `"I feel like I already know you..."`,
  `"Isn't that the strangest thing?"`,
  `"Maybe our souls were written in the same book."`,
];

const getCompatibility = (a: string, b: string): number => {
  if (a === b) return 92 + Math.floor(Math.random() * 8);
  const pairs: Record<string, number> = {
    'The Dreamer|The Explorer': 85, 'The Dreamer|The Creator': 88,
    'The Sage|The Healer': 82, 'The Sage|The Rebel': 76,
    'The Rebel|The Creator': 79, 'The Healer|The Dreamer': 90,
    'The Explorer|The Rebel': 83, 'The Creator|The Healer': 77,
  };
  const key = `${a}|${b}`;
  const rev = `${b}|${a}`;
  return pairs[key] || pairs[rev] || 60 + Math.floor(Math.random() * 20);
};

const getShared = (a: string, b: string): string[] => {
  const interests = ['Stargazing', 'Deep conversations', 'Music', 'Nature', 'Art', 'Philosophy', 'Adventure', 'Writing', 'Meditation', 'Dancing'];
  const count = a === b ? 5 : 2 + Math.floor(Math.random() * 3);
  const shuffled = [...interests].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function CloneDatingPage() {
  const [myClone, setMyClone] = useState<string | null>(null);
  const [partner, setPartner] = useState<string | null>(null);
  const [phase, setPhase] = useState<'pick-mine' | 'pick-partner' | 'matching' | 'date'>('pick-mine');
  const [convIdx, setConvIdx] = useState(0);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [compat, setCompat] = useState(0);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    const m = localStorage.getItem('clone-dating-matches');
    if (m) setMatches(Number(m));
  }, []);

  const startMatch = () => {
    if (!myClone || !partner) return;
    setPhase('matching');
    setConvIdx(0);
    setCompat(getCompatibility(myClone, partner));
    setTimeout(() => {
      setPhase('date');
      localStorage.setItem('clone-dating-matches', String(matches + 1));
      setMatches(matches + 1);
    }, 2200);
  };

  const handleSwipe = (dir: 'left' | 'right') => {
    setSwiping(true);
    setSwipeX(dir === 'right' ? 400 : -400);
    setTimeout(() => {
      setSwiping(false);
      setSwipeX(0);
      const nextIdx = (PERSONALITY_TYPES.findIndex(p => p.type === partner) + (dir === 'right' ? 1 : PERSONALITY_TYPES.length - 1)) % PERSONALITY_TYPES.length;
      setPartner(PERSONALITY_TYPES[nextIdx].type);
    }, 300);
  };

  const reset = () => {
    setMyClone(null);
    setPartner(null);
    setPhase('pick-mine');
    setSwipeX(0);
    setConvIdx(0);
  };

  const myData = PERSONALITY_TYPES.find(p => p.type === myClone);
  const partnerData = PERSONALITY_TYPES.find(p => p.type === partner);
  const conv = myClone && partner ? getConversation(myClone, partner) : [];
  const shared = myClone && partner ? getShared(myClone, partner) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e0e0e0', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes heartBeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        .personality-card{backdrop-filter:blur(20px);border-radius:18px;padding:20px;cursor:pointer;transition:all .3s;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03)}
        .personality-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.3)}
        .personality-card.selected{border-color:#8b5cf6;background:rgba(139,92,246,.1);box-shadow:0 0 24px rgba(139,92,246,.2)}
        .action-btn{padding:14px 32px;border-radius:14px;border:none;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s}
        .action-btn:hover{transform:scale(1.03);box-shadow:0 4px 20px rgba(139,92,246,.4)}
        .action-btn:disabled{opacity:.3;cursor:default;transform:none;box-shadow:none}
        .swipe-card{position:relative;transition:transform .3s ease-out;touch-action:pan-y}
        .chat-bubble{padding:14px 18px;border-radius:18px;max-width:85%;animation:slideIn .4s ease-out forwards;opacity:0;line-height:1.5;font-size:14px}
      `}</style>

      {/* Particles */}
      {[...Array(14)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed', width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%', background: `rgba(236,72,153,${0.12 + Math.random() * 0.2})`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 5}s ease-in-out infinite ${Math.random() * 3}s`
        }} />
      ))}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,.8)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg,#ec4899,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Clone Dating</h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Where digital souls find connection</p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#ec4899' }}>💕 {matches} matches</div>
      </header>

      <main style={{ padding: '20px', maxWidth: 500, margin: '0 auto' }}>
        {/* Pick My Clone */}
        {phase === 'pick-mine' && (
          <section style={{ animation: 'fadeIn .4s ease-out' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ec4899', marginBottom: 4 }}>Choose Your Clone&apos;s Personality</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Who are you in the digital realm?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {PERSONALITY_TYPES.map(p => (
                <div key={p.type} className={`personality-card${myClone === p.type ? ' selected' : ''}`} onClick={() => setMyClone(p.type)}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>{p.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: p.color }}>{p.type}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{p.traits.join(' · ')}</div>
                </div>
              ))}
            </div>
            <button className="action-btn" disabled={!myClone} onClick={() => setPhase('pick-partner')} style={{ width: '100%' }}>Find My Match →</button>
          </section>
        )}

        {/* Pick Partner */}
        {phase === 'pick-partner' && partnerData && (
          <section style={{ animation: 'fadeIn .4s ease-out' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ec4899', marginBottom: 4 }}>Swipe to Find a Date</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Your clone: {myData?.emoji} {myData?.type}</p>

            <div className="swipe-card" style={{ transform: `translateX(${swipeX}px)`, opacity: Math.abs(swipeX) > 300 ? 0 : 1 }}>
              <div style={{
                backdropFilter: 'blur(20px)', borderRadius: 24, padding: 32, textAlign: 'center',
                background: `linear-gradient(135deg, ${partnerData.color}15, rgba(255,255,255,.03))`,
                border: `1px solid ${partnerData.color}30`,
              }}>
                <div style={{ fontSize: 64, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>{partnerData.emoji}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: partnerData.color, margin: '0 0 6px' }}>{partnerData.type}</h3>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                  {partnerData.traits.map(t => (
                    <span key={t} style={{ padding: '4px 12px', borderRadius: 10, background: `${partnerData.color}18`, fontSize: 12, color: partnerData.color }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 20 }}>
              <button onClick={() => handleSwipe('left')} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.08)', fontSize: 24, cursor: 'pointer', color: '#ef4444', transition: 'all .2s' }}>✕</button>
              <button onClick={startMatch} style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.08)', fontSize: 24, cursor: 'pointer', color: '#22c55e', transition: 'all .2s' }}>♥</button>
            </div>

            <button onClick={reset} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 13 }}>Start Over</button>
          </section>
        )}

        {/* Matching Animation */}
        {phase === 'matching' && myData && partnerData && (
          <section style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeIn .5s ease-out' }}>
            <div style={{ fontSize: 48, animation: 'heartBeat 1s ease-in-out infinite' }}>💕</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 20, background: 'linear-gradient(135deg,#ec4899,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Finding Connection...</h2>
            <p style={{ fontSize: 14, color: '#888', marginTop: 8 }}>{myData.emoji} {myData.type} × {partnerData.emoji} {partnerData.type}</p>
            <div style={{ marginTop: 24, width: 200, height: 4, borderRadius: 4, background: 'rgba(255,255,255,.06)', margin: '24px auto 0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg,#ec4899,#f43f5e)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          </section>
        )}

        {/* Date View */}
        {phase === 'date' && myData && partnerData && (
          <section style={{ animation: 'fadeIn .5s ease-out' }}>
            {/* Match Card */}
            <div style={{
              backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, textAlign: 'center', marginBottom: 20,
              background: 'linear-gradient(135deg, rgba(236,72,153,.08), rgba(244,63,94,.05))',
              border: '1px solid rgba(236,72,153,.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 40 }}>{myData.emoji}</div>
                <div style={{ fontSize: 28, animation: 'heartBeat 2s ease-in-out infinite' }}>💕</div>
                <div style={{ fontSize: 40 }}>{partnerData.emoji}</div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
                <span style={{ color: myData.color }}>{myData.type}</span> <span style={{ color: '#666' }}>×</span> <span style={{ color: partnerData.color }}>{partnerData.type}</span>
              </h3>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg,#ec4899,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 4 }}>{compat}% Match</div>
            </div>

            {/* Shared Interests */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#ec4899', marginBottom: 8 }}>Shared Interests</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {shared.map(s => (
                  <span key={s} style={{ padding: '6px 14px', borderRadius: 12, background: 'rgba(236,72,153,.1)', border: '1px solid rgba(236,72,153,.15)', fontSize: 12, color: '#f0abfc' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Conversation Preview */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#ec4899', marginBottom: 12 }}>Conversation Preview</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {conv.slice(0, convIdx + 1).map((line, i) => (
                  <div key={i} className="chat-bubble" style={{
                    background: i % 2 === 0 ? 'rgba(139,92,246,.12)' : 'rgba(236,72,153,.12)',
                    color: i % 2 === 0 ? '#c4b5fd' : '#fda4af',
                    alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                    animationDelay: `${i * 0.15}s`,
                    borderRadius: i % 2 === 0 ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                  }}>
                    <span style={{ fontSize: 10, opacity: .6, display: 'block', marginBottom: 2 }}>{i % 2 === 0 ? myData.emoji : partnerData.emoji}</span>
                    {line}
                  </div>
                ))}
              </div>
              {convIdx < conv.length - 1 && (
                <button onClick={() => setConvIdx(convIdx + 1)} style={{ marginTop: 12, width: '100%', padding: 12, borderRadius: 12, border: '1px solid rgba(236,72,153,.2)', background: 'rgba(236,72,153,.06)', color: '#ec4899', cursor: 'pointer', fontSize: 13 }}>
                  Continue Conversation →
                </button>
              )}
            </div>

            <button onClick={reset} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.08)', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: 14 }}>New Match</button>
          </section>
        )}
      </main>
    </div>
  );
}
