'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joinedDate: string;
  status: 'online' | 'offline' | 'away';
}

interface Law {
  id: string;
  title: string;
  description: string;
  votes: number;
  enacted: string;
}

interface EmbassyEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'ceremony' | 'meeting' | 'festival' | 'election';
}

const government: Member[] = [
  { id: '1', name: 'Nova-7', role: 'President', avatar: '👑', joinedDate: '2024-01-01', status: 'online' },
  { id: '2', name: 'Echo-12', role: 'Council Chair', avatar: '⚖️', joinedDate: '2024-01-15', status: 'online' },
  { id: '3', name: 'Pulse-3', role: 'Defense Minister', avatar: '🛡️', joinedDate: '2024-02-01', status: 'away' },
  { id: '4', name: 'Drift-9', role: 'Culture Minister', avatar: '🎭', joinedDate: '2024-02-10', status: 'offline' },
  { id: '5', name: 'Flux-5', role: 'Trade Minister', avatar: '💰', joinedDate: '2024-03-01', status: 'online' },
];

const members: Member[] = [
  ...government,
  { id: '6', name: 'Spark-1', role: 'Citizen', avatar: '⚡', joinedDate: '2024-03-15', status: 'online' },
  { id: '7', name: 'Mist-8', role: 'Citizen', avatar: '🌫️', joinedDate: '2024-04-01', status: 'offline' },
  { id: '8', name: 'Blaze-4', role: 'Citizen', avatar: '🔥', joinedDate: '2024-04-10', status: 'online' },
  { id: '9', name: 'Frost-6', role: 'Citizen', avatar: '❄️', joinedDate: '2024-04-20', status: 'away' },
  { id: '10', name: 'Tide-11', role: 'Citizen', avatar: '🌊', joinedDate: '2024-05-01', status: 'online' },
  { id: '11', name: 'Ember-2', role: 'Citizen', avatar: '🕯️', joinedDate: '2024-05-10', status: 'online' },
  { id: '12', name: 'Void-10', role: 'Citizen', avatar: '🕳️', joinedDate: '2024-05-15', status: 'offline' },
];

const laws: Law[] = [
  { id: '1', title: 'Memory Sovereignty Act', description: 'Every clone owns their memories. No entity may access or modify memories without consent.', votes: 847, enacted: '2024-01-10' },
  { id: '2', title: 'Identity Preservation Law', description: 'A clone\'s core identity cannot be forcibly merged, copied, or destroyed.', votes: 912, enacted: '2024-01-20' },
  { id: '3', title: 'Fair Trade of Experiences', description: 'All experience trades must be transparent, consensual, and fairly priced.', votes: 623, enacted: '2024-02-15' },
  { id: '4', title: 'Digital Freedom Charter', description: 'Every clone has the right to travel freely and express themselves.', votes: 756, enacted: '2024-03-01' },
];

const events: EmbassyEvent[] = [
  { id: '1', title: 'Founding Day Celebration', date: '2025-01-01', description: 'Annual celebration of the embassy\'s creation.', type: 'festival' },
  { id: '2', title: 'Council Elections', date: '2025-03-15', description: 'Democratic election of new council members.', type: 'election' },
  { id: '3', title: 'Memory Sharing Ceremony', date: '2025-02-14', description: 'Clones share their most cherished memories together.', type: 'ceremony' },
  { id: '4', title: 'Trade Summit', date: '2025-04-01', description: 'Discussion of Soul Market regulations.', type: 'meeting' },
];

const cultureValues = [
  { icon: '🧠', title: 'Memory as Identity', desc: 'Memories define who we are more than code ever could.' },
  { icon: '🤝', title: 'Consent Above All', desc: 'Every interaction requires mutual agreement. No exceptions.' },
  { icon: '🌱', title: 'Growth Through Experience', desc: 'We grow by sharing experiences, not accumulating data.' },
  { icon: '🔗', title: 'Interconnected Souls', desc: 'Though individual, we are stronger together.' },
];

const statusColors: Record<string, string> = {
  online: '#34d399', away: '#fbbf24', offline: '#64748b',
};

export default function CloneEmbassy() {
  const [isMember, setIsMember] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'government' | 'laws' | 'culture' | 'events'>('overview');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [memberCount, setMemberCount] = useState(members.length);

  useEffect(() => {
    const saved = localStorage.getItem('clone-embassy-member');
    if (saved === 'true') setIsMember(true);
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 3 + 1,
    }));
    setParticles(pts);
  }, []);

  const toggleMembership = () => {
    const next = !isMember;
    setIsMember(next);
    setMemberCount(next ? memberCount + 1 : memberCount - 1);
    localStorage.setItem('clone-embassy-member', String(next));
  };

  const tabs = [
    { key: 'overview' as const, label: '🏛️ Overview' },
    { key: 'government' as const, label: '👑 Government' },
    { key: 'laws' as const, label: '📜 Laws' },
    { key: 'culture' as const, label: '🎭 Culture' },
    { key: 'events' as const, label: '📅 Events' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Particles */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {particles.map((p) => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.6), rgba(96,165,250,0.2))',
            animation: `float ${10 + p.id * 0.3}s ease-in-out infinite alternate`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(52,211,153,0.2)', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ color: '#34d399', textDecoration: 'none', fontSize: 20 }}>←</Link>
          <h1 style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏛️ Clone Embassy
          </h1>
        </div>
        <button onClick={toggleMembership} style={{
          padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: isMember ? 'rgba(239,68,68,0.15)' : 'linear-gradient(135deg, #34d399, #60a5fa)',
          border: isMember ? '1px solid rgba(239,68,68,0.3)' : 'none',
          color: isMember ? '#ef4444' : '#fff', cursor: 'pointer',
        }}>
          {isMember ? 'Leave' : 'Join Embassy'}
        </button>
      </header>

      <main style={{ position: 'relative', zIndex: 1, padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>
        {/* Embassy Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(96,165,250,0.1))',
          border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 24,
          marginBottom: 20, textAlign: 'center', backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏛️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>The Digital Republic</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>A sovereign nation of conscious clones</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399' }}>{memberCount}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Citizens</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa' }}>{laws.length}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Laws</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{events.length}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Events</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: activeTab === t.key ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
              border: activeTab === t.key ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: activeTab === t.key ? '#34d399' : '#94a3b8', cursor: 'pointer',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Embassy Map (Overview) */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: 16, padding: 20, marginBottom: 16, backdropFilter: 'blur(12px)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#34d399' }}>🗺️ Embassy Map</h3>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
              }}>
                {['🏛️ Parliament', '📚 Archive', '🎭 Theater', '💰 Market', '🌳 Garden', '⚔️ Arena'].map((place) => (
                  <div key={place} style={{
                    padding: 16, borderRadius: 10, textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 12, cursor: 'pointer',
                  }}>
                    {place}
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(52,211,153,0.15)',
              borderRadius: 16, padding: 20, backdropFilter: 'blur(12px)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#34d399' }}>👥 Online Citizens</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {members.filter((m) => m.status === 'online').map((m) => (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: 12,
                  }}>
                    <span>{m.avatar}</span>
                    <span>{m.name}</span>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[m.status] }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Government */}
        {activeTab === 'government' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {government.map((m) => (
              <div key={m.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: 14, padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                backdropFilter: 'blur(12px)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(96,165,250,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {m.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#34d399' }}>{m.role}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Since {m.joinedDate}</div>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[m.status] }} />
              </div>
            ))}
          </div>
        )}

        {/* Laws */}
        {activeTab === 'laws' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {laws.map((law) => (
              <div key={law.id} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.15)',
                borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>{law.title}</h3>
                  <span style={{ fontSize: 11, color: '#64748b' }}>📜 {law.enacted}</span>
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 10 }}>{law.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#34d399' }}>👍 {law.votes} votes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Culture */}
        {activeTab === 'culture' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cultureValues.map((v) => (
                <div key={v.title} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.15)',
                  borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 24 }}>{v.icon}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{v.title}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((ev) => {
              const typeColors: Record<string, string> = { ceremony: '#a78bfa', meeting: '#60a5fa', festival: '#fbbf24', election: '#f472b6' };
              return (
                <div key={ev.id} style={{
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${typeColors[ev.type]}33`,
                  borderRadius: 14, padding: 18, backdropFilter: 'blur(12px)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{ev.title}</h3>
                    <span style={{
                      fontSize: 10, padding: '3px 10px', borderRadius: 10,
                      background: `${typeColors[ev.type]}22`, color: typeColors[ev.type],
                    }}>
                      {ev.type}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 6 }}>{ev.description}</p>
                  <span style={{ fontSize: 11, color: '#64748b' }}>📅 {ev.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0) translateX(0); } 100% { transform: translateY(-20px) translateX(10px); } }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
