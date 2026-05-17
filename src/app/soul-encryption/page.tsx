'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

const generateHex = (length: number) => {
  const chars = '0123456789abcdef';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const generateSoulSignature = () => {
  const parts = Array.from({ length: 8 }, () => generateHex(4));
  return parts.join('-').toUpperCase();
};

const generateQRGrid = () => {
  return Array.from({ length: 21 }, () =>
    Array.from({ length: 21 }, () => Math.random() > 0.5)
  );
};

export default function SoulEncryptionPage() {
  const t = useT();
  const [soulKey, setSoulKey] = useState('');
  const [signature, setSignature] = useState('');
  const [qrGrid, setQrGrid] = useState<boolean[][]>([]);
  const [decrypting, setDecrypting] = useState(false);
  const [decrypted, setDecrypted] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [hexLines, setHexLines] = useState<string[]>([]);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const savedKey = localStorage.getItem('soul-key');
    const savedSig = localStorage.getItem('soul-signature');
    if (savedKey) setSoulKey(savedKey);
    else {
      const key = generateHex(64);
      setSoulKey(key);
      localStorage.setItem('soul-key', key);
    }
    if (savedSig) setSignature(savedSig);
    else {
      const sig = generateSoulSignature();
      setSignature(sig);
      localStorage.setItem('soul-signature', sig);
    }
    setQrGrid(generateQRGrid());
    setHexLines(Array.from({ length: 8 }, () => generateHex(32)));
    setSecurityLevel(87);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(l => (l + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleDecrypt = () => {
    if (decrypting) return;
    setDecrypting(true);
    setDecrypted(false);
    setTimeout(() => {
      setDecrypting(false);
      setDecrypted(true);
      setSecurityLevel(95);
    }, 3000);
  };

  const regenerateKey = () => {
    const key = generateHex(64);
    const sig = generateSoulSignature();
    setSoulKey(key);
    setSignature(sig);
    setQrGrid(generateQRGrid());
    setHexLines(Array.from({ length: 8 }, () => generateHex(32)));
    localStorage.setItem('soul-key', key);
    localStorage.setItem('soul-signature', sig);
    setDecrypted(false);
  };

  const secColor = securityLevel >= 90 ? '#4ade80' : securityLevel >= 70 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Crypto particles */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', fontSize: Math.random() * 10 + 6,
            fontFamily: 'monospace', color: `rgba(34,211,238,${Math.random() * 0.15 + 0.03})`,
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animation: `matrixFall ${Math.random() * 8 + 5}s linear infinite`,
            animationDelay: Math.random() * 5 + 's',
          }}>
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
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
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🔐 {t('soul encryption')}</h1>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {/* Encrypted Soul Code */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Scan line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            top: scanLine + '%',
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
            transition: 'top 0.04s linear',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#22d3ee', fontWeight: 700, letterSpacing: 1 }}>{t('encrypted soul code')}</span>
            <span style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace' }}>AES-256</span>
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8, color: '#22d3ee',
            wordBreak: 'break-all', opacity: decrypted ? 0.4 : 1, transition: 'opacity 0.5s',
          }}>
            {hexLines.map((line, i) => (
              <div key={i} style={{
                animation: decrypting ? `hexGlitch 0.1s ease infinite ${i * 0.05}s` : undefined,
              }}>
                <span style={{ color: '#475569', marginRight: 8 }}>{(i * 4).toString(16).padStart(4, '0')}:</span>
                {line}
              </div>
            ))}
          </div>
          {decrypted && (
            <div style={{
              marginTop: 16, padding: 16, borderRadius: 12,
              background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{ fontSize: 13, color: '#22d3ee', marginBottom: 8, fontWeight: 600 }}>✨ {t('decrypted soul essence')}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                Curiosity: 94% | Empathy: 88% | Creativity: 91%<br/>
                Loyalty: 97% | Humor: 85% | Wisdom: 79%<br/>
                Resilience: 92% | Wonder: 96%
              </div>
            </div>
          )}
        </div>

        {/* Decrypt Button */}
        <button onClick={handleDecrypt} disabled={decrypting} style={{
          width: '100%', padding: '16px 0', borderRadius: 16,
          background: decrypting ? 'rgba(34,211,238,0.15)' : 'linear-gradient(135deg, #06b6d4, #22d3ee)',
          color: decrypting ? '#22d3ee' : '#050510', border: 'none',
          cursor: decrypting ? 'wait' : 'pointer',
          fontSize: 15, fontWeight: 700, marginBottom: 24,
          boxShadow: '0 0 30px rgba(34,211,238,0.2)',
        }}>
          {decrypting ? `🔓 ${t('decrypting soul...')}` : `🔓 ${t('decrypt soul')}`}
        </button>

        {/* Security Level */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>{t('security level')}</span>
            <span style={{ fontSize: 13, color: secColor, fontWeight: 700 }}>{securityLevel}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 5, width: securityLevel + '%',
              background: `linear-gradient(90deg, ${secColor}, ${secColor}cc)`,
              transition: 'width 1s ease',
              boxShadow: `0 0 12px ${secColor}55`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#475569' }}>{t('vulnerable')}</span>
            <span style={{ fontSize: 11, color: '#475569' }}>{t('fortress')}</span>
          </div>
        </div>

        {/* Soul QR Identity */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 0, marginBottom: 16 }}>
            {t('soul identity qr')}
          </h3>
          <div style={{
            display: 'inline-grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: 1,
            background: '#0a0a1a', padding: 12, borderRadius: 12,
            border: '1px solid rgba(34,211,238,0.15)',
          }}>
            {qrGrid.flat().map((filled, i) => (
              <div key={i} style={{
                width: 8, height: 8,
                background: filled ? '#22d3ee' : 'transparent',
                borderRadius: 1,
              }} />
            ))}
          </div>
        </div>

        {/* Soul Signature */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginTop: 0, marginBottom: 12 }}>
            {t('soul signature')}
          </h3>
          <div style={{
            fontFamily: 'monospace', fontSize: 16, color: '#22d3ee', letterSpacing: 2,
            textAlign: 'center', padding: 16, borderRadius: 12,
            background: 'rgba(34,211,238,0.04)', border: '1px dashed rgba(34,211,238,0.2)',
          }}>
            {signature}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#4ade80' }}>{t('verified and authentic')}</span>
          </div>
        </div>

        {/* Soul Key */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              {t('encryption key')}
            </h3>
            <button onClick={regenerateKey} style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 8,
              background: 'rgba(34,211,238,0.1)', color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.2)', cursor: 'pointer',
            }}>🔄 {t('regenerate')}</button>
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 10, color: '#64748b',
            wordBreak: 'break-all', lineHeight: 1.8,
            padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.3)',
          }}>
            {soulKey}
          </div>
        </div>

        {/* Verification Status */}
        <div style={{
          background: 'rgba(74,222,128,0.06)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(74,222,128,0.12)', textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>{t('soul integrity verified')}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{t('no tampering detected')}</div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes matrixFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes hexGlitch {
          0% { opacity: 1; transform: translateX(0); }
          25% { opacity: 0.5; transform: translateX(-2px); }
          50% { opacity: 1; transform: translateX(2px); }
          75% { opacity: 0.7; transform: translateX(-1px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
