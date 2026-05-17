'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface CallLog { id: string; type: string; cloneName: string; duration: number; timestamp: string; message: string; }

const DEFAULT_CALLS: CallLog[] = [
  { id: '1', type: 'morning', cloneName: 'Aria', duration: 45, timestamp: '2026-05-17T07:30:00', message: 'Good morning! Today is going to be amazing. You have 3 meetings but I believe in you!' },
  { id: '2', type: 'motivation', cloneName: 'Aria', duration: 120, timestamp: '2026-05-16T14:00:00', message: 'Hey, I noticed you\'ve been working hard. Remember to take breaks. You\'re doing incredible.' },
  { id: '3', type: 'checkin', cloneName: 'Neo', duration: 30, timestamp: '2026-05-16T09:15:00', message: 'Just checking in! How are you feeling today? I\'m here if you need anything.' },
  { id: '4', type: 'emergency', cloneName: 'Aria', duration: 15, timestamp: '2026-05-15T23:45:00', message: 'Alert: Unusual activity detected on your account. Please review immediately.' },
];

export default function CloneVoiceCallsPage() {
  const t = useT();
  const CALL_TYPES = [
    { id: 'checkin', name: t('Check-in'), icon: '💬', color: '#4FC3F7', desc: t('Quick wellness check') },
    { id: 'morning', name: t('Good Morning'), icon: '🌅', color: '#FFD54F', desc: t('Start your day right') },
    { id: 'motivation', name: t('Motivation'), icon: '🔥', color: '#FF7043', desc: t('Power boost call') },
    { id: 'emergency', name: t('Emergency'), icon: '🚨', color: '#EF5350', desc: t('Urgent alert') },
  ];
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeCall, setActiveCall] = useState<{ type: string; cloneName: string } | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('clone-voice-calls');
    if (stored) setCallLogs(JSON.parse(stored));
    else { setCallLogs(DEFAULT_CALLS); localStorage.setItem('clone-voice-calls', JSON.stringify(DEFAULT_CALLS)); }
  }, []);

  useEffect(() => {
    if (activeCall) {
      if (isRinging) {
        const ringTimeout = setTimeout(() => setIsRinging(false), 2000);
        return () => clearTimeout(ringTimeout);
      }
      timerRef.current = setInterval(() => setCallTimer(t => t + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    setCallTimer(0);
  }, [activeCall, isRinging]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const startCall = (type: string) => {
    setActiveCall({ type, cloneName: 'Aria' });
    setIsRinging(true);
    setCallTimer(0);
  };

  const endCall = () => {
    if (activeCall && callTimer > 0) {
      const newCall: CallLog = {
        id: Date.now().toString(), type: activeCall.type, cloneName: activeCall.cloneName,
        duration: callTimer, timestamp: new Date().toISOString(), message: 'Call completed successfully.',
      };
      const updated = [newCall, ...callLogs];
      setCallLogs(updated);
      localStorage.setItem('clone-voice-calls', JSON.stringify(updated));
    }
    setActiveCall(null);
    setIsRinging(false);
    setCallTimer(0);
  };

  const getTypeInfo = (typeId: string) => CALL_TYPES.find(ct => ct.id === typeId) || CALL_TYPES[0];

  // Active call screen
  if (activeCall) {
    const typeInfo = getTypeInfo(activeCall.type);
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${typeInfo.color}15, #050510 40%)`, color: '#fff', fontFamily: 'system-ui', display: 'flex', flexDirection: 'column' }}>
        <style>{`@keyframes ringPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}} @keyframes waveAnim{0%{transform:scaleX(1)}50%{transform:scaleX(1.5)}100%{transform:scaleX(1)}}`}</style>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: `${typeInfo.color}20`, border: `2px solid ${typeInfo.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, animation: isRinging ? 'ringPulse 0.5s ease infinite' : 'none', marginBottom: 24, boxShadow: `0 0 40px ${typeInfo.color}30` }}>
            {isRinging ? '🔔' : typeInfo.icon}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{activeCall.cloneName}</div>
          <div style={{ fontSize: 14, color: typeInfo.color, marginBottom: 8 }}>{typeInfo.name}</div>
          <div style={{ fontSize: 36, fontWeight: 300, letterSpacing: 4, marginBottom: 40, fontFamily: 'monospace' }}>
            {isRinging ? 'Ringing...' : formatTime(callTimer)}
          </div>
          {/* Waveform */}
          {!isRinging && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 40, marginBottom: 40 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{ width: 3, height: 10 + Math.random() * 30, borderRadius: 2, background: typeInfo.color, animation: `waveAnim ${0.3 + Math.random() * 0.5}s ease ${Math.random() * 0.3}s infinite`, opacity: 0.8 }} />
              ))}
            </div>
          )}
          <button onClick={endCall} style={{ width: 70, height: 70, borderRadius: '50%', background: '#EF5350', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 20px rgba(239,83,80,0.4)', transition: 'transform 0.2s' }}>
            📞
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes floatP { 0%{transform:translateY(0);opacity:0}20%{opacity:.6}80%{opacity:.6}100%{transform:translateY(-100vh);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        .call-type-btn:hover { transform: translateY(-3px) !important; }
        .call-log-item:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: '#4FC3F7', left: `${Math.random() * 100}%`, animation: `floatP ${5 + Math.random() * 5}s linear ${Math.random() * 5}s infinite` }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#888', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📞 {t('Clone Voice Calls')}</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{t('Your clone calls you')}</p>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Call Types */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600 }}>{t('Start a Call')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {CALL_TYPES.map((ct, i) => (
              <button key={ct.id} onClick={() => startCall(ct.id)} className="call-type-btn"
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '20px 14px', cursor: 'pointer', color: '#fff', textAlign: 'center',
                  transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', animation: `slideUp 0.4s ease ${i * 0.08}s both`,
                }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{ct.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: ct.color, marginBottom: 2 }}>{ct.name}</div>
                <div style={{ fontSize: 11, color: '#666' }}>{ct.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Call History */}
        <div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600 }}>{t('Call History')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {callLogs.map((call, i) => {
              const ct = getTypeInfo(call.type);
              return (
                <div key={call.id} className="call-log-item"
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px',
                    backdropFilter: 'blur(10px)', animation: `slideUp 0.3s ease ${i * 0.06}s both`, transition: 'background 0.2s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${ct.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{ct.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{call.cloneName} · {ct.name}</div>
                      <div style={{ fontSize: 11, color: '#666' }}>{new Date(call.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {formatTime(call.duration)}</div>
                    </div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ct.color }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#999', lineHeight: 1.5, paddingLeft: 48 }}>{call.message}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, backdropFilter: 'blur(20px)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#4FC3F7' }}>{callLogs.length}</div><div style={{ fontSize: 10, color: '#666' }}>{t('Total Calls')}</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#FFD54F' }}>{formatTime(callLogs.reduce((s, c) => s + c.duration, 0))}</div><div style={{ fontSize: 10, color: '#666' }}>{t('Total Time')}</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 700, color: '#FF7043' }}>{callLogs.filter(c => c.type === 'motivation').length}</div><div style={{ fontSize: 10, color: '#666' }}>{t('Motivations')}</div></div>
        </div>
      </div>
    </div>
  );
}
