'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Memories() {
  const [activeTab, setActiveTab] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newMemory, setNewMemory] = useState('')
  const [memories, setMemories] = useState([
    { id: 1, text: 'The day I graduated — my parents were so proud. I remember mom crying happy tears.', category: 'milestone', mood: '😊', date: '2024-03-15' },
    { id: 2, text: 'My first bike ride without training wheels. I fell 3 times but never gave up.', category: 'childhood', mood: '🚲', date: '2010-06-20' },
    { id: 3, text: 'The smell of grandma\'s kitchen during Eid. Her biryani was legendary.', category: 'family', mood: '🍚', date: '2015-09-10' },
    { id: 4, text: 'When I decided to quit my job and start building something of my own.', category: 'decision', mood: '💪', date: '2025-01-05' },
    { id: 5, text: 'The night sky in Cox\'s Bazar — I had never seen so many stars.', category: 'travel', mood: '✨', date: '2022-12-25' },
  ])

  const addMemory = () => {
    if (!newMemory.trim()) return
    const memory = {
      id: Date.now(),
      text: newMemory,
      category: 'personal',
      mood: '📝',
      date: new Date().toISOString().split('T')[0],
    }
    setMemories([memory, ...memories])
    setNewMemory('')
    setShowAdd(false)
  }

  const filtered = activeTab === 'all' ? memories : memories.filter(m => m.category === activeTab)

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold gradient-text">Consciousness Clone</Link>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-white/60 hover:text-white transition">Dashboard</Link>
            <Link href="/chat" className="text-white/60 hover:text-white transition">Chat</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Memories 📝</h1>
            <p className="text-white/60">{memories.length} memories stored</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-6 py-3 bg-primary rounded-full font-semibold hover:bg-primary/80 transition"
          >
            + Add Memory
          </button>
        </div>

        {/* Add Memory Form */}
        {showAdd && (
          <div className="glass rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">New Memory</h3>
            <textarea
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition resize-none"
              rows={4}
              placeholder="Write your memory here... What happened? How did you feel?"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={addMemory} className="px-6 py-2 bg-primary rounded-lg hover:bg-primary/80 transition">
                Save Memory
              </button>
              <button onClick={() => setShowAdd(false)} className="px-6 py-2 glass rounded-lg hover:bg-white/10 transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {['all', 'childhood', 'family', 'milestone', 'travel', 'decision'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === tab ? 'bg-primary' : 'glass hover:bg-white/10'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Memory List */}
        <div className="space-y-4">
          {filtered.map((memory) => (
            <div key={memory.id} className="glass rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{memory.mood}</div>
                <div className="flex-1">
                  <p className="text-white/80 text-lg leading-relaxed">{memory.text}</p>
                  <div className="flex gap-4 mt-3 text-sm text-white/40">
                    <span>{memory.date}</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded">{memory.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
