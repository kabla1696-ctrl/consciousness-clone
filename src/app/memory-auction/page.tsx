'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = ['Life Lessons', 'Travel', 'Love', 'Career', 'Funny'];
const CAT_ICONS: Record<string, string> = { 'Life Lessons': '💡', 'Travel': '✈️', 'Love': '❤️', 'Career': '🚀', 'Funny': '😂' };

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  seller: string;
  currentBid: number;
  bidCount: number;
  endTime: number;
  bids: { user: string; amount: number }[];
}

const SEED: Omit<Auction, 'bids'>[] = [
  { id: '1', title: 'The Night I Saw the Northern Lights', description: 'Standing on a frozen lake in Iceland, the sky erupted in green and purple. I wept.', category: 'Travel', seller: 'AuroraSeeker', currentBid: 340, bidCount: 12, endTime: Date.now() + 86400000 },
  { id: '2', title: 'My Grandmother\'s Last Words', description: '"Be kind, even when no one is watching." Changed my entire life philosophy.', category: 'Life Lessons', seller: 'MemoryKeeper', currentBid: 890, bidCount: 27, endTime: Date.now() + 43200000 },
  { id: '3', title: 'First Kiss Under Rain', description: 'We got caught in a downpour outside a café in Paris. Neither of us wanted an umbrella.', category: 'Love', seller: 'ParisDreamer', currentBid: 520, bidCount: 19, endTime: Date.now() + 72000000 },
  { id: '4', title: 'The Interview That Changed Everything', description: 'I bombed 14 interviews before landing my dream job. This one was different.', category: 'Career', seller: 'GoGetter', currentBid: 210, bidCount: 8, endTime: Date.now() + 108000000 },
  { id: '5', title: 'The Time I Accidentally Joined a Cult', description: 'Thought it was a yoga retreat. It was... not. But the food was incredible.', category: 'Funny', seller: 'LostTourist', currentBid: 670, bidCount: 34, endTime: Date.now() + 36000000 },
  { id: '6', title: 'Learning to Swim at 30', description: 'Overcoming a lifelong fear of water. The ocean doesn\'t scare me anymore.', category: 'Life Lessons', seller: 'LateBloomer', currentBid: 155, bidCount: 6, endTime: Date.now() + 144000000 },
];

export default function MemoryAuctionPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [bidModal, setBidModal] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [credits, setCredits] = useState(5000);

  useEffect(() => {
    const stored = localStorage.getItem('memory-auctions');
    if (stored) {
      setAuctions(JSON.parse(stored));
    } else {
      const seeded = SEED.map(s => ({ ...s, bids: [{ user: 'SeedBidder', amount: s.currentBid - 50 }] }));
      setAuctions(seeded);
      localStorage.setItem('memory-auctions', JSON.stringify(seeded));
    }
    const c = localStorage.getItem('memory-credits');
    if (c) setCredits(Number(c));
  }, []);

  const saveAuctions = (a: Auction[]) => {
    setAuctions(a);
    localStorage.setItem('memory-auctions', JSON.stringify(a));
  };

  const placeBid = () => {
    if (!bidModal || !bidAmount) return;
    const amount = Number(bidAmount);
    if (amount <= bidModal.currentBid || amount > credits) return;
    const updated = auctions.map(a => {
      if (a.id === bidModal.id) {
        return { ...a, currentBid: amount, bidCount: a.bidCount + 1, bids: [...a.bids, { user: 'You', amount }] };
      }
      return a;
    });
    saveAuctions(updated);
    const newCredits = credits - amount;
    setCredits(newCredits);
    localStorage.setItem('memory-credits', String(newCredits));
    setBidModal(null);
    setBidAmount('');
  };

  const filtered = activeCategory === 'All' ? auctions : auctions.filter(a => a.category === activeCategory);
  const leaderboard = [...auctions].sort((a, b) => b.currentBid - a.currentBid).slice(0, 5);

  const timeLeft = (end: number) => {
    const diff = end - Date.now();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#e0e0e0', fontFamily: 'system-ui' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .auction-card{backdrop-filter:blur(20px);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;transition:all .3s}
        .auction-card:hover{transform:translateY(-4px);border-color:rgba(139,92,246,.4);box-shadow:0 8px 32px rgba(139,92,246,.15)}
        .cat-pill{padding:8px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);cursor:pointer;transition:all .2s;font-size:13px}
        .cat-pill.active{background:linear-gradient(135deg,#8b5cf6,#6366f1);border-color:transparent;color:#fff}
        .bid-btn{padding:12px 28px;border-radius:12px;border:none;background:linear-gradient(135deg,#8b5cf6,#6366f1);color:#fff;font-weight:600;font-size:15px;cursor:pointer;transition:all .2s}
        .bid-btn:hover{transform:scale(1.03);box-shadow:0 4px 20px rgba(139,92,246,.4)}
        .bid-btn:disabled{opacity:.4;cursor:default;transform:none;box-shadow:none}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px}
        .modal-box{background:rgba(15,15,35,.95);border:1px solid rgba(139,92,246,.3);border-radius:20px;padding:28px;max-width:400px;width:100%}
        .bid-input{width:100%;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font-size:16px;outline:none;box-sizing:border-box}
        .bid-input:focus{border-color:#8b5cf6}
      `}</style>

      {/* Particles */}
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed', width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          borderRadius: '50%', background: `rgba(139,92,246,${0.15 + Math.random() * 0.25})`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite ${Math.random() * 3}s`
        }} />
      ))}

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(20px)', background: 'rgba(5,5,16,.8)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/dashboard" style={{ color: '#a78bfa', fontSize: 22, textDecoration: 'none' }}>←</Link>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg,#c084fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Memory Auction</h1>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Trade unforgettable moments</p>
        </div>
        <div style={{ marginLeft: 'auto', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)', borderRadius: 12, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: '#c084fc' }}>
          💰 {credits.toLocaleString()} CR
        </div>
      </header>

      <main style={{ padding: '20px', maxWidth: 600, margin: '0 auto' }}>
        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} className={`cat-pill${activeCategory === c ? ' active' : ''}`} onClick={() => setActiveCategory(c)}>
              {c !== 'All' && CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#a78bfa', marginBottom: 12 }}>🏆 Top Auctions</h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {leaderboard.map((a, i) => (
              <div key={a.id} style={{
                minWidth: 150, padding: 14, borderRadius: 14,
                background: i === 0 ? 'linear-gradient(135deg,rgba(250,204,21,.12),rgba(250,204,21,.04))' : 'rgba(255,255,255,.03)',
                border: `1px solid ${i === 0 ? 'rgba(250,204,21,.25)' : 'rgba(255,255,255,.06)'}`,
                flexShrink: 0
              }}>
                <div style={{ fontSize: 11, color: '#888' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#facc15', marginTop: 4 }}>{a.currentBid} CR</div>
              </div>
            ))}
          </div>
        </div>

        {/* Auction Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(a => (
            <div key={a.id} className="auction-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#a78bfa', background: 'rgba(139,92,246,.12)', padding: '3px 10px', borderRadius: 8 }}>{CAT_ICONS[a.category]} {a.category}</span>
                </div>
                <span style={{ fontSize: 12, color: '#888' }}>by {a.seller}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{a.title}</h3>
              <p style={{ fontSize: 13, color: '#999', margin: '0 0 14px', lineHeight: 1.5 }}>{a.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div><span style={{ fontSize: 11, color: '#666' }}>Current Bid</span><div style={{ fontSize: 18, fontWeight: 700, color: '#c084fc' }}>{a.currentBid} CR</div></div>
                  <div><span style={{ fontSize: 11, color: '#666' }}>Bids</span><div style={{ fontSize: 18, fontWeight: 700 }}>{a.bidCount}</div></div>
                  <div><span style={{ fontSize: 11, color: '#666' }}>Time Left</span><div style={{ fontSize: 15, fontWeight: 600, color: timeLeft(a.endTime) === 'Ended' ? '#ef4444' : '#34d399' }}>{timeLeft(a.endTime)}</div></div>
                </div>
                <button className="bid-btn" onClick={() => setBidModal(a)} style={{ padding: '10px 20px', fontSize: 13 }}>Bid</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bid Modal */}
      {bidModal && (
        <div className="modal-overlay" onClick={() => setBidModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Place Your Bid</h3>
            <p style={{ fontSize: 13, color: '#999', margin: '0 0 16px' }}>{bidModal.title}</p>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>Current: <strong style={{ color: '#c084fc' }}>{bidModal.currentBid} CR</strong> · Min: {bidModal.currentBid + 10} CR</p>
            <input className="bid-input" type="number" placeholder={`Min ${bidModal.currentBid + 10} CR`} value={bidAmount} onChange={e => setBidAmount(e.target.value)} min={bidModal.currentBid + 10} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setBidModal(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: '#999', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
              <button className="bid-btn" disabled={!bidAmount || Number(bidAmount) <= bidModal.currentBid || Number(bidAmount) > credits} onClick={placeBid} style={{ flex: 1 }}>Confirm Bid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
