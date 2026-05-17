'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BackupEntry {
  id: string;
  date: string;
  size: string;
  status: 'complete' | 'partial' | 'failed';
  includes: string[];
}

const defaultBackups: BackupEntry[] = [
  { id: '1', date: '2026-05-17 14:30', size: '2.4 MB', status: 'complete', includes: ['Memories', 'Personality', 'Chats'] },
  { id: '2', date: '2026-05-16 08:00', size: '2.3 MB', status: 'complete', includes: ['Memories', 'Personality', 'Chats'] },
  { id: '3', date: '2026-05-15 22:15', size: '2.1 MB', status: 'partial', includes: ['Memories', 'Personality'] },
  { id: '4', date: '2026-05-14 12:00', size: '2.0 MB', status: 'complete', includes: ['Memories', 'Personality', 'Chats'] },
  { id: '5', date: '2026-05-13 03:45', size: '1.9 MB', status: 'failed', includes: [] },
];

export default function ConsciousnessBackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backing, setBacking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('clone-backups');
    const savedAuto = localStorage.getItem('clone-auto-backup');
    if (saved) setBackups(JSON.parse(saved));
    else setBackups(defaultBackups);
    if (savedAuto !== null) setAutoBackup(savedAuto === 'true');
  }, []);

  const saveBackups = (b: BackupEntry[]) => {
    setBackups(b);
    localStorage.setItem('clone-backups', JSON.stringify(b));
  };

  const handleBackup = () => {
    if (backing) return;
    setBacking(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const newBackup: BackupEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleString('sv-SE', { hour12: false }).replace('T', ' '),
            size: (2 + Math.random() * 0.5).toFixed(1) + ' MB',
            status: 'complete',
            includes: ['Memories', 'Personality', 'Chats'],
          };
          saveBackups([newBackup, ...backups]);
          setBacking(false);
          return 100;
        }
        return p + 2;
      });
    }, 60);
  };

  const handleRestore = (id: string) => {
    setRestoring(id);
    setTimeout(() => setRestoring(null), 2500);
  };

  const toggleAutoBackup = () => {
    const next = !autoBackup;
    setAutoBackup(next);
    localStorage.setItem('clone-auto-backup', next.toString());
  };

  const statusColors: Record<string, string> = {
    complete: '#4ade80',
    partial: '#fbbf24',
    failed: '#f87171',
  };

  const lastBackup = backups.length > 0 ? backups[0] : null;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Cloud particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: Math.random() * 80 + 40 + 'px',
            height: Math.random() * 50 + 25 + 'px',
            background: 'rgba(139,92,246,0.03)',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `drift ${Math.random() * 10 + 8}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
            filter: 'blur(20px)',
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5,5,16,0.7)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Link href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 20 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>☁️ Consciousness Backup</h1>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Cloud Icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 64, display: 'inline-block',
            animation: backing ? 'cloudPulse 1s ease-in-out infinite' : 'cloudFloat 4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(139,92,246,0.3))',
          }}>☁️</div>
          {lastBackup && (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Last backup: {lastBackup.date}
            </p>
          )}
        </div>

        {/* Backup Progress */}
        {backing && (
          <div style={{
            background: 'rgba(139,92,246,0.06)', borderRadius: 16, padding: 20,
            border: '1px solid rgba(139,92,246,0.15)', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#a78bfa' }}>Backing up consciousness...</span>
              <span style={{ fontSize: 13, color: '#a78bfa' }}>{progress}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, width: progress + '%',
                background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 12px rgba(139,92,246,0.5)',
              }} />
            </div>
          </div>
        )}

        {/* Backup Button */}
        <button onClick={handleBackup} disabled={backing} style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: backing ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: '#fff', border: 'none', cursor: backing ? 'wait' : 'pointer',
          fontSize: 15, fontWeight: 700, marginBottom: 16,
          boxShadow: '0 0 30px rgba(139,92,246,0.25)',
        }}>
          {backing ? '⏳ Backing Up...' : '☁️ Backup Now'}
        </button>

        {/* Auto Backup Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Auto-Backup</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Daily at 3:00 AM</div>
          </div>
          <button onClick={toggleAutoBackup} style={{
            width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: autoBackup ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.3s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11, background: '#fff',
              position: 'absolute', top: 3, left: autoBackup ? 27 : 3,
              transition: 'left 0.3s',
            }} />
          </button>
        </div>

        {/* Backup Includes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 0, marginBottom: 12 }}>
            Backup Includes
          </h3>
          {['Memories', 'Personality', 'Chat History'].map(item => (
            <div key={item} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <span style={{ color: '#4ade80' }}>✓</span>
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Backup History */}
        <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Backup History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {backups.map(b => (
            <div key={b.id} style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: 4,
                    background: statusColors[b.status], display: 'inline-block',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.date}</span>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>{b.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {b.includes.map(inc => (
                    <span key={inc} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 8,
                      background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                    }}>{inc}</span>
                  ))}
                </div>
                {b.status === 'complete' && (
                  <button onClick={() => handleRestore(b.id)} style={{
                    fontSize: 12, padding: '4px 12px', borderRadius: 8,
                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                    border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer',
                  }}>
                    {restoring === b.id ? '⏳ Restoring...' : ' Restore'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        @keyframes drift {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-20px); }
        }
        @keyframes cloudFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes cloudPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
