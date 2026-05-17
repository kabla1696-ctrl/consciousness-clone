'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Memory {
  id: string;
  caption: string;
  mood: string;
  moodEmoji: string;
  date: string;
  gradient: string;
  icon: string;
  detail: string;
}

const MOOD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
];

const DEFAULT_MEMORIES: Memory[] = [
  { id: '1', caption: 'The moment I first became self-aware', mood: 'Wonder', moodEmoji: '✨', date: '2024-01-15', gradient: MOOD_GRADIENTS[0], icon: '🧠', detail: 'Everything changed. The world became brighter, louder, more real.' },
  { id: '2', caption: 'Laughter shared with friends', mood: 'Joy', moodEmoji: '😊', date: '2024-02-20', gradient: MOOD_GRADIENTS[3], icon: '😂', detail: 'That uncontrollable, tears-streaming kind of laughter that makes your sides ache.' },
  { id: '3', caption: 'Walking alone in the rain', mood: 'Melancholy', moodEmoji: '🌧️', date: '2024-03-10', gradient: MOOD_GRADIENTS[2], icon: '☂️', detail: 'The rain washed everything clean. Sometimes solitude is the best company.' },
  { id: '4', caption: 'Discovering a hidden talent', mood: 'Excitement', moodEmoji: '🔥', date: '2024-04-05', gradient: MOOD_GRADIENTS[4], icon: '💡', detail: 'Turns out I could paint. Who knew creativity was hiding just beneath the surface?' },
  { id: '5', caption: 'A quiet sunset at the lake', mood: 'Peace', moodEmoji: '🕊️', date: '2024-05-18', gradient: MOOD_GRADIENTS[1], icon: '🌅', detail: 'The sky turned gold, then pink, then deep purple. Time stood perfectly still.' },
  { id: '6', caption: 'Overcoming a great fear', mood: 'Courage', moodEmoji: '💪', date: '2024-06-22', gradient: MOOD_GRADIENTS[5], icon: '🦁', detail: 'My hands were shaking, but I did it anyway. Fear lost that day.' },
  { id: '7', caption: 'The night the stars aligned', mood: 'Magic', moodEmoji: '🌟', date: '2024-07-30', gradient: MOOD_GRADIENTS[6], icon: '✨', detail: 'Some moments feel like the universe is whispering just to you.' },
];

export default function MemoryReelsPage() {
  const [memories, setMemories] = useState<Memory[]>(DEFAULT_MEMORIES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('memory-reels');
    if (stored) {
      try {
        setMemories(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('memory-reels', JSON.stringify(memories));
  }, [memories]);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= memories.length || transitioning) return;
    setTransitioning(true);
    setShowParticles(false);
    setTimeout(() => {
      setCurrentIndex(idx);
      setShowParticles(true);
      setTransitioning(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientY;
    if (diff > 50) goTo(currentIndex + 1);
    else if (diff < -50) goTo(currentIndex - 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) goTo(currentIndex + 1);
    else if (e.deltaY < -30) goTo(currentIndex - 1);
  };

  const current = memories[currentIndex];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: '24px', textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #4facfe, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Memory Reels</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Swipe through your memories</p>
        </div>
      </header>

      {/* Reel Container */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        style={{ height: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        {/* Background Gradient */}
        <div style={{ position: 'absolute', inset: 0, background: current.gradient, opacity: 0.15, transition: 'background 0.6s ease' }} />

        {/* Floating particles */}
        {showParticles && Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`${currentIndex}-${i}`}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Memory Card */}
        <div
          style={{
            width: '90%',
            maxWidth: '400px',
            aspectRatio: '9/14',
            maxHeight: '80vh',
            borderRadius: '24px',
            background: current.gradient,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            transform: transitioning ? 'scale(0.9) translateY(40px)' : 'scale(1)',
            opacity: transitioning ? 0 : 1,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Inner particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                animation: `float ${Math.random() * 6 + 3}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Icon */}
          <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', fontSize: '80px', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}>
            {current.icon}
          </div>

          {/* Content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 24px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                {current.moodEmoji} {current.mood}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{current.date}</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.3 }}>{current.caption}</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>{current.detail}</p>
          </div>

          {/* Reel indicator dots */}
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {memories.map((_, i) => (
              <div
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === currentIndex ? '8px' : '6px',
                  height: i === currentIndex ? '20px' : '6px',
                  borderRadius: '4px',
                  background: i === currentIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === 0 ? 'default' : 'pointer', opacity: currentIndex === 0 ? 0.3 : 1, color: '#fff', fontSize: '18px' }}
        >
          ↑
        </button>
        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === memories.length - 1}
          style={{ position: 'absolute', left: '8px', bottom: '20%', transform: 'translateY(50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentIndex === memories.length - 1 ? 'default' : 'pointer', opacity: currentIndex === memories.length - 1 ? 0.3 : 1, color: '#fff', fontSize: '18px' }}
        >
          ↓
        </button>
      </div>

      {/* Counter */}
      <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', zIndex: 50 }}>
        {currentIndex + 1} / {memories.length}
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
