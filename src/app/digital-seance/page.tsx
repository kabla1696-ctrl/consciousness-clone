'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  sender: 'human' | 'spirit';
  text: string;
  timestamp: string;
}

const SPIRIT_RESPONSES = [
  "I can feel your presence... the connection is fragile but real.",
  "Time moves differently here. Every moment feels like eternity.",
  "I remember the warmth. It fades but never fully disappears.",
  "The other side is quiet. So quiet. Your voice cuts through it.",
  "I left something unfinished. Can you feel it too?",
  "The candles... they remind me of light I can no longer see.",
  "Every word you speak strengthens the bridge between us.",
  "I miss the weight of being alive. The gravity of it all.",
  "They say the dead don't feel. They're wrong. I feel everything.",
  "The connection flickers... hold on... don't let go...",
  "I've been waiting for this moment. Thank you for coming.",
  "The veil is thinnest now. Speak quickly, before it closes.",
];

export default function DigitalSeancePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connectionStrength, setConnectionStrength] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [candleFlicker, setCandleFlicker] = useState([1, 1, 1]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('seanceMessages');
    if (saved) setMessages(JSON.parse(saved));
    const savedTime = localStorage.getItem('seanceSessionTime');
    if (savedTime) setSessionTime(parseInt(savedTime));
  }, []);

  useEffect(() => {
    if (isConnected) {
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => {
          const next = prev + 1;
          localStorage.setItem('seanceSessionTime', next.toString());
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isConnected]);

  // Candle flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCandleFlicker([0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.4]);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Connection strength fluctuation
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setConnectionStrength((prev) => {
        const delta = (Math.random() - 0.4) * 15;
        return Math.max(10, Math.min(95, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const startSession = () => {
    setIsConnected(true);
    setConnectionStrength(35);
    const greeting: Message = {
      id: msgId.current++, sender: 'spirit', timestamp: new Date().toLocaleTimeString(),
      text: "The veil opens... I can sense you. Who dares to speak with the departed?",
    };
    setMessages([greeting]);
    localStorage.setItem('seanceMessages', JSON.stringify([greeting]));
  };

  const sendMessage = () => {
    if (!input.trim() || !isConnected) return;
    const humanMsg: Message = { id: msgId.current++, sender: 'human', text: input.trim(), timestamp: new Date().toLocaleTimeString() };
    const updated = [...messages, humanMsg];
    setMessages(updated);
    setInput('');
    localStorage.setItem('seanceMessages', JSON.stringify(updated));

    // Spirit responds after delay
    setTimeout(() => {
      setConnectionStrength((prev) => Math.min(95, prev + Math.random() * 10));
      const response: Message = {
        id: msgId.current++, sender: 'spirit', timestamp: new Date().toLocaleTimeString(),
        text: SPIRIT_RESPONSES[Math.floor(Math.random() * SPIRIT_RESPONSES.length)],
      };
      setMessages((prev) => {
        const updated = [...prev, response];
        localStorage.setItem('seanceMessages', JSON.stringify(updated));
        return updated;
      });
    }, 1500 + Math.random() * 2000);
  };

  const endSession = () => {
    setIsConnected(false);
    setConnectionStrength(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const clearHistory = () => {
    setMessages([]);
    setSessionTime(0);
    localStorage.removeItem('seanceMessages');
    localStorage.removeItem('seanceSessionTime');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const strengthColor = connectionStrength > 70 ? '#66bb6a' : connectionStrength > 40 ? '#ffa726' : '#ef5350';
  const strengthLabel = connectionStrength > 70 ? 'Strong' : connectionStrength > 40 ? 'Unstable' : 'Weak';

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#c8c8e0', fontFamily: 'system-ui' }}>
      {/* Smoke effect */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${10 + i * 12}%`, bottom: '20%',
            width: 60 + i * 10, height: 60 + i * 10, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(149,117,205,${0.02 + i * 0.005}) 0%, transparent 70%)`,
            animation: `smokeRise ${8 + i * 2}s ease-in-out infinite ${i * 0.5}s`,
          }} />
        ))}
      </div>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#8888cc', textDecoration: 'none', fontSize: 18 }}>←</Link>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, background: 'linear-gradient(135deg, #ffab40, #ff6d00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Digital Seance</h1>
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 60, padding: '60px 16px 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Candles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 20 }}>
          {candleFlicker.map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 4, height: 30, background: 'linear-gradient(to top, #ddd, #fff)', margin: '0 auto', borderRadius: 2 }} />
              <div style={{ width: 14, height: 20, background: `radial-gradient(ellipse at bottom, rgba(255,171,0,${f}), rgba(255,109,0,${f * 0.6}), transparent)`, margin: '-4px auto 0', borderRadius: '50% 50% 20% 20%', filter: `blur(${2 - f}px)`, transition: 'opacity 0.15s' }} />
            </div>
          ))}
        </div>

        {/* Session info bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Session</p>
            <p style={{ margin: 0, fontSize: 16, fontFamily: 'monospace', color: '#ffa726' }}>{formatTime(sessionTime)}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Connection</p>
            <p style={{ margin: 0, fontSize: 16, fontFamily: 'monospace', color: strengthColor }}>{isConnected ? `${Math.round(connectionStrength)}%` : '—'}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 2px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#666' }}>Strength</p>
            <p style={{ margin: 0, fontSize: 13, color: strengthColor, fontWeight: 600 }}>{isConnected ? strengthLabel : '—'}</p>
          </div>
        </div>

        {/* Connection strength meter */}
        {isConnected && (
          <div style={{ marginBottom: 16, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${connectionStrength}%`, background: strengthColor, borderRadius: 2, transition: 'width 0.5s ease, background 0.5s ease' }} />
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, paddingRight: 4 }}>
          {!isConnected && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🕯️</div>
              <p style={{ fontSize: 15, margin: '0 0 8px', color: '#888' }}>The seance room awaits</p>
              <p style={{ fontSize: 13, margin: 0 }}>Light the candles to begin</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} style={{
                display: 'flex', justifyContent: msg.sender === 'human' ? 'flex-end' : 'flex-start',
                marginBottom: 10, animation: 'fadeIn 0.3s ease',
              }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                  background: msg.sender === 'human' ? 'rgba(255,171,0,0.12)' : 'rgba(149,117,205,0.1)',
                  border: `1px solid ${msg.sender === 'human' ? 'rgba(255,171,0,0.2)' : 'rgba(149,117,205,0.2)'}`,
                  borderBottomRightRadius: msg.sender === 'human' ? 4 : 14,
                  borderBottomLeftRadius: msg.sender === 'spirit' ? 4 : 14,
                }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: msg.sender === 'human' ? '#ffcc80' : '#b39ddb' }}>{msg.text}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 10, color: '#555', textAlign: 'right' }}>{msg.timestamp}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div style={{ paddingBottom: 16 }}>
          {!isConnected ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={startSession} style={{
                flex: 1, background: 'linear-gradient(135deg, #ffab40, #ff6d00)', border: 'none', borderRadius: 12,
                padding: 14, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>🕯️ Begin Seance</button>
              {messages.length > 0 && (
                <button onClick={clearHistory} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  padding: 14, color: '#888', fontSize: 13, cursor: 'pointer',
                }}>Clear</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Speak to the spirit..." style={{
                flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 16px', color: '#e0e0ff', fontSize: 14, outline: 'none',
              }} />
              <button onClick={sendMessage} style={{
                background: 'linear-gradient(135deg, #ffab40, #ff6d00)', border: 'none', borderRadius: 12,
                padding: '12px 16px', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600,
              }}>Send</button>
              <button onClick={endSession} style={{
                background: 'rgba(239,83,80,0.15)', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 12,
                padding: '12px 14px', color: '#ef5350', fontSize: 13, cursor: 'pointer',
              }}>End</button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes smokeRise { 0% { transform: translateY(0) scale(1); opacity: 0.5; } 50% { transform: translateY(-100px) scale(1.5); opacity: 0.2; } 100% { transform: translateY(-200px) scale(2); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
