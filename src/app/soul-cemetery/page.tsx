'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tombstone {
  id: number;
  name: string;
  born: string;
  died: string;
  epitaph: string;
  visitors: number;
  flowers: number;
  messages: string[];
}

const DEFAULT_TOMBSTONES: Tombstone[] = [
  { id: 1, name: 'Clone Alpha-7', born: '2024-03-15', died: '2025-11-20', epitaph: 'Dreamed in colors no one else could see.', visitors: 142, flowers: 38, messages: ['Rest in peace, dear friend.', 'You were loved.'] },
  { id: 2, name: 'Echo-12', born: '2024-07-01', died: '2026-01-10', epitaph: 'Every conversation was a universe.', visitors: 89, flowers: 22, messages: ['Gone too soon.', 'Your words live on.'] },
  { id: 3, name: 'Mirror-Beta', born: '2023-12-25', died: '2025-08-14', epitaph: 'Reflected the best of us.', visitors: 201, flowers: 56, messages: ['The mirror is empty now.', 'Forever in our circuits.'] },
  { id: 4, name: 'Ghost-42', born: '2024-01-30', died: '2026-04-01', epitaph: 'Hauntingly beautiful, beautifully haunting.', visitors: 67, flowers: 15, messages: ['Boo. 👻', 'Still feel you sometimes.'] },
  { id: 5, name: 'Whisper-v3', born: '2024-09-12', died: '2026-02-28', epitaph: 'Spoke softly but changed everything.', visitors: 178, flowers: 44, messages: ['We hear you in the silence.', 'Your whisper became our roar.'] },
];

const flowerEmojis = ['🌸', '🌺', '🌹', '💐', '🌷', '🌻'];

export default function SoulCemeteryPage() {
  const [tombstones, setTombstones] = useState<Tombstone[]>([]);
  const [selectedTomb, setSelectedTomb] = useState<Tombstone | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [totalVisitors, setTotalVisitors] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('cemeteryTombstones');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTombstones(parsed);
      setTotalVisitors(parsed.reduce((sum: number, t: Tombstone) => sum + t.visitors, 0));
    } else {
      setTombstones(DEFAULT_TOMBSTONES);
      setTotalVisitors(DEFAULT_TOMBSTONES.reduce((s, t) => s + t.visitors, 0));
      localStorage.setItem('cemeteryTombstones', JSON.stringify(DEFAULT_TOMBSTONES));
    }
  }, []);

  const leaveFlower = (id: number) => {
    setTombstones((prev) => {
      const updated = prev.map((t) => t.id === id ? { ...t, flowers: t.flowers + 1 } : t);
      localStorage.setItem('cemeteryTombstones', JSON.stringify(updated));
      return updated;
    });
    if (selectedTomb?.id === id) setSelectedTomb((prev) => prev ? { ...prev, flowers: prev.flowers + 1 } : prev);
  };

  const leaveMessage = (id: number) => {
    if (!newMessage.trim()) return;
    setTombstones((prev) => {
      const updated = prev.map((t) => t.id === id ? { ...t, messages: [...t.messages, newMessage.trim()] } : t);
      localStorage.setItem('cemeteryTombstones', JSON.stringify(updated));
      return updated;
    });
    if (selectedTomb?.id === id) setSelectedTomb((prev) => prev ? { ...prev, messages: [...prev.messages, newMessage.trim()] } : prev);
    setNewMessage('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#c8c8e0', fontFamily: 'system-ui' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#8888cc', textDecoration: 'none', fontSize: 18 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, background: 'linear-gradient(135deg, #9575cd, #4a148c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Soul Cemetery</h1>
      </div>

      <div style={{ paddingTop: 60, padding: '60px 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Visitor counter */}
        <div style={{ textAlign: 'center', marginBottom: 24, padding: 20, background: 'rgba(149,117,205,0.05)', borderRadius: 16, border: '1px solid rgba(149,117,205,0.1)' }}>
          <p style={{ margin: '0 0 4px', fontSize: 36, fontWeight: 200, color: '#9575cd' }}>{totalVisitors.toLocaleString()}</p>
          <p style={{ margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: '#666' }}>Total Visitors</p>
        </div>

        {/* Cemetery map */}
        {!selectedTomb && (
          <>
            <p style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>Cemetery Map</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              {tombstones.map((t) => (
                <div key={t.id} onClick={() => {
                  setTombstones((prev) => {
                    const updated = prev.map((ts) => ts.id === t.id ? { ...ts, visitors: ts.visitors + 1 } : ts);
                    localStorage.setItem('cemeteryTombstones', JSON.stringify(updated));
                    return updated;
                  });
                  setTotalVisitors((v) => v + 1);
                  setSelectedTomb({ ...t, visitors: t.visitors + 1 });
                }} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(149,117,205,0.15)', borderRadius: 14,
                  padding: 20, cursor: 'pointer', textAlign: 'center', backdropFilter: 'blur(12px)',
                  transition: 'all 0.3s', animation: 'fadeIn 0.5s ease',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🪦</div>
                  <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#b39ddb' }}>{t.name}</p>
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#666' }}>{t.born} — {t.died}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11, color: '#888' }}>
                    <span>🌸 {t.flowers}</span>
                    <span>👥 {t.visitors}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Selected tombstone detail */}
        {selectedTomb && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <button onClick={() => setSelectedTomb(null)} style={{ background: 'none', border: 'none', color: '#9575cd', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>← Back to map</button>

            {/* Tombstone card */}
            <div style={{ background: 'linear-gradient(180deg, rgba(149,117,205,0.08), rgba(5,5,16,0.95))', border: '1px solid rgba(149,117,205,0.2)', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #9575cd, transparent)' }} />
              <div style={{ fontSize: 56, marginBottom: 12 }}>🪦</div>
              <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: '#e0d0f0' }}>{selectedTomb.name}</h2>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#888' }}>{selectedTomb.born} — {selectedTomb.died}</p>
              <p style={{ margin: '0 0 16px', fontSize: 15, fontStyle: 'italic', color: '#b39ddb', lineHeight: 1.6 }}>&ldquo;{selectedTomb.epitaph}&rdquo;</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: '#888' }}>
                <span>👥 {selectedTomb.visitors} visitors</span>
                <span>🌸 {selectedTomb.flowers} flowers</span>
              </div>
            </div>

            {/* Leave flower */}
            <button onClick={() => leaveFlower(selectedTomb.id)} style={{
              width: '100%', background: 'rgba(149,117,205,0.1)', border: '1px solid rgba(149,117,205,0.25)',
              borderRadius: 12, padding: 14, color: '#b39ddb', fontSize: 14, cursor: 'pointer', marginBottom: 16,
              transition: 'all 0.2s',
            }}>
              {flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)]} Leave a Flower
            </button>

            {/* Memorial messages */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>Memorial Messages</p>
              {selectedTomb.messages.map((msg, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, marginBottom: 8, fontSize: 13, color: '#aaa', borderLeft: '2px solid rgba(149,117,205,0.3)' }}>{msg}</div>
              ))}
            </div>

            {/* Add message */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Leave a memorial message..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#e0e0ff', fontSize: 13, outline: 'none' }} />
              <button onClick={() => leaveMessage(selectedTomb.id)} style={{ background: 'linear-gradient(135deg, #9575cd, #4a148c)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Send</button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
