'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Contact {
  name: string;
  relation: string;
  phone: string;
}

export default function LastBreathPage() {
  const t = useT();
  const [lastMessage, setLastMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Contact>({ name: '', relation: '', phone: '' });
  const [timeLeft, setTimeLeft] = useState(86400);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastBreathMessage');
    if (saved) setLastMessage(saved);
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    const savedTime = localStorage.getItem('lastBreathTimer');
    if (savedTime) setTimeLeft(parseInt(savedTime));
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        const next = prev - 1;
        localStorage.setItem('lastBreathTimer', next.toString());
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('lastBreathMessage', lastMessage);
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [lastMessage]);

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem('emergencyContacts', JSON.stringify(updated));
    setNewContact({ name: '', relation: '', phone: '' });
    setShowAddContact(false);
  };

  const removeContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    localStorage.setItem('emergencyContacts', JSON.stringify(updated));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / 86400) * 100;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e0e0ff', fontFamily: 'system-ui' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#8888cc', textDecoration: 'none', fontSize: 18 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, background: 'linear-gradient(135deg, #ff6b6b, #ffa07a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t('last breath')}</h1>
      </div>

      <div style={{ paddingTop: 60, padding: '60px 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Fading light animation */}
        <div style={{ position: 'relative', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,160,122,${progress / 200}) 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,107,107,${progress / 150}) 0%, transparent 70%)`, animation: 'pulse 2s ease-in-out infinite 0.5s' }} />
          <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,${progress / 100}) 0%, transparent 70%)` }} />
          <span style={{ position: 'relative', fontSize: 40, zIndex: 1, opacity: Math.max(0.3, progress / 100) }}>✦</span>
        </div>

        {/* Countdown */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)', marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>{t('final moment')}</p>
          <p style={{ margin: 0, fontSize: 48, fontFamily: 'monospace', fontWeight: 200, color: timeLeft < 3600 ? '#ff6b6b' : '#ffa07a', textAlign: 'center' }}>{formatTime(timeLeft)}</p>
          <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #ff6b6b, #ffa07a)', borderRadius: 2, transition: 'width 1s linear' }} />
          </div>
        </div>

        {/* Last message editor */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>{t('goodbye')}</p>
            {autoSaved && <span style={{ fontSize: 11, color: '#66bb6a', animation: 'fadeIn 0.3s' }}>✓ Auto-saved</span>}
          </div>
          <textarea
            value={lastMessage}
            onChange={(e) => setLastMessage(e.target.value)}
            placeholder={t('final message') + '...'}
            style={{ width: '100%', minHeight: 160, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16, color: '#e0e0ff', fontSize: 15, lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#666', fontStyle: 'italic' }}>{t('legacy')}.</p>
        </div>

        {/* Emergency contacts */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: '#888' }}>Emergency Contacts</p>
            <button onClick={() => setShowAddContact(!showAddContact)} style={{ background: 'rgba(255,160,122,0.15)', border: '1px solid rgba(255,160,122,0.3)', borderRadius: 8, padding: '4px 12px', color: '#ffa07a', fontSize: 12, cursor: 'pointer' }}>+ Add</button>
          </div>

          {showAddContact && (
            <div style={{ marginBottom: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
              <input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: '#e0e0ff', fontSize: 14, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
              <input value={newContact.relation} onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} placeholder="Relation" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: '#e0e0ff', fontSize: 14, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
              <input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color: '#e0e0ff', fontSize: 14, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
              <button onClick={addContact} style={{ background: 'linear-gradient(135deg, #ff6b6b, #ffa07a)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Save Contact</button>
            </div>
          )}

          {contacts.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#555', textAlign: 'center', padding: 16 }}>No emergency contacts yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{c.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{c.relation} · {c.phone}</p>
                  </div>
                  <button onClick={() => removeContact(i)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 16, padding: 4 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
