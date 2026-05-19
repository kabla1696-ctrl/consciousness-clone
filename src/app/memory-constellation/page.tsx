'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Memory {
  id: string;
  title: string;
  category: string;
  emotion: string;
  x: number;
  y: number;
  brightness: number;
  size: number;
  connections: string[];
}

const CATEGORIES = ['childhood', 'love', 'growth', 'joy', 'loss', 'adventure'];
const CAT_COLORS: Record<string, string> = {
  childhood: '#a78bfa',
  love: '#f472b6',
  growth: '#34d399',
  joy: '#fbbf24',
  loss: '#94a3b8',
  adventure: '#38bdf8',
};

function generateStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `bg-${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.7 + 0.3,
    twinkleSpeed: Math.random() * 3 + 2,
    twinkleDelay: Math.random() * 5,
  }));
}

function generateDefaultMemories(): Memory[] {
  const memories: Memory[] = [
    { id: '1', title: 'First day of school', category: 'childhood', emotion: 'nervous', x: 15, y: 25, brightness: 0.8, size: 18, connections: ['2'] },
    { id: '2', title: 'Best friend forever', category: 'childhood', emotion: 'happy', x: 22, y: 18, brightness: 0.9, size: 16, connections: ['1'] },
    { id: '3', title: 'First love', category: 'love', emotion: 'passionate', x: 70, y: 30, brightness: 1, size: 22, connections: ['4'] },
    { id: '4', title: 'Summer together', category: 'love', emotion: 'joyful', x: 78, y: 38, brightness: 0.85, size: 17, connections: ['3'] },
    { id: '5', title: 'Graduated college', category: 'growth', emotion: 'proud', x: 45, y: 60, brightness: 0.95, size: 20, connections: ['6'] },
    { id: '6', title: 'First job offer', category: 'growth', emotion: 'excited', x: 52, y: 55, brightness: 0.9, size: 19, connections: ['5'] },
    { id: '7', title: 'Concert night', category: 'joy', emotion: 'ecstatic', x: 30, y: 75, brightness: 0.88, size: 15, connections: ['8'] },
    { id: '8', title: 'Road trip', category: 'adventure', emotion: 'free', x: 85, y: 65, brightness: 0.92, size: 21, connections: ['7'] },
    { id: '9', title: 'Saying goodbye', category: 'loss', emotion: 'sad', x: 10, y: 55, brightness: 0.6, size: 14, connections: [] },
    { id: '10', title: 'Mountain summit', category: 'adventure', emotion: 'triumphant', x: 88, y: 78, brightness: 0.95, size: 20, connections: ['8'] },
  ];
  return memories;
}

export default function MemoryConstellation() {
  const t = useT();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [bgStars, setBgStars] = useState<Array<{id: string, x: number, y: number, size: number, opacity: number, twinkleSpeed: number, twinkleDelay: number}>>([]);

  useEffect(() => {
    setBgStars(generateStars(200));
  }, []);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('memory-constellation');
    if (stored) {
      setMemories(JSON.parse(stored));
    } else {
      setMemories(generateDefaultMemories());
    }
  }, []);

  useEffect(() => {
    if (memories.length > 0) {
      localStorage.setItem('memory-constellation', JSON.stringify(memories));
    }
  }, [memories]);

  const filteredMemories = activeCategory
    ? memories.filter((m) => m.category === activeCategory)
    : memories;

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => { dragging.current = false; };

  const handleAddMemory = () => {
    if (!newTitle.trim()) return;
    const newMemory: Memory = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      emotion: 'neutral',
      x: Math.random() * 70 + 15,
      y: Math.random() * 60 + 20,
      brightness: 0.8 + Math.random() * 0.2,
      size: 14 + Math.random() * 8,
      connections: [],
    };
    setMemories((prev) => [...prev, newMemory]);
    setNewTitle('');
    setShowAdd(false);
  };

  const handleStarClick = (memory: Memory, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemory(memory);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050510',
      color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Sticky Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5, 5, 16, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Link href="/dashboard" style={{
          color: '#a78bfa', fontSize: 22, textDecoration: 'none',
          display: 'flex', alignItems: 'center',
        }}>←</Link>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ✨ {t('constellation')}
          </h1>
          <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{memories.length} {t('your stars')}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: !activeCategory ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)',
            color: !activeCategory ? '#a78bfa' : '#64748b',
            border: !activeCategory ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
          }}
        >All</button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', textTransform: 'capitalize',
              background: activeCategory === cat ? `${CAT_COLORS[cat]}22` : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? CAT_COLORS[cat] : '#64748b',
              border: activeCategory === cat ? `1px solid ${CAT_COLORS[cat]}44` : '1px solid transparent',
            }}
          >{cat}</button>
        ))}
      </div>

      {/* Zoom Controls */}
      <div style={{
        position: 'absolute', right: 16, top: 100, zIndex: 40,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <button onClick={() => setZoom((z) => Math.min(z + 0.3, 3))} style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.3)',
          background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: 18, cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>+</button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.3, 0.5))} style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.3)',
          background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontSize: 18, cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>−</button>
        <button onClick={() => setShowAdd(true)} style={{
          width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(52,211,153,0.3)',
          background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 18, cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>✦</button>
      </div>

      {/* Star Field */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          position: 'relative', width: '100%', height: 'calc(100vh - 130px)',
          cursor: dragging.current ? 'grabbing' : 'grab', overflow: 'hidden',
        }}
      >
        {/* Background Stars */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {bgStars.map((star) => (
            <circle
              key={star.id}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * zoom}
              fill="white"
              opacity={star.opacity}
            >
              <animate attributeName="opacity" values={`${star.opacity};${star.opacity * 0.3};${star.opacity}`}
                dur={`${star.twinkleSpeed}s`} begin={`${star.twinkleDelay}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Constellation Lines SVG */}
        <svg style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}>
          {filteredMemories.map((mem) =>
            mem.connections.map((connId) => {
              const conn = filteredMemories.find((m) => m.id === connId);
              if (!conn) return null;
              return (
                <line
                  key={`${mem.id}-${connId}`}
                  x1={`${mem.x}%`} y1={`${mem.y}%`}
                  x2={`${conn.x}%`} y2={`${conn.y}%`}
                  stroke={CAT_COLORS[mem.category] || '#a78bfa'}
                  strokeWidth={1}
                  opacity={0.25}
                  strokeDasharray="4 4"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="8" dur="3s" repeatCount="indefinite" />
                </line>
              );
            })
          )}
        </svg>

        {/* Memory Stars */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}>
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={(e) => handleStarClick(mem, e)}
              style={{
                position: 'absolute',
                left: `${mem.x}%`, top: `${mem.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: mem.size, height: mem.size,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${CAT_COLORS[mem.category]}, transparent)`,
                boxShadow: `0 0 ${mem.size * 2}px ${CAT_COLORS[mem.category]}66, 0 0 ${mem.size * 4}px ${CAT_COLORS[mem.category]}22`,
                animation: `twinkle ${2 + (mem.id.length % 3)}s ease-in-out infinite`,
                animationDelay: `${(mem.id.length * 0.3) % 2}s`,
              }} />
              <div style={{
                position: 'absolute', top: mem.size + 4, left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10, color: CAT_COLORS[mem.category],
                whiteSpace: 'nowrap', textShadow: `0 0 8px ${CAT_COLORS[mem.category]}88`,
                fontWeight: 600,
              }}>
                {mem.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Memory Detail */}
      {selectedMemory && (
        <div
          onClick={() => setSelectedMemory(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(5, 5, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 15, 35, 0.95)',
              border: `1px solid ${CAT_COLORS[selectedMemory.category]}44`,
              borderRadius: 20, padding: 28, maxWidth: 340, width: '100%',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 40px ${CAT_COLORS[selectedMemory.category]}22`,
            }}
          >
            <div style={{
              width: 50, height: 50, borderRadius: '50%', margin: '0 auto 16px',
              background: `radial-gradient(circle, ${CAT_COLORS[selectedMemory.category]}, transparent)`,
              boxShadow: `0 0 30px ${CAT_COLORS[selectedMemory.category]}44`,
            }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
              {selectedMemory.title}
            </h3>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16,
            }}>
              <span style={{
                padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: `${CAT_COLORS[selectedMemory.category]}22`,
                color: CAT_COLORS[selectedMemory.category],
                textTransform: 'capitalize',
              }}>{selectedMemory.category}</span>
              <span style={{
                padding: '4px 12px', borderRadius: 12, fontSize: 11,
                background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                textTransform: 'capitalize',
              }}>{selectedMemory.emotion}</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              Brightness: {Math.round(selectedMemory.brightness * 100)}% · {selectedMemory.connections.length} connections
            </p>
            <button
              onClick={() => {
                setMemories((prev) => prev.filter((m) => m.id !== selectedMemory.id));
                setSelectedMemory(null);
              }}
              style={{
                marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 12,
                border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >Delete Memory</button>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAdd && (
        <div
          onClick={() => setShowAdd(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(5, 5, 16, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 20, padding: 28, maxWidth: 340, width: '100%',
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', textAlign: 'center',
              background: 'linear-gradient(135deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Add New Memory Star
            </h3>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('memory title')}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1px solid rgba(139, 92, 246, 0.2)',
                background: 'rgba(255,255,255,0.03)', color: '#e2e8f0',
                fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  style={{
                    padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, textTransform: 'capitalize',
                    background: newCategory === cat ? `${CAT_COLORS[cat]}33` : 'rgba(255,255,255,0.05)',
                    color: newCategory === cat ? CAT_COLORS[cat] : '#64748b',
                  }}
                >{cat}</button>
              ))}
            </div>
            <button
              onClick={handleAddMemory}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
                color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}
            >✨ Create Star</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
