'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useT } from '../../lib/language-context';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  memories: { id: string; text: string; date: string }[];
  children: string[];
  color: string;
}

const RELATION_COLORS: Record<string, string> = {
  self: '#a78bfa',
  parent: '#f472b6',
  sibling: '#38bdf8',
  grandparent: '#fbbf24',
  child: '#34d399',
  spouse: '#f87171',
  uncle: '#818cf8',
  cousin: '#2dd4bf',
};

function getDefaultTree(): FamilyMember[] {
  return [
    { id: '1', name: 'You', relation: 'self', memories: [
      { id: 'm1', text: 'Started this legacy tree', date: '2024-01-01' },
      { id: 'm2', text: 'Remembered grandma\'s stories', date: '2024-02-14' },
    ], children: [], color: RELATION_COLORS.self },
    { id: '2', name: 'Mom', relation: 'parent', memories: [
      { id: 'm3', text: 'Best cook in the family', date: '2023-12-25' },
    ], children: ['1'], color: RELATION_COLORS.parent },
    { id: '3', name: 'Dad', relation: 'parent', memories: [
      { id: 'm4', text: 'Taught me to ride a bike', date: '2023-06-15' },
    ], children: ['1'], color: RELATION_COLORS.parent },
    { id: '4', name: 'Grandma Rose', relation: 'grandparent', memories: [
      { id: 'm5', text: 'Garden full of roses', date: '2022-04-10' },
      { id: 'm6', text: 'Sunday morning pancakes', date: '2022-03-20' },
    ], children: ['2'], color: RELATION_COLORS.grandparent },
    { id: '5', name: 'Grandpa Joe', relation: 'grandparent', memories: [
      { id: 'm7', text: 'War stories by the fireplace', date: '2022-01-15' },
    ], children: ['3'], color: RELATION_COLORS.grandparent },
    { id: '6', name: 'Sister Sara', relation: 'sibling', memories: [
      { id: 'm8', text: 'Childhood adventures', date: '2023-08-20' },
    ], children: [], color: RELATION_COLORS.sibling },
    { id: '7', name: 'Uncle Tom', relation: 'uncle', memories: [
      { id: 'm9', text: 'Family reunions', date: '2023-07-04' },
    ], children: [], color: RELATION_COLORS.uncle },
  ];
}

function TreeNode({ member, allMembers, depth, offsetX, onAddMemory, selectedMember, setSelectedMember }: {
  member: FamilyMember;
  allMembers: FamilyMember[];
  depth: number;
  offsetX: number;
  onAddMemory: (id: string) => void;
  selectedMember: string | null;
  setSelectedMember: (id: string | null) => void;
}) {
  const children = allMembers.filter((m) => member.children.includes(m.id));
  const isSelected = selectedMember === member.id;
  const nodeSize = 70;

  return (
    <g>
      {/* Branches to children */}
      {children.map((child, i) => {
        const childIdx = allMembers.findIndex((m) => m.id === child.id);
        const childX = offsetX + (i - (children.length - 1) / 2) * 120;
        const childY = (depth + 1) * 130 + 60;
        const nodeX = offsetX;
        const nodeY = depth * 130 + 60;
        return (
          <g key={`branch-${member.id}-${child.id}`}>
            {/* Animated branch line */}
            <path
              d={`M ${nodeX} ${nodeY + nodeSize / 2} C ${nodeX} ${nodeY + 80}, ${childX} ${childY - 40}, ${childX} ${childY - nodeSize / 2}`}
              fill="none"
              stroke={member.color}
              strokeWidth={2}
              opacity={0.3}
              strokeDasharray="6 4"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="10" dur="4s" repeatCount="indefinite" />
            </path>
            {/* Leaves (memories) on branch */}
            {child.memories.slice(0, 3).map((mem, mi) => {
              const t = 0.3 + mi * 0.25;
              const lx = nodeX + (childX - nodeX) * t + (Math.random() - 0.5) * 30;
              const ly = nodeY + (childY - nodeY) * t + (Math.random() - 0.5) * 20;
              return (
                <g key={`leaf-${mem.id}`}>
                  <ellipse
                    cx={lx} cy={ly} rx={8} ry={5}
                    fill={`${child.color}44`} stroke={child.color} strokeWidth={0.5}
                    opacity={0.6}
                  >
                    <animate attributeName="ry" values="5;6;5" dur={`${3 + mi}s`} repeatCount="indefinite" />
                  </ellipse>
                </g>
              );
            })}
            <TreeNode
              member={child} allMembers={allMembers} depth={depth + 1}
              offsetX={childX} onAddMemory={onAddMemory}
              selectedMember={selectedMember} setSelectedMember={setSelectedMember}
            />
          </g>
        );
      })}

      {/* Node */}
      <g
        onClick={() => setSelectedMember(isSelected ? null : member.id)}
        style={{ cursor: 'pointer' }}
      >
        {/* Glow */}
        <circle cx={offsetX} cy={depth * 130 + 60} r={nodeSize / 2 + 8}
          fill={`${member.color}11`} stroke={`${member.color}33`} strokeWidth={1}>
          <animate attributeName="r" values={`${nodeSize / 2 + 8};${nodeSize / 2 + 14};${nodeSize / 2 + 8}`}
            dur="4s" repeatCount="indefinite" />
        </circle>
        {/* Main circle */}
        <circle cx={offsetX} cy={depth * 130 + 60} r={nodeSize / 2}
          fill={`${member.color}22`} stroke={member.color} strokeWidth={2}
        />
        {/* Memory count leaves */}
        {member.memories.length > 0 && (
          <g>
            {Array.from({ length: Math.min(member.memories.length, 5) }).map((_, i) => {
              const angle = (i / Math.min(member.memories.length, 5)) * Math.PI * 2 - Math.PI / 2;
              const lx = offsetX + Math.cos(angle) * (nodeSize / 2 + 16);
              const ly = depth * 130 + 60 + Math.sin(angle) * (nodeSize / 2 + 16);
              return (
                <ellipse key={`nodeleaf-${i}`} cx={lx} cy={ly} rx={6} ry={4}
                  fill={`${member.color}55`} stroke={member.color} strokeWidth={0.5} opacity={0.7}>
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur={`${2 + i}s`} repeatCount="indefinite" />
                </ellipse>
              );
            })}
          </g>
        )}
        {/* Name */}
        <text x={offsetX} y={depth * 130 + 58} textAnchor="middle"
          fill={member.color} fontSize={11} fontWeight={700}>
          {member.name}
        </text>
        <text x={offsetX} y={depth * 130 + 72} textAnchor="middle"
          fill="#64748b" fontSize={9} style={{ textTransform: 'capitalize' }}>
          {member.relation}
        </text>
      </g>
    </g>
  );
}

export default function LegacyTree() {
  const t = useT();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddMemory, setShowAddMemory] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('parent');
  const [parentId, setParentId] = useState('1');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const stored = localStorage.getItem('legacy-tree');
    setMembers(stored ? JSON.parse(stored) : getDefaultTree());
  }, []);

  useEffect(() => {
    if (members.length > 0) localStorage.setItem('legacy-tree', JSON.stringify(members));
  }, [members]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { dragging.current = false; };

  const addMember = () => {
    if (!newName.trim()) return;
    const color = RELATION_COLORS[newRelation] || '#a78bfa';
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newName,
      relation: newRelation,
      memories: [],
      children: [],
      color,
    };
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === parentId ? { ...m, children: [...m.children, newMember.id] } : m
      );
      return [...updated, newMember];
    });
    setNewName('');
    setShowAdd(false);
  };

  const addMemory = () => {
    if (!newMemoryText.trim() || !showAddMemory) return;
    setMembers((prev) =>
      prev.map((m) =>
        m.id === showAddMemory
          ? { ...m, memories: [...m.memories, { id: Date.now().toString(), text: newMemoryText, date: new Date().toISOString().split('T')[0] }] }
          : m
      )
    );
    setNewMemoryText('');
    setShowAddMemory(null);
  };

  const selected = members.find((m) => m.id === selectedMember);
  const rootMember = members.find((m) => m.relation === 'self');

  return (
    <div style={{
      minHeight: '100vh', background: '#050510', color: '#e2e8f0',
      fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.08), transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(5, 5, 16, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(52, 211, 153, 0.15)', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/dashboard" style={{ color: '#34d399', fontSize: 22, textDecoration: 'none' }}>←</Link>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #34d399, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🌳 {t('legacy tree')}
            </h1>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{members.length} members · {members.reduce((s, m) => s + m.memories.length, 0)} memories</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2))} style={{
            width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 16, cursor: 'pointer',
          }}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))} style={{
            width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 16, cursor: 'pointer',
          }}>−</button>
          <button onClick={() => setShowAdd(true)} style={{
            width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: 16, cursor: 'pointer',
          }}>+</button>
        </div>
      </div>

      {/* Tree Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%', height: 'calc(100vh - 180px)', cursor: dragging.current ? 'grabbing' : 'grab',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <svg
          width="100%" height="100%"
          viewBox="0 0 600 500"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Roots */}
          <g opacity={0.15}>
            <path d="M 300 480 Q 200 500 120 520" fill="none" stroke="#34d399" strokeWidth={3} />
            <path d="M 300 480 Q 350 505 450 520" fill="none" stroke="#34d399" strokeWidth={2} />
            <path d="M 300 480 Q 280 510 250 530" fill="none" stroke="#34d399" strokeWidth={2} />
          </g>

          {rootMember && (
            <TreeNode
              member={rootMember} allMembers={members} depth={0}
              offsetX={300} onAddMemory={(id) => setShowAddMemory(id)}
              selectedMember={selectedMember} setSelectedMember={setSelectedMember}
            />
          )}
        </svg>
      </div>

      {/* Member Detail Panel */}
      {selected && (
        <div
          onClick={() => setSelectedMember(null)}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
            background: 'rgba(5, 5, 16, 0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 15, 35, 0.95)', border: `1px solid ${selected.color}44`,
              borderRadius: '20px 20px 0 0', padding: 24, maxWidth: 400, width: '100%',
              maxHeight: '60vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: `${selected.color}22`, border: `2px solid ${selected.color}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: selected.color,
              }}>
                {selected.name[0]}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{selected.name}</h3>
                <span style={{ fontSize: 11, color: selected.color, textTransform: 'capitalize' }}>{selected.relation}</span>
              </div>
            </div>

            <h4 style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 1 }}>
              🍃 {t('branches')} ({selected.memories.length})
            </h4>
            {selected.memories.length === 0 ? (
              <p style={{ fontSize: 13, color: '#475569', textAlign: 'center', padding: 16 }}>{t('roots')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.memories.map((mem) => (
                  <div key={mem.id} style={{
                    padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <p style={{ fontSize: 13, margin: 0, color: '#e2e8f0' }}>{mem.text}</p>
                    <p style={{ fontSize: 10, color: '#475569', margin: '4px 0 0' }}>{mem.date}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setShowAddMemory(selected.id)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, ${selected.color}88, ${selected.color}44)`,
                  color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >🍃 Add Memory</button>
              <button
                onClick={() => {
                  setMembers((prev) => prev.filter((m) => m.id !== selected.id));
                  setSelectedMember(null);
                }}
                style={{
                  padding: '10px 16px', borderRadius: 12,
                  border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{
          position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(5,5,16,0.8)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: 20, padding: 28, maxWidth: 340, width: '100%',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', textAlign: 'center',
              background: 'linear-gradient(135deg, #34d399, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🌱 {t('family memory')}
            </h3>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)',
                background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
            <select value={newRelation} onChange={(e) => setNewRelation(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)',
                background: 'rgba(5,5,16,0.9)', color: '#e2e8f0', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}>
              {Object.keys(RELATION_COLORS).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)',
                background: 'rgba(5,5,16,0.9)', color: '#e2e8f0', fontSize: 14, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
            </select>
            <button onClick={addMember} style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #34d399, #fbbf24)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>🌳 {t('grow')}</button>
          </div>
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddMemory && (
        <div onClick={() => setShowAddMemory(null)} style={{
          position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(5,5,16,0.8)',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: 20, padding: 28, maxWidth: 340, width: '100%',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', textAlign: 'center',
              background: 'linear-gradient(135deg, #34d399, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🍃 Add Memory Leaf
            </h3>
            <textarea value={newMemoryText} onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="Write a memory..." rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)',
                background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: 14, outline: 'none',
                marginBottom: 16, boxSizing: 'border-box', resize: 'none' }} />
            <button onClick={addMemory} style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #34d399, #fbbf24)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>🍃 Add Memory</button>
          </div>
        </div>
      )}
    </div>
  );
}
