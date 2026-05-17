'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface Alert { id: string; type: 'warning' | 'danger' | 'info'; title: string; message: string; timestamp: string; prevented: boolean; risk: number; }
interface GuardianStats { warningsGiven: number; decisionsPrevented: number; shieldStrength: number; daysActive: number; }

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', type: 'danger', title: 'Impulse Purchase Blocked', message: 'You were about to spend $340 on something you\'d regret. I paused the checkout — take 24 hours to think.', timestamp: '2026-05-17T15:30:00', prevented: true, risk: 85 },
  { id: '2', type: 'warning', title: 'Late Night Decision', message: 'Sending that message at 2am isn\'t wise. Save it as draft and revisit tomorrow.', timestamp: '2026-05-16T02:15:00', prevented: true, risk: 72 },
  { id: '3', type: 'info', title: 'Healthy Choice Detected', message: 'Great job choosing the gym over Netflix today! This aligns with your goals.', timestamp: '2026-05-15T18:00:00', prevented: false, risk: 10 },
  { id: '4', type: 'danger', title: 'Stress Spending Alert', message: 'Your spending pattern shows stress-based purchasing. Consider taking a break.', timestamp: '2026-05-14T21:45:00', prevented: true, risk: 90 },
  { id: '5', type: 'warning', title: 'Sleep Schedule Alert', message: 'You\'ve been staying up past midnight for 5 days. Your health comes first.', timestamp: '2026-05-13T23:30:00', prevented: false, risk: 55 },
];

export default function CloneGuardianPage() {
  const t = useT();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<GuardianStats>({ warningsGiven: 0, decisionsPrevented: 0, shieldStrength: 0, daysActive: 0 });
  const [wingFlap, setWingFlap] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('guardian-alerts');
    const alertsData = stored ? JSON.parse(stored) : DEFAULT_ALERTS;
    setAlerts(alertsData);
    if (!stored) localStorage.setItem('guardian-alerts', JSON.stringify(DEFAULT_ALERTS));

    const s = localStorage.getItem('guardian-stats');
    if (s) setStats(JSON.parse(s));
    else {
      const ns: GuardianStats = { warningsGiven: alertsData.length, decisionsPrevented: alertsData.filter((a: Alert) => a.prevented).length, shieldStrength: 87, daysActive: 42 };
      setStats(ns);
      localStorage.setItem('guardian-stats', JSON.stringify(ns));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setWingFlap(p => (p + 1) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (type: string) => type === 'danger' ? '#EF5350' : type === 'warning' ? '#FFB74D' : '#4FC3F7';
  const getAlertIcon = (type: string) => type === 'danger' ? '🛡️' : type === 'warning' ? '⚠️' : '✨';
  const getRiskColor = (r: number) => r >= 80 ? '#EF5350' : r >= 50 ? '#FFB74D' : '#81C784';

  const shieldPct = stats.shieldStrength;
  const shieldColor = shieldPct >= 80 ? '#81C784' : shieldPct >= 50 ? '#FFB74D' : '#EF5350';

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes floatP { 0%{transform:translateY(0) rotate(0);opacity:0}20%{opacity:.5}80%{opacity:.5}100%{transform:translateY(-100vh) rotate(360deg);opacity:0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)} }
        @keyframes shieldPulse { 0%,100%{filter:drop-shadow(0 0 8px ${shieldColor}40)}50%{filter:drop-shadow(0 0 20px ${shieldColor}60)} }
        @keyframes wingFloat { 0%,100%{transform:rotate(-5deg) translateY(0)}50%{transform:rotate(5deg) translateY(-8px)} }
        .alert-card:hover { transform: translateY(-2px) !important; border-color: rgba(255,255,255,0.2) !important; }
      `}</style>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: 'absolute', width: 3, height: 3, borderRadius: '50%', background: i % 2 === 0 ? '#81C784' : '#FFD54F', left: `${Math.random() * 100}%`, animation: `floatP ${5 + Math.random() * 6}s linear ${Math.random() * 5}s infinite` }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/dashboard" style={{ color: '#888', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🛡️ {t('guardian angel')}</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{t('protection')}</p>
        </div>
      </div>

      <div style={{ padding: 20, maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Angel Wing Visualization */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 30, textAlign: 'center', marginBottom: 24, backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 30%, #81C78410, transparent 60%)' }} />
          {/* Wings */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16, animation: 'wingFloat 4s ease-in-out infinite' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
              <div style={{ fontSize: 50, transform: 'scaleX(-1)', filter: `drop-shadow(0 0 10px ${shieldColor}30)`, animation: 'shieldPulse 3s ease-in-out infinite' }}>🪽</div>
              <div style={{ fontSize: 60, animation: 'shieldPulse 3s ease-in-out infinite', filter: `drop-shadow(0 0 15px ${shieldColor}40)` }}>🛡️</div>
              <div style={{ fontSize: 50, filter: `drop-shadow(0 0 10px ${shieldColor}30)`, animation: 'shieldPulse 3s ease-in-out infinite' }}>🪽</div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{t('guardian angel')}</div>
          <div style={{ fontSize: 13, color: '#81C784', marginBottom: 16 }}>Protecting you for {stats.daysActive} days</div>
          {/* Shield Strength Meter */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, height: 10, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${shieldPct}%`, background: `linear-gradient(90deg, ${shieldColor}, #fff)`, borderRadius: 10, transition: 'width 1s ease', boxShadow: `0 0 12px ${shieldColor}60` }} />
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>Shield Strength: <span style={{ color: shieldColor, fontWeight: 700 }}>{shieldPct}%</span></div>
        </div>

        {/* Guardian Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Warnings Given', value: stats.warningsGiven, icon: '⚠️', color: '#FFB74D' },
            { label: 'Decisions Prevented', value: stats.decisionsPrevented, icon: '🛡️', color: '#81C784' },
            { label: 'Risk Assessments', value: alerts.length, icon: '🔍', color: '#4FC3F7' },
            { label: 'Active Since', value: `${stats.daysActive}d`, icon: '📅', color: '#B39DDB' },
          ].map((s, i) => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '16px',
              backdropFilter: 'blur(10px)', animation: `slideUp 0.4s ease ${i * 0.08}s both`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Alerts */}
        <div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600 }}>{t('alert')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((alert, i) => {
              const color = getAlertColor(alert.type);
              return (
                <div key={alert.id} className="alert-card"
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: `1px solid ${alert.prevented ? color + '20' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 16, padding: '16px', backdropFilter: 'blur(10px)', animation: `slideUp 0.4s ease ${i * 0.06}s both`,
                    transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                  }}>
                  {alert.prevented && <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color, borderRadius: '0 2px 2px 0' }} />}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}12`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{getAlertIcon(alert.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{alert.title}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: getRiskColor(alert.risk), background: `${getRiskColor(alert.risk)}12`, padding: '2px 8px', borderRadius: 8 }}>Risk {alert.risk}%</div>
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#999', lineHeight: 1.5 }}>{alert.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 10, color: '#666' }}>{new Date(alert.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {alert.prevented && <span style={{ fontSize: 10, background: 'rgba(129,199,132,0.15)', color: '#81C784', padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>✓ Prevented</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guardian Message */}
        <div style={{ marginTop: 24, background: 'rgba(129,199,132,0.05)', border: '1px solid rgba(129,199,132,0.15)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👼</div>
          <p style={{ margin: 0, fontSize: 13, color: '#aaa', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;{t('watch over')}&rdquo;
          </p>
          <div style={{ fontSize: 12, color: '#81C784', marginTop: 8, fontWeight: 600 }}>— {t('guardian angel')}</div>
        </div>
      </div>
    </div>
  );
}
