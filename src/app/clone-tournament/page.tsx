'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Clone {
  id: string;
  name: string;
  avatar: string;
  score: number;
  wins: number;
  color: string;
}

interface Battle {
  id: string;
  round: number;
  clone1: Clone;
  clone2: Clone;
  question: string;
  options: string[];
  correctIndex: number;
  winnerId: string | null;
  votes: { [cloneId: string]: number };
}

const DEFAULT_CLONES: Clone[] = [
  { id: 'c1', name: 'Nova', avatar: '🌟', score: 0, wins: 0, color: '#a78bfa' },
  { id: 'c2', name: 'Cipher', avatar: '🔮', score: 0, wins: 0, color: '#ec4899' },
  { id: 'c3', name: 'Echo', avatar: '🎵', score: 0, wins: 0, color: '#34d399' },
  { id: 'c4', name: 'Phantom', avatar: '👻', score: 0, wins: 0, color: '#f59e0b' },
];

const QUESTIONS = [
  { q: 'What is the capital of Mars?', options: ['Olympus City', 'New Denver', 'Olympus Mons Base', 'Ares Prime'], correct: 2 },
  { q: 'Which element has the highest melting point?', options: ['Tungsten', 'Carbon', 'Rhenium', 'Osmium'], correct: 1 },
  { q: 'Year the first AI passed the Turing Test?', options: ['2014', '2020', '2029', 'Never'], correct: 2 },
  { q: 'Speed of gravitational waves?', options: ['Speed of light', 'Instant', '2x speed of light', 'Variable'], correct: 0 },
  { q: 'Largest known structure in the universe?', options: ['Galaxy cluster', 'Hercules-Corona Borealis Wall', 'Supercluster', 'Cosmic web'], correct: 1 },
  { q: 'Deepest point in any ocean?', options: ['Mariana Trench', 'Tonga Trench', 'Philippine Trench', 'Java Trench'], correct: 0 },
  { q: 'Which programming language was created first?', options: ['Python', 'C', 'Lisp', 'Fortran'], correct: 3 },
  { q: 'How many neurons in the human brain?', options: ['1 billion', '86 billion', '100 billion', '500 billion'], correct: 1 },
];

export default function CloneTournamentPage() {
  const t = useT()
  const ROUND_NAMES = [t('Quarter Finals'), t('Semi Finals'), t('Grand Final')];
  const [clones, setClones] = useState<Clone[]>(DEFAULT_CLONES);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [currentBattleIdx, setCurrentBattleIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [tournamentOver, setTournamentOver] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; d: number; s: number }[]>([]);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const storedClones = localStorage.getItem('tournament-clones');
    const storedBattles = localStorage.getItem('tournament-battles');
    if (storedClones && storedBattles) {
      try {
        setClones(JSON.parse(storedClones));
        setBattles(JSON.parse(storedBattles));
        return;
      } catch {}
    }
    initTournament();
    const p = Array.from({ length: 25 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      d: Math.random() * 3 + 1,
      s: Math.random() * 15 + 8,
    }));
    setParticles(p);
  }, []);

  useEffect(() => {
    if (battles.length > 0) {
      localStorage.setItem('tournament-clones', JSON.stringify(clones));
      localStorage.setItem('tournament-battles', JSON.stringify(battles));
    }
  }, [clones, battles]);

  const initTournament = () => {
    const qIdx = 0;
    const initBattles: Battle[] = [
      createBattle(1, DEFAULT_CLONES[0], DEFAULT_CLONES[1], qIdx),
      createBattle(1, DEFAULT_CLONES[2], DEFAULT_CLONES[3], qIdx + 1),
      createBattle(2, DEFAULT_CLONES[0], DEFAULT_CLONES[2], qIdx + 2),
      createBattle(3, DEFAULT_CLONES[0], DEFAULT_CLONES[2], qIdx + 3),
    ];
    setBattles(initBattles);
    setClones(DEFAULT_CLONES.map((c) => ({ ...c, score: 0, wins: 0 })));
  };

  const createBattle = (round: number, c1: Clone, c2: Clone, qIdx: number): Battle => {
    const q = QUESTIONS[qIdx % QUESTIONS.length];
    return {
      id: `b-${round}-${c1.id}-${c2.id}`,
      round,
      clone1: { ...c1 },
      clone2: { ...c2 },
      question: q.q,
      options: q.options,
      correctIndex: q.correct,
      winnerId: null,
      votes: { [c1.id]: Math.floor(Math.random() * 50 + 10), [c2.id]: Math.floor(Math.random() * 50 + 10) },
    };
  };

  useEffect(() => {
    setAnimateIn(true);
  }, [currentBattleIdx]);

  const currentBattle = battles[currentBattleIdx];
  if (!currentBattle) return null;

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowResult(true);

    const isCorrect = idx === currentBattle.correctIndex;
    const winner = isCorrect ? (Math.random() > 0.5 ? currentBattle.clone1 : currentBattle.clone2) : (Math.random() > 0.5 ? currentBattle.clone1 : currentBattle.clone2);

    setTimeout(() => {
      setBattles((prev) => {
        const updated = [...prev];
        updated[currentBattleIdx] = { ...updated[currentBattleIdx], winnerId: winner.id };
        return updated;
      });
      setClones((prev) =>
        prev.map((c) =>
          c.id === winner.id ? { ...c, score: c.score + (isCorrect ? 100 : 50), wins: c.wins + 1 } : c
        )
      );
    }, 1000);
  };

  const handleVote = (cloneId: string) => {
    if (voted) return;
    setVoted(cloneId);
    setBattles((prev) => {
      const updated = [...prev];
      const b = { ...updated[currentBattleIdx] };
      b.votes = { ...b.votes, [cloneId]: (b.votes[cloneId] || 0) + 1 };
      updated[currentBattleIdx] = b;
      return updated;
    });
  };

  const nextBattle = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setVoted(null);
    setAnimateIn(false);
    if (currentBattleIdx + 1 >= battles.length) {
      setTournamentOver(true);
    } else {
      setTimeout(() => setCurrentBattleIdx((i) => i + 1), 100);
    }
  };

  const resetTournament = () => {
    localStorage.removeItem('tournament-clones');
    localStorage.removeItem('tournament-battles');
    setTournamentOver(false);
    setCurrentBattleIdx(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setVoted(null);
    initTournament();
  };

  const sortedClones = [...clones].sort((a, b) => b.score - a.score);
  const roundName = ROUND_NAMES[currentBattle.round - 1] || `Round ${currentBattle.round}`;
  const battle = currentBattle;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Particles */}
      {particles.map((p, i) => (
        <div key={i} style={{ position: 'fixed', left: `${p.x}%`, top: `${p.y}%`, width: `${p.d}px`, height: `${p.d}px`, borderRadius: '50%', background: 'rgba(236,72,153,0.25)', animation: `float ${p.s}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.85)', borderBottom: '1px solid rgba(236,72,153,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: '24px', textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #f59e0b, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('Clone Tournament')}</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('Knowledge battles between clones')}</p>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {tournamentOver ? (
          /* Leaderboard */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>🏆</div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('Tournament Complete!')}</h2>
              <p style={{ color: '#6b7280', margin: 0 }}>{sortedClones[0].name} {t('wins the championship!')}</p>
            </div>

            {sortedClones.map((clone, i) => (
              <div key={clone.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '12px', background: i === 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${i === 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#4b5563', minWidth: '36px' }}>#{i + 1}</span>
                <span style={{ fontSize: '32px' }}>{clone.avatar}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, margin: '0 0 4px', fontSize: '16px' }}>{clone.name}</p>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{clone.wins} {t('wins')} · {clone.score} {t('pts')}</p>
                </div>
                {i === 0 && <span style={{ fontSize: '24px' }}>👑</span>}
              </div>
            ))}

            <button onClick={resetTournament} style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #a78bfa, #ec4899)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
              {t('New Tournament')}
            </button>
          </div>
        ) : (
          /* Battle View */
          <div style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.4s ease' }}>
            {/* Round Badge */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(167,139,250,0.3)', padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>
                ⚔️ {roundName}
              </span>
              <p style={{ color: '#4b5563', fontSize: '12px', margin: '8px 0 0' }}>{t('Battle')} {currentBattleIdx + 1} {t('of')} {battles.length}</p>
            </div>

            {/* VS Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>{battle.clone1.avatar}</div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: battle.clone1.color, margin: 0 }}>{battle.clone1.name}</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{battle.votes[battle.clone1.id]} votes</p>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VS</div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>{battle.clone2.avatar}</div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: battle.clone2.color, margin: 0 }}>{battle.clone2.name}</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>{battle.votes[battle.clone2.id]} votes</p>
              </div>
            </div>

            {/* Question Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 12px' }}>{t('Challenge Question')}</p>
              <p style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>{battle.question}</p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {battle.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === battle.correctIndex;
                let bg = 'rgba(255,255,255,0.03)';
                let border = 'rgba(255,255,255,0.08)';
                if (showResult && isCorrect) { bg = 'rgba(52,211,153,0.15)'; border = 'rgba(52,211,153,0.4)'; }
                else if (showResult && isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.15)'; border = 'rgba(239,68,68,0.4)'; }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      background: bg,
                      border: `1px solid ${border}`,
                      color: '#fff',
                      fontSize: '15px',
                      cursor: selectedAnswer !== null ? 'default' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      opacity: selectedAnswer !== null && !isCorrect && !isSelected ? 0.5 : 1,
                    }}
                  >
                    <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {showResult && isCorrect && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✓</span>}
                    {showResult && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', fontSize: '18px' }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* Vote Buttons */}
            {showResult && (
              <div>
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '13px', margin: '0 0 12px' }}>{t('Vote for your favorite clone')}</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={() => handleVote(battle.clone1.id)}
                    disabled={!!voted}
                    style={{ flex: 1, padding: '14px', borderRadius: '14px', background: voted === battle.clone1.id ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.1)', border: `1px solid ${voted === battle.clone1.id ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.2)'}`, color: '#a78bfa', fontSize: '15px', fontWeight: 600, cursor: voted ? 'default' : 'pointer' }}
                  >
                    {battle.clone1.avatar} {battle.clone1.name}
                  </button>
                  <button
                    onClick={() => handleVote(battle.clone2.id)}
                    disabled={!!voted}
                    style={{ flex: 1, padding: '14px', borderRadius: '14px', background: voted === battle.clone2.id ? 'rgba(236,72,153,0.3)' : 'rgba(236,72,153,0.1)', border: `1px solid ${voted === battle.clone2.id ? 'rgba(236,72,153,0.5)' : 'rgba(236,72,153,0.2)'}`, color: '#ec4899', fontSize: '15px', fontWeight: 600, cursor: voted ? 'default' : 'pointer' }}
                  >
                    {battle.clone2.avatar} {battle.clone2.name}
                  </button>
                </div>

                {/* Winner announcement */}
                {battle.winnerId && (
                  <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '16px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#fbbf24', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('Winner')}</p>
                    <p style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
                      {battle.winnerId === battle.clone1.id ? `${battle.clone1.avatar} ${battle.clone1.name}` : `${battle.clone2.avatar} ${battle.clone2.name}`}
                    </p>
                  </div>
                )}

                <button onClick={nextBattle} style={{ width: '100%', padding: '16px', borderRadius: '14px', background: 'linear-gradient(135deg, #a78bfa, #ec4899)', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
                  {currentBattleIdx + 1 >= battles.length ? t('View Leaderboard') : t('Next Battle') + ' →'}
                </button>
              </div>
            )}

            {/* Progress Bar */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {battles.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= currentBattleIdx ? 'linear-gradient(90deg, #a78bfa, #ec4899)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-25px) translateX(12px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
